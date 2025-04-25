///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/Sprints.tsx
import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ChevronRight, Users } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskDialog } from "@/components/pages/home/AddTask"
import { AddSprintDialog } from "@/components/pages/home/AddSprint"
import { useProjects } from "../../../context/ProjectContext"
import { TaskItem } from "@/components/ui/Task-item"

interface Task {
  id: string
  title: string
  sprintName: string
  date: string
  description: string
  priority: "Extreme" | "High" | "Moderate" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  createdOn: string
  image: string
  assignee: string
  storyPoints: number
  objective?: string
  fullDescription?: string
  additionalNotes?: string[]
  deadline?: string
  sprintId: string
}

interface SprintType {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number
  status: "Active" | "Completed" | "Planned"
  tasks: Task[]
}

interface ServerTask {
  taskId: string;
  title: string;
  description: string;
  sprintId: string;
  assignee?: string; 
  status?: string;
  startDate?: string;
  endDate?: string;
  comments?: string;
  storyPoints?: number;
  priority?: string;
  image?: string;
  createdAt?: string; // Para compatibilidad con la UI actual
}

// Función para convertir status del backend al frontend
const getFrontendStatus = (backendStatus: string) => {
  switch (backendStatus) {
    case "TODO": return "Not Started";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    default: return "Not Started";
  }
};

export default function Sprints() {
  const { userProjects } = useProjects()
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [sprints, setSprints] = useState<SprintType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProject, setUserProject] = useState<string | null>(null)
  const [tasksBySprint, setTasksBySprint] = useState<Record<string, Task[]>>({});
  const [loadedSprints, setLoadedSprints] = useState<Record<string, boolean>>({});

  // Coloca primero fetchTasks
  const fetchTasks = useCallback(async (sprintId: string) => {
    if (!sprintId || loadedSprints[sprintId]) return;
    
    try {
      setLoadedSprints((prev: Record<string, boolean>) => ({ ...prev, [sprintId]: true }));
      
      const response = await fetch(`http://localhost:8080/task/${sprintId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`No tasks found for sprint ${sprintId}`);
          setTasksBySprint((prev: Record<string, Task[]>) => ({ ...prev, [sprintId]: [] }));
          return;
        }
        const errorText = await response.text();
        console.error(`Error fetching tasks (${response.status}):`, errorText);
        throw new Error(`Error fetching tasks: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      const transformedTasks = data.map((task: ServerTask) => ({
        id: task.taskId,
        title: task.title,
        description: task.description,
        sprintId: task.sprintId,
        sprintName: "", 
        date: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        priority: task.priority ?? "Low",
        status: getFrontendStatus(task.status ?? "TODO"),
        createdOn: task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        image: task.image ?? "/placeholder.svg",
        assignee: task.assignee ?? "",
        storyPoints: task.storyPoints ?? 0,
      }));
      
      setTasksBySprint((prev: Record<string, Task[]>) => ({
        ...prev,
        [sprintId]: transformedTasks
      }));
    } catch (error) {
      console.error(`Error fetching tasks for sprint ${sprintId}:`, error);
      setTasksBySprint((prev: Record<string, Task[]>) => ({ ...prev, [sprintId]: [] }));
    }
  }, [loadedSprints]);

  // Ahora sí puedes definir handleTaskUpdate que depende de fetchTasks
  const handleTaskUpdate = useCallback(async (sprintId: string) => {
    // Marcar este sprint como no cargado para forzar una recarga
    setLoadedSprints((prev: Record<string, boolean>) => ({ ...prev, [sprintId]: false }));
    
    // Recargar las tareas
    await fetchTasks(sprintId);
  }, [fetchTasks]);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!userProjects || userProjects.length === 0) {
        setError('No project selected')
        setIsLoading(false)
        return
      }

      try {
        const projectId = userProjects[0].projectId
        setUserProject(projectId)
        const response = await fetch(`http://localhost:8080/sprintlist/${projectId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setSprints([])
            setError(null)
          } else {
            throw new Error(`Failed to fetch sprints: ${response.status} ${response.statusText}`)
          }
          return
        }
        
        const data = await response.json()
        const transformedSprints = data.map((sprint: any) => ({
          id: sprint.sprintId,
          name: sprint.name,
          startDate: new Date(sprint.startDate).toISOString().split('T')[0],
          endDate: new Date(sprint.endDate).toISOString().split('T')[0],
          progress: 0,
          status: "Active" as const,
          tasks: []
        }))
        setSprints(transformedSprints)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching sprints')
        setSprints([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchSprints()
  }, [userProjects])

  const handleAddTask = async (newTask: Task) => {
    try {
      if (!newTask.sprintId) {
        console.error('Error: sprintId is undefined');
        return;
      }
      
      // Forzar una recarga de las tareas para este sprint
      setLoadedSprints((prev: Record<string, boolean>) => ({ ...prev, [newTask.sprintId]: false }));
      
      // Si este sprint está actualmente expandido, obtener sus tareas inmediatamente
      if (expandedSprint === newTask.sprintId) {
        await fetchTasks(newTask.sprintId);
      }
      
    } catch (error) {
      console.error('Error processing new task:', error);
    }
  }
  
  const handleAddSprint = (newSprint: SprintType) => {
    setSprints((prevSprints) => [...prevSprints, newSprint]);
    setExpandedSprint(newSprint.id);
  }

  const filteredSprints = activeTab === "all" 
    ? sprints 
    : sprints.filter((sprint) => sprint.status.toLowerCase() === activeTab);

  const toggleSprint = (sprintId: string) => {
    if (expandedSprint === sprintId) {
      setExpandedSprint(null)
    } else {
      setExpandedSprint(sprintId)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, sprintId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSprint(sprintId);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Planned":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6767] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sprints...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            className="mt-4 bg-[#ff6767] hover:bg-[#ff5252] text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header day="Tuesday" date="20/06/2023" title="To" titleSpan="Do"/>

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
              <AddSprintDialog onAddSprint={handleAddSprint}/>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {sprints.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">No sprints found for this project</p>
                <AddSprintDialog onAddSprint={handleAddSprint} />
              </div>
            ) : (
              <>
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
                  <div className="space-y-4">
                    {filteredSprints.map((sprint) => (
                      <div key={sprint.id} className="border rounded-lg overflow-hidden">
                        <button
                          className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                          onClick={() => toggleSprint(sprint.id)}
                          onKeyDown={(e) => handleKeyDown(e, sprint.id)}
                          type="button"
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
                                  {(tasksBySprint[sprint.id]?.length ?? 0)} tasks
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
                                <div className="mb-2">
                                  <AddTaskDialog 
                                    onAddTask={(task) => handleAddTask({ ...task, sprintId: sprint.id })} 
                                    sprintId={sprint.id} 
                                    projectId={userProject ?? "error"}
                                  />
                                </div>

                                <div className="space-y-4">
                                  {(tasksBySprint[sprint.id] ?? []).length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                      No hay tareas en este sprint. ¡Agrega una nueva tarea!
                                    </div>
                                  ) : (
                                    tasksBySprint[sprint.id].map((task) => (
                                      <TaskItem
                                        key={task.id}
                                        id={task.id}
                                        title={task.title}
                                        description={task.description}
                                        priority={task.priority}
                                        status={task.status}
                                        date={task.createdOn}
                                        image={task.image ?? "/placeholder.svg"}
                                        assignee={task.assignee}
                                        sprintId={sprint.id}
                                        onTaskUpdated={() => handleTaskUpdate(sprint.id)}
                                      />
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
