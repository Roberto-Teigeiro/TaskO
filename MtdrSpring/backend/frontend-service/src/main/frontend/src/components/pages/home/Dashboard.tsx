///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/pages/home/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@clerk/react-router";
import { useProjects } from '../../../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import oracleLogo from '@/assets/oracleLogo.svg';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  estimatedHours?: number;
  realHours?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { userProjects, loading, error, currentProject } = useProjects();
  const [sprints, setSprints] = useState<BackendSprint[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Set selected project when currentProject or userProjects changes
  useEffect(() => {
    if (currentProject?.projectId) {
      setSelectedProject(currentProject.projectId);
    } else if (userProjects && userProjects.length > 0) {
      setSelectedProject(userProjects[0].projectId);
    }
  }, [currentProject, userProjects]);

  useEffect(() => {
    const checkUserProjects = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`http://localhost:8080/projects/${user.id}/any`);
        if (!response.ok) {
          throw new Error('Failed to check user projects');
        }
        
        const hasProjects = await response.json();
        if (!hasProjects) {
          navigate('/choosepath');
        }
      } catch (err) {
        console.error('Error checking user projects:', err);
      }
    };

    if (isSignedIn && !loading) {
      checkUserProjects();
    }
  }, [user?.id, isSignedIn, loading, navigate]);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProject) return;
      setDashboardLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/sprintlist/${selectedProject}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sprints');
        }
        
        const data = await response.json() as BackendSprint[];
        console.log('Fetched sprints:', data);
        
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
            status
          };
        });

        console.log('Sprints with status:', sprintsWithStatus);
        setSprints(sprintsWithStatus);

        // Fetch tasks for each sprint
        const tasksBySprint: Record<string, Task[]> = {};
        for (const sprint of sprintsWithStatus) {
          try {
            const tasksResponse = await fetch(`http://localhost:8080/task/sprint/${sprint.sprintId}`);
            if (!tasksResponse.ok) {
              throw new Error(`Failed to fetch tasks for sprint ${sprint.sprintId}`);
            }
            const tasks = await tasksResponse.json() as Task[];
            tasksBySprint[sprint.sprintId] = tasks;
          } catch (err) {
            console.error(`Error fetching tasks for sprint ${sprint.sprintId}:`, err);
            tasksBySprint[sprint.sprintId] = [];
          }
        }
        console.log('Tasks by sprint:', tasksBySprint);
        setSprintTasks(tasksBySprint);
      } catch (err) {
        console.error('Error fetching sprints:', err);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (selectedProject) {
      fetchSprints();
    }
  }, [selectedProject]);

  useEffect(() => {
    const fetchMemberRoles = async () => {
      if (!selectedProject) return;
      
      try {
        const response = await fetch(`http://localhost:8080/projects/${selectedProject}/members`);
        if (!response.ok) {
          throw new Error('Failed to fetch project members');
        }
        
        const members = await response.json();
        const rolesMap = members.reduce((acc: Record<string, string>, member: { userId: string; role?: string }) => {
          acc[member.userId] = member.role || 'Unassigned';
          return acc;
        }, {});
        
        setMemberRoles(rolesMap);
      } catch (error) {
        console.error('Error fetching member roles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchMemberRoles();
  }, [selectedProject]);

  // Show a loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fb]">
        <div className="flex flex-col items-center gap-4">
          <img src={oracleLogo} alt="Oracle Logo" className="w-32 h-32 animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ff6767] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8fb]">
        <div className="flex flex-col items-center gap-4">
          <img src={oracleLogo} alt="Oracle Logo" className="w-32 h-32 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Ensure userProjects is an array before mapping
  const projectsArray = Array.isArray(userProjects) ? userProjects : [];

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Header */}
      <Header title="Dashboard" />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Content Area */}
        <div className="p-6 flex-1 relative">
          {/* Loading Overlay */}
          {dashboardLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <img src={oracleLogo} alt="Oracle Logo" className="w-32 h-32 animate-pulse" />
            </div>
          )}

          {/* Project Selector */}
          {projectsArray.length > 1 && (
            <div className="mb-6">
              <label htmlFor="project-selector" className="block text-sm font-medium mb-1">
                Select Project:
              </label>
              <select
                id="project-selector"
                className="border rounded px-3 py-2"
                value={selectedProject}
                onChange={e => setSelectedProject(e.target.value)}
              >
                {projectsArray.map(project => (
                  <option key={project.projectId} value={project.projectId}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Welcome Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.firstName ?? ''} {user?.lastName ?? ''} 👋
            </h2>
            
          </div>

          {/* Task Section */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="columns-1 md:columns-2 gap-6 space-y-6">
              {/* Task Status */}
              
              {/* Sprint KPIs Section */}
              
              {/* Sprint Completion Summary */}
              

              {/* Hours Comparison Chart */}
              <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Estimated vs Real Hours per Sprint</h3>
                <div className="space-y-4">
                  {sprints.map((sprint) => {
                    const tasks = sprintTasks[sprint.sprintId] || [];
                    const tasksWithHours = tasks.filter(task => task.estimatedHours || task.realHours);
                    
                    if (tasksWithHours.length === 0) {
                      return (
                        <div key={sprint.sprintId} className="text-center py-4">
                          <p className="text-gray-500">No hours data available for this sprint</p>
                        </div>
                      );
                    }

                    const chartData = {
                      labels: tasksWithHours.map(task => task.title),
                      datasets: [
                        {
                          label: 'Estimated Hours',
                          data: tasksWithHours.map(task => task.estimatedHours || 0),
                          backgroundColor: 'rgba(65, 105, 225, 0.5)',
                          borderColor: 'rgb(65, 105, 225)',
                          borderWidth: 1,
                        },
                        {
                          label: 'Real Hours',
                          data: tasksWithHours.map(task => task.realHours || 0),
                          backgroundColor: 'rgba(50, 205, 50, 0.5)',
                          borderColor: 'rgb(50, 205, 50)',
                          borderWidth: 1,
                        },
                      ],
                    };

                    const chartOptions = {
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: sprint.name,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Hours'
                          }
                        }
                      }
                    };

                    return (
                      <div key={sprint.sprintId} className="h-[300px]">
                        <Bar data={chartData} options={chartOptions} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Real Hours per Sprint Chart */}
              <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Total Real Hours Worked per Sprint</h3>
                <div className="h-[300px]">
                  {(() => {
                    // Calculate total real hours for each sprint
                    const sprintLabels = sprints.map(sprint => sprint.name);
                    const totalRealHoursData = sprints.map(sprint => {
                      const tasks = sprintTasks[sprint.sprintId] || [];
                      return tasks.reduce((total, task) => total + (task.realHours || 0), 0);
                    });

                    // If no data, show message
                    if (totalRealHoursData.every(hours => hours === 0)) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No real hours data available for any sprint</p>
                        </div>
                      );
                    }

                    const chartData = {
                      labels: sprintLabels,
                      datasets: [
                        {
                          label: 'Total Real Hours',
                          data: totalRealHoursData,
                          backgroundColor: 'rgba(255, 107, 107, 0.6)',
                          borderColor: 'rgb(255, 107, 107)',
                          borderWidth: 1,
                        },
                      ],
                    };

                    const chartOptions = {
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Total Hours per Sprint',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Total Hours'
                          }
                        }
                      }
                    };

                    return <Bar data={chartData} options={chartOptions} />;
                  })()}
                </div>
              </div>

              {/* Total Real Hours per Project Member Chart */}
              <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Total Real Hours Worked per Project Member</h3>
                <div className="h-[300px]">
                  {(() => {
                    // Collect all tasks from all sprints
                    const allTasks = Object.values(sprintTasks).flat();
                    
                    // Calculate total real hours per assignee
                    const hoursByAssignee = allTasks.reduce((acc: Record<string, number>, task) => {
                      if (task.assignee && task.realHours) {
                        acc[task.assignee] = (acc[task.assignee] || 0) + task.realHours;
                      }
                      return acc;
                    }, {});

                    // If no data, show message
                    if (Object.keys(hoursByAssignee).length === 0) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No real hours data available for any project member</p>
                        </div>
                      );
                    }

                    if (isLoadingRoles) {
                      return (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6767] mx-auto"></div>
                        </div>
                      );
                    }

                    // Group hours by role
                    const hoursByRole = Object.entries(hoursByAssignee).reduce((acc: Record<string, number>, [userId, hours]) => {
                      const role = memberRoles[userId] || 'Unassigned';
                      acc[role] = (acc[role] || 0) + hours;
                      return acc;
                    }, {});

                    const chartData = {
                      labels: Object.keys(hoursByRole),
                      datasets: [
                        {
                          label: 'Total Real Hours',
                          data: Object.values(hoursByRole),
                          backgroundColor: 'rgba(65, 105, 225, 0.6)',
                          borderColor: 'rgb(65, 105, 225)',
                          borderWidth: 1,
                        },
                      ],
                    };

                    const chartOptions = {
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Hours per Role',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Total Hours'
                          }
                        }
                      }
                    };

                    return <Bar data={chartData} options={chartOptions} />;
                  })()}
                </div>
              </div>

              {/* Task Completion per Developer Chart */}
              <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Task Completion per Developer</h3>
                <div className="h-[300px]">
                  {(() => {
                    // Group tasks by sprint and role
                    const tasksBySprintAndRole = sprints.reduce((acc: Record<string, Record<string, { total: number; completed: number }>>, sprint) => {
                      const currentSprintTasks = sprintTasks[sprint.sprintId] || [];
                      
                      // Initialize sprint entry if it doesn't exist
                      if (!acc[sprint.name]) {
                        acc[sprint.name] = {};
                      }
                      
                      // Count tasks per role in this sprint
                      currentSprintTasks.forEach((task: Task) => {
                        if (task.assignee) {
                          const role = memberRoles[task.assignee] || 'Unassigned';
                          if (!acc[sprint.name][role]) {
                            acc[sprint.name][role] = { total: 0, completed: 0 };
                          }
                          acc[sprint.name][role].total++;
                          if (task.status === "COMPLETED") {
                            acc[sprint.name][role].completed++;
                          }
                        }
                      });
                      
                      return acc;
                    }, {});

                    // If no data, show message
                    if (Object.keys(tasksBySprintAndRole).length === 0) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No task data available for any sprint</p>
                        </div>
                      );
                    }

                    // Prepare data for the chart
                    const sprintNames = Object.keys(tasksBySprintAndRole);
                    const roles = new Set<string>();
                    
                    // Collect all unique roles
                    Object.values(tasksBySprintAndRole).forEach(sprintData => {
                      Object.keys(sprintData).forEach(role => roles.add(role));
                    });

                    const datasets = Array.from(roles).map(role => {
                      const data = sprintNames.map(sprintName => {
                        const sprintData = tasksBySprintAndRole[sprintName][role];
                        return sprintData ? sprintData.completed : 0;
                      });

                      return {
                        label: role,
                        data: data,
                        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
                        borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                        borderWidth: 1,
                      };
                    });

                    const chartData = {
                      labels: sprintNames,
                      datasets: datasets,
                    };

                    const chartOptions = {
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Completed Tasks per Role by Sprint',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Number of Completed Tasks'
                          }
                        }
                      }
                    };

                    return <Bar data={chartData} options={chartOptions} />;
                  })()}
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
