///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/Sprints.tsx
import { useState, useEffect, useCallback, useMemo } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddTaskDialog } from "@/components/pages/home/AddTask"
import { AddSprintDialog } from "@/components/pages/home/AddSprint"
import { useProjects } from "../../../context/ProjectContext"
import { TaskItem } from "@/components/Task-item"
import { useUser } from "@clerk/clerk-react"
import { useUserResolver } from "../../hooks/useUserResolver";
import { useManager } from "../../hooks/useManager";
import { DeleteSprintDialog } from "./DeleteSprintDialog";
import oracleLogo from "../../../assets/oracleLogo.svg"

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
  assigneeId: string
  storyPoints: number
  objective?: string
  fullDescription?: string
  additionalNotes?: string[]
  deadline?: string
  sprintId: string
  estimatedHours?: number;
  realHours?: number;
}

interface SprintType {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: "Completed" | "In Progress" | "Not Started";
  tasks: Task[];
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
  estimatedHours?: number;
  realHours?: number;
}

// Función para convertir status del backend al frontend
const getFrontendStatus = (backendStatus: string) => {
  switch (backendStatus) {
    case "TODO":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return "Not Started";
  }
};

export default function Sprints() {
  const { userProjects } = useProjects()
  const { user } = useUser()
  const { resolveUserNames } = useUserResolver();
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [sprints, setSprints] = useState<SprintType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProject, setUserProject] = useState<string | null>(null)
  const [tasksBySprint, setTasksBySprint] = useState<Record<string, Task[]>>({});
  const [loadedSprints, setLoadedSprints] = useState<Record<string, boolean>>({});
  
  // Check if current user is a manager
  const { isManager } = useManager(userProject);

  // Coloca primero fetchTasks
  const fetchTasks = useCallback(async (sprintId: string) => {
    if (!sprintId || loadedSprints[sprintId]) return;
    
    try {
      setLoadedSprints((prev: Record<string, boolean>) => ({ ...prev, [sprintId]: true }));
      const isLocalhost = window.location.hostname === 'localhost';

      const url = isLocalhost 
        ? `http://localhost:8080/task/sprint/${sprintId}` 
        : `/api/task/sprint/${sprintId}`;
      const response = await fetch(url)
      
      if (!response.ok) {
        if (response.status === 404) {
          setTasksBySprint((prev: Record<string, Task[]>) => ({ ...prev, [sprintId]: [] }));
          return;
        }
        const errorText = await response.text();
        console.error(`Error fetching tasks (${response.status}):`, errorText);
        throw new Error(`Error fetching tasks: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Obtener todos los IDs de usuarios únicos que tienen assignee - VERSIÓN MEJORADA
    const assigneeIds = [...new Set(
      data
        .map((task: ServerTask) => task.assignee)
        .filter((assignee: string | undefined): assignee is string => Boolean(assignee) && typeof assignee === 'string')
    )] as string[];
      // Resolver nombres de usuario si hay assignees
      let userNames: Record<string, string> = {};
      if (assigneeIds.length > 0) {
        userNames = await resolveUserNames(assigneeIds);
      }
      
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
        assignee: task.assignee ? (userNames[task.assignee] || task.assignee) : "",
        assigneeId: task.assignee || "", // Keep original assignee ID for comparison
        storyPoints: task.storyPoints ?? 0,
        estimatedHours: task.estimatedHours ?? 0,
        realHours: task.realHours ?? 0,
      }));
      
      setTasksBySprint((prev: Record<string, Task[]>) => ({
        ...prev,
        [sprintId]: transformedTasks
      }));
    } catch (error) {
      console.error(`Error fetching tasks for sprint ${sprintId}:`, error);
      setTasksBySprint((prev: Record<string, Task[]>) => ({ ...prev, [sprintId]: [] }));
    }
  }, [loadedSprints, resolveUserNames]);

  // Ahora sí puedes definir handleTaskUpdate que depende de fetchTasks
  const handleTaskUpdate = useCallback(
    async (sprintId: string) => {
      // Marcar este sprint como no cargado para forzar una recarga
      setLoadedSprints((prev: Record<string, boolean>) => ({
        ...prev,
        [sprintId]: false,
      }));

      // Recargar las tareas
      await fetchTasks(sprintId);
    },
    [fetchTasks],
  );

  useEffect(() => {
    const fetchSprints = async () => {
      if (!userProjects || userProjects.length === 0) {
        setError("No project selected");
        setIsLoading(false);
        return;
      }

      try {
        const projectId = userProjects[0].projectId
        setUserProject(projectId)
        const isLocalhost = window.location.hostname === 'localhost';

        const url = isLocalhost 
        ? `http://localhost:8080/sprintlist/${projectId}` 
        : `/api/sprintlist/${projectId}`;
        const response = await fetch(url)
        
        if (!response.ok) {
          if (response.status === 404) {
            setSprints([]);
            setError(null);
          } else {
            throw new Error(
              `Failed to fetch sprints: ${response.status} ${response.statusText}`,
            );
          }
          return;
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format from server");
        }

        const currentDate = new Date();
        const transformedSprints = data.map((sprint) => {          
          const startDate = new Date(sprint.startDate);
          const endDate = new Date(sprint.endDate);

          let status: "Completed" | "In Progress" | "Not Started";
          if (currentDate > endDate) {
            status = "Completed";
          } else if (currentDate >= startDate && currentDate <= endDate) {
            status = "In Progress";
          } else {
            status = "Not Started";
          }

          return {
            id: sprint.sprintId || sprint.id, // Try both property names
            name: sprint.name,
            startDate: startDate.toISOString().split("T")[0],
            endDate: endDate.toISOString().split("T")[0],
            progress: 0,
            status,
            tasks: [],
          };
        });
        setSprints(transformedSprints);
        setError(null);

        // Fetch tasks for all sprints
        for (const sprint of transformedSprints) {
          await fetchTasks(sprint.id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching sprints",
        );
        setSprints([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSprints();
  }, [userProjects, fetchTasks]);

  const handleAddTask = async (newTask: Task) => {
    try {
      if (!newTask.sprintId) {
        return;
      }

      // Forzar una recarga de las tareas para este sprint
      setLoadedSprints((prev: Record<string, boolean>) => ({
        ...prev,
        [newTask.sprintId]: false,
      }));

      // Si este sprint está actualmente expandido, obtener sus tareas inmediatamente
      if (expandedSprint === newTask.sprintId) {
        await fetchTasks(newTask.sprintId);
      }
    } catch (error) {
      console.error("Error processing new task:", error);
    }
  };

  const handleAddSprint = (newSprint: SprintType) => {
    setSprints((prevSprints) => [...prevSprints, newSprint]);
    setExpandedSprint(newSprint.id);
  };

  const handleDeleteSprint = (sprintId: string) => {
    setSprints((prevSprints) => prevSprints.filter(sprint => sprint.id !== sprintId));
    // Clear tasks for this sprint
    setTasksBySprint((prev) => {
      const updated = { ...prev };
      delete updated[sprintId];
      return updated;
    });
  };

  const filteredSprints = useMemo(() => {
    return activeTab === "all"
      ? sprints
      : sprints.filter((sprint) => sprint.status.toLowerCase() === activeTab);
  }, [activeTab, sprints]);

  const toggleSprint = (sprintId: string) => {
    if (expandedSprint === sprintId) {
      setExpandedSprint(null);
    } else {
      setExpandedSprint(sprintId);
      // Fetch tasks when expanding a sprint
      fetchTasks(sprintId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, sprintId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSprint(sprintId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Not Started":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletionRate = useCallback((sprintId: string) => {
    const tasks = tasksBySprint[sprintId] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "Completed",
    ).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  }, [tasksBySprint]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fb]">
        <div className="flex flex-col items-center gap-4">
          <img src={oracleLogo} alt="Oracle Logo" className="w-32 h-32 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ff6767] border-t-transparent"></div>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      <Header title="Sprints" />
      <div className="flex flex-1">
        <Sidebar />
        <div className="p-6 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Sprints</h1>
            <AddSprintDialog onAddSprint={handleAddSprint} />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in progress">In Progress</TabsTrigger>
              <TabsTrigger value="not started">Not Started</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredSprints.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No sprints found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {activeTab === "all" 
                        ? "You don't have any sprints yet. Create your first sprint to get started!" 
                        : `No sprints with status "${activeTab}" found.`}
                    </p>
                  </div>
                  {activeTab === "all" && (
                    <AddSprintDialog onAddSprint={handleAddSprint} />
                  )}
                </div>
              </div>
            ) : (
              filteredSprints
                .sort((a, b) => {
                  // Sort by start date in descending order (most recent first)
                  return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                })
                .map((sprint) => {
                  const completionRate = getCompletionRate(sprint.id);

                  return (
                    <div
                      key={sprint.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSprint(sprint.id)}
                        onKeyDown={(e) => handleKeyDown(e, sprint.id)}
                        tabIndex={0}
                        role="button"
                      >
                                                  <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                              <ChevronRight
                                className={`h-5 w-5 transition-transform ${
                                  expandedSprint === sprint.id ? "rotate-90" : ""
                                }`}
                              />
                              <div>
                                <h3 className="font-semibold">{sprint.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      sprint.startDate,
                                    ).toLocaleDateString()}{" "}
                                    -{" "}
                                    {new Date(sprint.endDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Delete sprint button - only visible to managers */}
                            {isManager && (
                              <DeleteSprintDialog
                                sprintId={sprint.id}
                                sprintName={sprint.name}
                                onDelete={handleDeleteSprint}
                              />
                            )}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full"
                                  style={{
                                    width: `${completionRate}%`,
                                    backgroundColor:
                                      completionRate >= 75
                                        ? "#32CD32"
                                        : completionRate >= 50
                                          ? "#4169E1"
                                          : "#ff6b6b",
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold">
                                {completionRate}%
                              </span>
                            </div>
                            <Badge className={getStatusColor(sprint.status)}>
                              {sprint.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {expandedSprint === sprint.id && (
                        <div className="border-t p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium">Tasks</h4>
                            <AddTaskDialog
                              onAddTask={handleAddTask}
                              sprintId={sprint.id}
                              projectId={userProject || ""}
                            />
                          </div>
                          <div className="space-y-4">
                            {tasksBySprint[sprint.id]?.map((task) => (
                              <TaskItem
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                description={task.description}
                                priority={task.priority}
                                status={task.status}
                                date={task.date}
                                image={task.image}
                                assignee={task.assignee}
                                assigneeId={task.assigneeId}
                                sprintId={sprint.id}
                                estimatedHours={task.estimatedHours}
                                realHours={task.realHours}
                                storyPoints={task.storyPoints}
                                currentUserId={user?.id}
                                isManager={isManager}
                                onTaskUpdated={() => handleTaskUpdate(sprint.id)}
                              />
                            ))}
                            {(!tasksBySprint[sprint.id] || tasksBySprint[sprint.id].length === 0) && (
                              <p className="text-gray-500 text-center py-4">No tasks in this sprint</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}