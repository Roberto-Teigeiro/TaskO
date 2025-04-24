///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/Sprints.tsx
import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
// Eliminados los iconos no utilizados
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ChevronRight, Users, CircleDot, X, Trash2, Edit } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskDialog } from "@/components/pages/home/AddTask"
import { AddSprintDialog } from "@/components/pages/home/AddSprint"
import { useAuth } from "@clerk/clerk-react"
import { sprintApi, taskApi } from "@/components/services/api"
import { toast } from "@/components/ui/use-toast"

// Definición de type alias para reemplazar union types
type TaskStatusType = "Not Started" | "In Progress" | "Completed";
type TaskPriorityType = "Extreme" | "High" | "Moderate" | "Low";
type SprintStatusType = "Active" | "Completed" | "Planned";

// Interfaces para datos de la API
export interface ApiTask {
  id: string
  title: string
  sprintId: string
  description: string
  priority: string // API usa string
  status: string // API usa string
  createdOn: string
  image?: string
  assignee?: string
  storyPoints?: number
  objective?: string
  fullDescription?: string
  additionalNotes?: string[]
  deadline?: string
}

export interface ApiSprint {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number
  status: string // API usa string
  tasks: ApiTask[]
}

// Interfaces para uso interno del componente con tipos específicos
interface Task {
  id: string
  title: string
  sprintId: string
  description: string
  priority: TaskPriorityType
  status: TaskStatusType
  createdOn: string
  image?: string
  assignee?: string
  storyPoints?: number
  objective?: string
  fullDescription?: string
  additionalNotes?: string[]
  deadline?: string
}

interface SprintType {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "Active" | "Completed" | "Planned";
  tasks: Task[];
}
// Funciones de conversión entre tipos de API y tipos de componente
function convertApiTaskToTask(apiTask: ApiTask): Task {
  return {
    ...apiTask,
    priority: apiTask.priority as TaskPriorityType,
    status: apiTask.status as TaskStatusType
  };
}

function convertApiSprintToSprint(apiSprint: ApiSprint): SprintType {
  return {
    ...apiSprint,
    status: apiSprint.status as SprintStatusType,
    tasks: apiSprint.tasks.map(convertApiTaskToTask)
  };
}

// Función auxiliar para actualizar tareas de un sprint (evita anidamiento)
function updateSprintTasks(prevSprints: SprintType[], sprintId: string, updater: (tasks: Task[]) => Task[]): SprintType[] {
  return prevSprints.map(sprint => {
    if (sprint.id === sprintId) {
      return {
        ...sprint,
        tasks: updater(sprint.tasks)
      };
    }
    return sprint;
  });
}

// Función auxiliar para mapear tareas con estado actualizado (reduce anidamiento)
function mapTasksWithUpdatedStatus(tasks: Task[], taskId: string, updatedTask: Task): Task[] {
  return tasks.map(task => task.id === taskId ? updatedTask : task);
}

