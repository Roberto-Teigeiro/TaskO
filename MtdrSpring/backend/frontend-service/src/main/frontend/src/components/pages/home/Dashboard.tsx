///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/pages/home/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ProgressCircle } from "@/components/ui/Progress-circle";
import { useUser } from "@clerk/react-router";
import { useProjects } from "../../../context/ProjectContext";
import { useNavigate } from "react-router-dom";

interface BackendSprint {
  sprintId: string;
  projectId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Task {
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
  createdAt?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { userProjects, loading, error, currentProject } = useProjects();
  const [sprintStats, setSprintStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    total: 0,
  });
  const [sprints, setSprints] = useState<BackendSprint[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const checkUserProjects = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/projects/${user.id}/any`);
        if (!response.ok) {
          throw new Error("Failed to check user projects");
        }

        const hasProjects = await response.json();
        if (!hasProjects) {
          navigate("/choosepath");
        }
      } catch (err) {
        console.error("Error checking user projects:", err);
      }
    };

    if (isSignedIn && !loading) {
      checkUserProjects();
    }
  }, [user?.id, isSignedIn, loading, navigate]);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!currentProject?.projectId) return;

      try {
        const response = await fetch(
          `/api/sprintlist/${currentProject.projectId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch sprints");
        }

        const data = (await response.json()) as BackendSprint[];
        console.log("Fetched sprints:", data);

        const currentDate = new Date();

        const sprintsWithStatus = data.map((sprint) => {
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
            ...sprint,
            status,
          };
        });

        console.log("Sprints with status:", sprintsWithStatus);
        setSprints(sprintsWithStatus);

        // Fetch tasks for each sprint
        const tasksBySprint: Record<string, Task[]> = {};
        for (const sprint of sprintsWithStatus) {
          try {
            const tasksResponse = await fetch(
              `/api/task/sprint/${sprint.sprintId}`,
            );
            if (!tasksResponse.ok) {
              throw new Error(
                `Failed to fetch tasks for sprint ${sprint.sprintId}`,
              );
            }
            const tasks = (await tasksResponse.json()) as Task[];
            tasksBySprint[sprint.sprintId] = tasks;
          } catch (err) {
            console.error(
              `Error fetching tasks for sprint ${sprint.sprintId}:`,
              err,
            );
            tasksBySprint[sprint.sprintId] = [];
          }
        }
        console.log("Tasks by sprint:", tasksBySprint);
        setSprintTasks(tasksBySprint);

        // Calculate sprint statistics
        const totalSprints = sprintsWithStatus.length;
        const stats = {
          completed: sprintsWithStatus.filter((s) => s.status === "Completed")
            .length,
          inProgress: sprintsWithStatus.filter(
            (s) => s.status === "In Progress",
          ).length,
          notStarted: sprintsWithStatus.filter(
            (s) => s.status === "Not Started",
          ).length,
          total: totalSprints,
        };

