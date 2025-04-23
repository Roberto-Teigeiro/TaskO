import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown, ChevronRight, Users, CircleDot, Edit, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskDialog } from "@/components/pages/home/AddTask"
import { AddSprintDialog } from "@/components/pages/home/AddSprint"

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

interface BackendSprint {
  sprintId: string
  projectId: string
  name: string
  description: string
  startDate: string
  endDate: string
}

export default function Sprints() {
  
  const [tasks, setTasks] = useState<Task[]>([])
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [sprints, setSprints] = useState<SprintType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchSprints = async () => {
      try {
        const response = await fetch(`http://localhost:8080/sprintlist/`)
        if (!response.ok) {
          throw new Error('Failed to fetch sprints')
        }
        const data = await response.json() as BackendSprint[]
        // Transform the data to match our SprintType interface
        const transformedSprints = data.map((sprint) => ({
          id: sprint.sprintId,
          name: sprint.name,
          startDate: new Date(sprint.startDate).toISOString().split('T')[0],
          endDate: new Date(sprint.endDate).toISOString().split('T')[0],
          progress: 0, // TODO: Calculate progress based on tasks
          status: "Active" as const, // Use const assertion to match the union type
          tasks: []
        }))
        setSprints(transformedSprints)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching sprints')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSprints()
  }, [])

  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask])
  }
  
  const handleAddSprint = (newSprint: SprintType) => {
    setSprints((prevSprints) => [...prevSprints, newSprint])
  }

  const currentTask = tasks.find((task) => task.id === selectedTask)

  const filteredSprints =
    activeTab === "all" ? sprints : sprints.filter((sprint) => sprint.status.toLowerCase() === activeTab)

  const toggleSprint = (sprintId: string) => {
    if (expandedSprint === sprintId) {
      setExpandedSprint(null)
    } else {
      setExpandedSprint(sprintId)
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
      <Header day="Tuesday" date="20/06/2023" title = "To" titleSpan = "Do"/>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar

        />

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
              <div className="space-y-4">
                {filteredSprints.map((sprint) => (
                  <div key={sprint.id} className="border rounded-lg overflow-hidden">
                    
                    <div
                      className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer"
                      onClick={() => {console.log(sprint.id);
                        toggleSprint(sprint.id);
                        }}
                    >
                      <div

                      className="flex items-center">
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
                              {/*{sprint.tasks.length} tasks  */}
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
                    </div>

                    {expandedSprint === sprint.id && (
                      <div className="p-4 border-t">
                        <h4 className="font-medium p-2">Tasks in this Sprint</h4>
                        <div className="">
                          
                          <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="mb-2">
                              <AddTaskDialog onAddTask={(task) => handleAddTask({ ...task, sprintName: sprint.name})} /></div>

                            <div className="space-y-11">
                              {tasks
                              .filter((task) => task.sprintName === sprint.name)
                              .map((task) => (
                                
                                <div
                                  
                                  key={task.id}
                                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    selectedTask === task.id
                                      ? "border-[#ff6767] bg-[#fff8f8]"
                                      : "border-gray-100 hover:border-gray-300"
                                  }`}
                                  
                                  onClick={() => {
                                    console.log("Clicked Task ID:", task.id); // Debugging
                                    setSelectedTask(task.id);
                                    setIsOpen(true);
                                  }}
                                  
                                >
                                  
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-3">
                                      <CircleDot
                                        className={`h-5 w-5 mt-1 ${
                                          task.status === "Not Started"
                                            ? "text-[#ff6767]"
                                            : task.status === "In Progress"
                                              ? "text-blue-500"
                                              : "text-green-500"
                                        }`}
                                      />
                                      <div>
                                        <h3 className="font-medium">{task.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{task.description}</p>

                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                          <div>
                                            <span className="text-gray-500">Priority: </span>
                                            <span
                                              className={
                                                task.priority === "Extreme"
                                                  ? "text-red-500"
                                                  : task.priority === "High"
                                                    ? "text-orange-500"
                                                    : task.priority === "Moderate"
                                                      ? "text-amber-500"
                                                      : "text-green-500"
                                              }
                                            >
                                              {task.priority}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Status: </span>
                                            <span
                                              className={
                                                task.status === "Not Started"
                                                  ? "text-[#ff6767]"
                                                  : task.status === "In Progress"
                                                    ? "text-blue-500"
                                                    : "text-green-500"
                                              }
                                            >
                                              {task.status}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex-shrink-0">
                                      <img
                                        src={task.image || "/placeholder.svg"}
                                        alt={task.title}
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                    </div>
                                  </div>
                                  <div className="text-xs text-gray-400 mt-2">Created on: {task.createdOn}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          
                          {currentTask && isOpen &&(
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-white rounded-xl p-6 my-2 shadow-sm">
                              <div className="flex items-start mb-6">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-4">
                                    <img
                                      src={currentTask.image || "/placeholder.svg"}
                                      className="w-24 h-24 rounded-lg object-cover"
                                    />
                                    <div>
                                      <h2 className="text-xl font-semibold">{currentTask.title}</h2>
                                      <div className="flex flex-col gap-1 mt-2">
                                        <div className="text-sm">
                                          <span className="text-gray-500">Priority: </span>
                                          <span
                                            className={
                                              currentTask.priority === "Extreme"
                                                ? "text-red-500"
                                                : currentTask.priority === "High"
                                                  ? "text-orange-500"
                                                  : currentTask.priority === "Moderate"
                                                    ? "text-amber-500"
                                                    : "text-green-500"
                                            }
                                          >
                                            {currentTask.priority}
                                          </span>
                                        </div>
                                        <div className="text-sm">
                                          <span className="text-gray-500">Status: </span>
                                          <span
                                            className={
                                              currentTask.status === "Not Started"
                                                ? "text-[#ff6767]"
                                                : currentTask.status === "In Progress"
                                                  ? "text-blue-500"
                                                  : "text-green-500"
                                            }
                                          >
                                            {currentTask.status}
                                          </span>
                                        </div>
                                        <div className="text-sm text-gray-500">Created on: {currentTask.createdOn}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h3 className="font-medium text-gray-700">Task Title:</h3>
                                      <p>{currentTask.title}</p>
                                    </div>

                                    {currentTask.objective && (
                                      <div>
                                        <h3 className="font-medium text-gray-700">Objective:</h3>
                                        <p>{currentTask.objective}</p>
                                      </div>
                                    )}

                                    {currentTask.fullDescription && (
                                      <div>
                                        <h3 className="font-medium text-gray-700">Task Description:</h3>
                                        <p className="text-gray-600">{currentTask.fullDescription}</p>
                                      </div>
                                    )}

                                    {currentTask.additionalNotes && currentTask.additionalNotes.length > 0 && (
                                      <div>
                                        <h3 className="font-medium text-gray-700">Additional Notes:</h3>
                                        <ul className="list-disc pl-5 text-gray-600">
                                          {currentTask.additionalNotes.map((note, index) => (
                                            <li key={index}>{note}</li>
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
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 mt-8">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full bg-gray-100 hover:bg-gray-200 border-none"
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
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="rounded-full bg-gray-100 hover:bg-gray-200 border-none"
                                  onClick={() => setIsOpen(false)}
                                  ></Button>
                              </div>
                            </div>
                            </div>
                          )}
                          </div>

                                      
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