export default function Sprints() {
  const { isSignedIn } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sprints, setSprints] = useState<SprintType[]>([])
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Cargar sprints al montar el componente
  useEffect(() => {
    if (isSignedIn) {
      loadSprints()
    }
  }, [isSignedIn])

  const loadSprints = async () => {
    try {
      setLoading(true)
      const apiData = await sprintApi.getAllSprints()
      // Convertir datos de la API al formato del componente
      const sprintData = apiData.map(convertApiSprintToSprint)
      setSprints(sprintData)
    } catch (error) {
      console.error("Error loading sprints:", error)
      toast({
        id: crypto.randomUUID(),
        title: "Error",
        description: "Failed to load sprints. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función modificada para solucionar incompatibilidad de tipos con AddSprintDialog
  const handleAddSprint = (newSprint: any) => {
    // Asegurarse que el id sea string
    const sprintToCreate: SprintType = {
      ...newSprint,
      id: String(newSprint.id), // Convertir a string si es un número
      status: newSprint.status as SprintStatusType,
      tasks: newSprint.tasks ?? []
    };
    
    createSprintAsync(sprintToCreate);
  }
  
  // Función separada para manejar la operación asíncrona (reduce anidamiento)
  const createSprintAsync = async (sprint: SprintType) => {
    try {
      // Convertir al formato de la API
      const apiSprint = {
        ...sprint,
        status: sprint.status as string,
        tasks: sprint.tasks.map(task => ({
          ...task,
          priority: task.priority as string,
          status: task.status as string
        }))
      }
      
      const createdApiSprint = await sprintApi.createSprint(apiSprint)
      const createdSprint = convertApiSprintToSprint(createdApiSprint)
      
      setSprints((prevSprints) => [...prevSprints, createdSprint])
      toast({
        id: crypto.randomUUID(),
        title: "Success",
        description: "Sprint created successfully!",
      })
    } catch (error) {
      console.error("Error creating sprint:", error)
      toast({
        id: crypto.randomUUID(),
        title: "Error",
        description: "Failed to create sprint. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddTask = async (newTask: Task) => {
    try {
      // Convertir al formato de la API
      const apiTask = {
        ...newTask,
        priority: newTask.priority as string,
        status: newTask.status as string
      }
      
      const createdApiTask = await taskApi.createTask(apiTask)
      const createdTask = convertApiTaskToTask(createdApiTask)
      
      // Actualizar el estado de sprints para incluir la nueva tarea
      setSprints(prevSprints => 
        updateSprintTasks(
          prevSprints,
          newTask.sprintId,
          (tasks) => [...tasks, createdTask]
        )
      )
      
      toast({
        id: crypto.randomUUID(),
        title: "Success",
        description: "Task created successfully!",
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        id: crypto.randomUUID(),
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string, sprintId: string) => {
    try {
      await taskApi.deleteTask(taskId)
      
      // Actualizar estado local
      setSprints(prevSprints => 
        updateSprintTasks(
          prevSprints,
          sprintId,
          (tasks) => tasks.filter(task => task.id !== taskId)
        )
      )
      
      // Cerrar el modal de detalles si la tarea eliminada estaba seleccionada
      if (selectedTask === taskId) {
        setIsOpen(false)
        setSelectedTask(null)
      }
      
      toast({
        id: crypto.randomUUID(),
        title: "Success",
        description: "Task deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        id: crypto.randomUUID(),
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Función para preparar la actualización de estado de una tarea (reduce anidamiento)
  const prepareTaskStatusUpdate = (taskId: string, sprintId: string, newStatus: TaskStatusType) => {
    // Encontrar la tarea actual
    const sprint = sprints.find(s => s.id === sprintId);
    const task = sprint?.tasks.find(t => t.id === taskId);
    
    if (!task) return;
    
    // Llamar a la función que maneja la operación asíncrona
    updateTaskStatusAsync(task, taskId, sprintId, newStatus);
  }

  // Función separada para manejar la operación asíncrona
  const updateTaskStatusAsync = async (task: Task, taskId: string, sprintId: string, newStatus: TaskStatusType) => {
    try {
      // Convertir al formato de la API
      const apiTask = {
        ...task,
        priority: task.priority as string,
        status: newStatus as string
      }
      
      const updatedApiTask = await taskApi.updateTask(taskId, apiTask)
      const updatedTask = convertApiTaskToTask(updatedApiTask)
      
      // Actualizar estado local usando las funciones auxiliares extraídas
      setSprints(prevSprints => 
        updateSprintTasks(
          prevSprints,
          sprintId,
          (tasks) => mapTasksWithUpdatedStatus(tasks, taskId, updatedTask)
        )
      )
      
      // Si el modal de detalles está abierto para esta tarea, actualizar la tarea seleccionada
      if (selectedTask === taskId) {
        setSelectedTask(updatedTask.id)
      }
      
      toast({
        id: crypto.randomUUID(),
        title: "Success",
        description: `Task status updated to ${newStatus}!`,
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        id: crypto.randomUUID(),
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Obtener la tarea actual para el modal
  const currentTask = selectedTask 
    ? sprints.flatMap(sprint => sprint.tasks).find(task => task.id === selectedTask)
    : null

  // Filtrar sprints según la pestaña activa
  const filteredSprints =
    activeTab === "all" 
      ? sprints 
      : sprints.filter((sprint) => sprint.status.toLowerCase() === activeTab.toLowerCase())

  const toggleSprint = (sprintId: string) => {
    setExpandedSprint(expandedSprint === sprintId ? null : sprintId)
  }

  // Funciones para extraer la lógica de colores
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Planned":
        return "bg-amber-100 text-amber-800"
      case "Not Started":
        return "text-[#ff6767]"
      case "In Progress":
        return "text-blue-500"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    if (priority === "Extreme") return "text-red-500"
    if (priority === "High") return "text-orange-500"
    if (priority === "Moderate") return "text-amber-500"
    return "text-green-500"
  }

  const getTaskStatusColor = (status: string) => {
    if (status === "Not Started") return "text-[#ff6767]"
    if (status === "In Progress") return "text-blue-500"
    return "text-green-500"
  }

  // Función auxiliar para renderizar una tarea (reduce anidamiento)
  const renderTask = (task: Task, isSelected: boolean) => (
    <button
      key={task.id}
      className={`border rounded-lg p-4 cursor-pointer transition-colors w-full text-left ${
        isSelected ? "border-[#ff6767] bg-[#fff8f8]" : "border-gray-100 hover:border-gray-300"
      }`}
      onClick={() => {
        setSelectedTask(task.id);
        setIsOpen(true);
      }}
      aria-label={`View details for task: ${task.title}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <CircleDot className={getStatusColor(task.status)} />
          <div>
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.description}</p>

            <div className="flex items-center gap-4 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Priority: </span>
                <span className={getPriorityColor(task.priority)}>
                  {task.priority}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status: </span>
                <span className={getTaskStatusColor(task.status)}>
                  {task.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <img
            src={task.image ?? "/placeholder.svg"}
            alt={task.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2">Created on: {task.createdOn}</div>
    </button>
  );

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please sign in to view your sprints</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header day="Tuesday" date="20/06/2023" title="To" titleSpan="Do" />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="p-4 md:p-6 flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center">
                Sprints
              </h2>
              <p className="text-gray-500 mt-1">Manage your project sprints and associated tasks</p>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <AddSprintDialog onAddSprint={handleAddSprint} />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6767]"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full max-w-md">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="planned">Planned</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="p-4">
                {filteredSprints.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No sprints found. Create a new sprint to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSprints.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg overflow-hidden">
                        <button
                         className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer w-full text-left"
                         onClick={() => toggleSprint(sprint.id)}
                         aria-expanded={expandedSprint === sprint.id}
                         >
                          <div className="flex items-center">
                            {expandedSprint === sprint.id ? (
                              <ChevronDown className="h-5 w-5 text-gray-500 mr-2" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500 mr-2" />
                            )}
                            <div>
                              <h3 className="font-medium text-lg">{sprint.name}</h3>
                              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {sprint.startDate} - {sprint.endDate}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {sprint.tasks.length} tasks
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mt-3 md:mt-0">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                              <div className="text-sm font-medium">{sprint.progress}%</div>
                              <div className="w-32 md:w-40">
                                <Progress value={sprint.progress} className="h-2" />
                              </div>
                            </div>
                            <Badge className={`${getStatusColor(sprint.status)}`}>{sprint.status}</Badge>
                          </div>
                        </button>

                        {expandedSprint === sprint.id && (
                          <div className="p-4 border-t">
                            <h4 className="font-medium p-2">Tasks in this Sprint</h4>
                            <div className="">
                              <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="mb-4">
                                    <AddTaskDialog 
                                      onAddTask={(task) => 
                                        handleAddTask({ 
                                          ...task, 
                                          id: task.id ?? crypto.randomUUID(), 
                                          sprintId: sprint.id 
                                        })
                                      } 
                                    />
                                </div>

                                <div className="space-y-4">
                                  {sprint.tasks.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No tasks in this sprint yet.</p>
                                  ) : (
                                    sprint.tasks.map((task) => renderTask(task, selectedTask === task.id))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {currentTask && isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl p-6 my-2 shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={currentTask.image ?? "/placeholder.svg"}
                    className="w-20 h-20 rounded-lg object-cover"
                    alt={currentTask.title}
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{currentTask.title}</h2>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Priority: </span>
                        <span className={getPriorityColor(currentTask.priority)}>
                          {currentTask.priority}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Status: </span>
                        <span className={getTaskStatusColor(currentTask.status)}>
                          {currentTask.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">Created on: {currentTask.createdOn}</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-gray-100 hover:bg-gray-200 border-none"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Task Description:</h3>
                    <p className="text-gray-600">{currentTask.fullDescription ?? currentTask.description}</p>
                  </div>

                  {currentTask.objective && (
                    <div>
                      <h3 className="font-medium text-gray-700">Objective:</h3>
                      <p>{currentTask.objective}</p>
                    </div>
                  )}

                  {currentTask.additionalNotes && currentTask.additionalNotes.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700">Additional Notes:</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {currentTask.additionalNotes.map((note, index) => (
                          <li key={`note-${currentTask.id}-${index}`}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentTask.deadline && (
                    <div>
                      <h3 className="font-medium text-gray-700">Deadline for Submission:</h3>
                      <p className="text-gray-600">{currentTask.deadline}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium text-gray-700">Update Status:</h3>
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant={currentTask.status === "Not Started" ? "default" : "outline"}
                        size="sm"
                        className={currentTask.status === "Not Started" ? "bg-[#ff6767]" : ""}
                        onClick={() => prepareTaskStatusUpdate(currentTask.id, currentTask.sprintId, "Not Started")}
                      >
                        Not Started
                      </Button>
                      <Button
                        variant={currentTask.status === "In Progress" ? "default" : "outline"}
                        size="sm"
                        className={currentTask.status === "In Progress" ? "bg-blue-500" : ""}
                        onClick={() => prepareTaskStatusUpdate(currentTask.id, currentTask.sprintId, "In Progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant={currentTask.status === "Completed" ? "default" : "outline"}
                        size="sm"
                        className={currentTask.status === "Completed" ? "bg-green-500" : ""}
                        onClick={() => prepareTaskStatusUpdate(currentTask.id, currentTask.sprintId, "Completed")}
                      >
                        Completed
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-gray-100 hover:bg-gray-200 border-none"
                onClick={() => handleDeleteTask(currentTask.id, currentTask.sprintId)}
              >
                <Trash2 className="h-5 w-5 text-[#ff6767]" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full bg-[#ff6767] hover:bg-[#ff5252] border-none"
              >
                <Edit className="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