        setSprintStats(stats);
      } catch (err) {
        console.error("Error fetching sprints:", err);
      }
    };

    if (currentProject?.projectId) {
      fetchSprints();
    }
  }, [currentProject?.projectId]);

  // Show a loading state while Clerk is initializing
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Ensure userProjects is an array before mapping
  const projectsArray = Array.isArray(userProjects) ? userProjects : [];

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Header */}
      <Header title="Dash" titleSpan="Board" />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="p-6 flex-1">
          {/* Welcome Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.firstName ?? ""} {user?.lastName ?? ""} 👋
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage
                    src={
                      user?.imageUrl || "/placeholder.svg?height=32&width=32"
                    }
                  />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                {[...Array(4)].map((_, i) => {
                  const uniqueKey = `avatar-${i}-${Date.now()}`; // Better approach is to have real IDs
                  return (
                    <Avatar
                      key={uniqueKey}
                      className="border-2 border-white w-8 h-8"
                    >
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>U{i + 2}</AvatarFallback>
                    </Avatar>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-[#ff6b6b] text-[#ff6b6b] hover:bg-[#ff6b6b]/10"
              >
                <Plus className="h-4 w-4 mr-1" /> Invite
              </Button>
            </div>
          </div>

          {/* Task Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex flex-col gap-4">
              {/* Task Status */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium mb-4 text-xl">
                  Sprints Status per Project KPI
                </h3>

                {/* Progress Circles */}
                <div className="flex justify-center gap-6 items-center">
                  <ProgressCircle
                    value={
                      sprintStats.total > 0
                        ? Math.round(
                            (sprintStats.completed / sprintStats.total) * 100,
                          )
                        : 0
                    }
                    color="#32CD32"
                    label={`Completed Sprints (${sprintStats.completed}/${sprintStats.total})`}
                  />
                  <ProgressCircle
                    value={
                      sprintStats.total > 0
                        ? Math.round(
                            (sprintStats.inProgress / sprintStats.total) * 100,
                          )
                        : 0
                    }
                    color="#4169E1"
                    label={`In Progress Sprints (${sprintStats.inProgress}/${sprintStats.total})`}
                  />
                  <ProgressCircle
                    value={
                      sprintStats.total > 0
                        ? Math.round(
                            (sprintStats.notStarted / sprintStats.total) * 100,
                          )
                        : 0
                    }
                    color="#ff6b6b"
                    label={`Not Started Sprints (${sprintStats.notStarted}/${sprintStats.total})`}
                  />
                </div>
              </div>

              {/* Sprint KPIs Section */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">
                  Tasks Completed by Person per Sprint KPI
                </h3>
                <div className="space-y-4">
                  {sprints.map((sprint) => {
                    const tasks = sprintTasks[sprint.sprintId] || [];
                    const completedTasksByUser = tasks
                      .filter(
                        (task) => task.status === "COMPLETED" && task.assignee,
                      )
                      .reduce(
                        (
                          acc: Record<
                            string,
                            { userId: string; userName: string; count: number }
                          >,
                          task,
                        ) => {
                          if (!acc[task.assignee!]) {
                            acc[task.assignee!] = {
                              userId: task.assignee!,
                              userName: task.assignee!,
                              count: 0,
                            };
                          }
                          acc[task.assignee!].count++;
                          return acc;
                        },
                        {},
                      );

                    const completedTasksArray =
                      Object.values(completedTasksByUser);

                    return (
                      <div
                        key={sprint.sprintId}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {sprint.name}
                          </h4>
                          <span className="text-sm text-gray-500">
                            {
                              tasks.filter(
                                (task) => task.status === "COMPLETED",
                              ).length
                            }{" "}
                            completed tasks
                          </span>
                        </div>
                        <div className="space-y-3">
                          {completedTasksArray.length > 0 ? (
                            completedTasksArray.map((task) => (
                              <div
                                key={task.userId}
                                className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback className="bg-blue-100 text-blue-800">
                                      {task.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-gray-700">
                                    {task.userName}
                                  </span>
                                </div>
                                <span className="font-semibold bg-green-100 text-green-800 rounded-full px-3 py-1">
                                  {task.count}{" "}
                                  {task.count === 1 ? "task" : "tasks"}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <p className="text-gray-500">
                                No completed tasks in this sprint
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sprint Completion Summary */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">
                  Sprint Completion Overview KPI
                </h3>
                <div className="space-y-4">
                  {sprints.map((sprint) => {
                    const tasks = sprintTasks[sprint.sprintId] || [];
                    const totalTasks = tasks.length;
                    const completedTasks = tasks.filter(
                      (task) => task.status === "COMPLETED",
                    ).length;
                    const completionRate =
                      totalTasks > 0
                        ? Math.round((completedTasks / totalTasks) * 100)
                        : 0;

                    return (
                      <div
                        key={sprint.sprintId}
                        className="border-b pb-4 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{sprint.name}</span>
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
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {completedTasks} of {totalTasks} tasks completed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h1></h1>
            {projectsArray.length === 0 ? (
              <p>No projects found</p>
            ) : (
              <ul>
                {projectsArray.map((project) => (
                  <li key={project.id}>
                    <h3>{project.name}</h3>
                    {/* Add other project details as needed */}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
