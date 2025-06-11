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
import { Users } from 'lucide-react';
import oracleLogo from '@/assets/oracleLogo.svg';
import TeamManagementModal from './TeamManagementModal';

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

interface Team {
  teamId: string;
  name: string;
  projectId: string;
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

  const { userProjects, loading, error, currentProject, userMetadata } = useProjects();
  console.log("User Metadata from Context:", userMetadata);
  
  // Check if user is a manager
  const isManager = userMetadata?.manager === true;
  
  const [sprints, setSprints] = useState<BackendSprint[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string>("");
  const [currentTeamName, setCurrentTeamName] = useState<string>("");
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  const isLocalhost = window.location.hostname === 'localhost';

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
        const API_URL = isLocalhost
          ? `http://localhost:8080/projects/${user.id}/any`
          : `/api/projects/${user.id}/any`;

        const response = await fetch(API_URL);
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
      if (!selectedProject) return;
      setDashboardLoading(true);
      try {
        const API_URL = isLocalhost
          ? `http://localhost:8080/sprintlist/${selectedProject}`
          : `/api/sprintlist/${selectedProject}`;

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch sprints");
        }
        
        const data = (await response.json()) as BackendSprint[];
        
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

        setSprints(sprintsWithStatus);

        // Fetch tasks for each sprint
        const tasksBySprint: Record<string, Task[]> = {};
        for (const sprint of sprintsWithStatus) {
          try {
            const API_URL = isLocalhost
              ? `http://localhost:8080/task/sprint/${sprint.sprintId}`
              : `/api/task/sprint/${sprint.sprintId}`;

            const tasksResponse = await fetch(API_URL);
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
        setSprintTasks(tasksBySprint);
      } catch (err) {
        console.error("Error fetching sprints:", err);
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
        const API_URL = isLocalhost
          ? `http://localhost:8080/projects/${selectedProject}/members`
          : `/api/projects/${selectedProject}/members`;

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch project members");
        }
        
        const members = await response.json();
        const rolesMap = members.reduce((acc: Record<string, string>, member: { userId: string; role?: string }) => {
          acc[member.userId] = member.role || 'Unassigned';
          return acc;
        }, {});
        
        setMemberRoles(rolesMap);
      } catch (error) {
        console.error("Error fetching member roles:", error);
      }
    };

    fetchMemberRoles();
  }, [selectedProject]);

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedProject) return;
      
      try {
        const API_URL = isLocalhost
          ? `http://localhost:8080/team/${selectedProject}`
          : `/api/team/${selectedProject}`;

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        
        const teams = await response.json();
        setAvailableTeams(teams);
        
        // If no current team is selected and teams exist, select the first one
        if (!currentTeamId && teams.length > 0) {
          setCurrentTeamId(teams[0].teamId);
          setCurrentTeamName(teams[0].name);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, [selectedProject]);

  // Update team name when team ID changes
  useEffect(() => {
    if (currentTeamId && availableTeams.length > 0) {
      const team = availableTeams.find(t => t.teamId === currentTeamId);
      if (team) {
        setCurrentTeamName(team.name);
      }
    }
  }, [currentTeamId, availableTeams]);

  const handleTeamSwitch = (teamId: string) => {
    setCurrentTeamId(teamId);
    const team = availableTeams.find(t => t.teamId === teamId);
    if (team) {
      setCurrentTeamName(team.name);
    }
    console.log("Switched to team:", teamId);
    // You can add additional logic here if needed, such as:
    // - Refreshing data based on the selected team
    // - Storing team preference in localStorage
    // - Updating application state
  };

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
      <Header title="Dashboard" currentTeamName={currentTeamName} />

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
            <div>
              <h2 className="text-2xl font-bold">
                Welcome back, {user?.firstName ?? ""} {user?.lastName ?? ""} 👋
              </h2>
              
              {/* Display user role */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isManager 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isManager ? '👨‍💼 Manager' : '👨‍💻 Developer'}
                </span>
              </div>
            </div>
            
            {/* Team Management Button - Only show to managers */}
            {isManager && (
              <button
                onClick={() => setShowTeamModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#312D2A] text-white rounded-lg hover:bg-[#e55555] transition-colors shadow-sm"
              >
                <Users className="w-5 h-5" />
                <span>Manage Teams</span>
              </button>
            )}
          </div>  

          {/* Team Management Modal - Only render for managers */}
          {isManager && (
            <TeamManagementModal
              isOpen={showTeamModal}
              onClose={() => setShowTeamModal(false)}
              currentProjectId={selectedProject}
              currentTeamId={currentTeamId}
              onTeamSwitch={handleTeamSwitch}
            />
          )}

          {/* Task Section - Conditional rendering based on manager status */}
          {isManager ? (
            // Manager Dashboard - Show all analytics and charts
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-800">Manager Analytics Dashboard</h3>
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {/* Real Hours per Developer per Sprint Chart */}
                <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-xl mb-4">Real Hours Worked per Developer per Sprint</h3>
                  <div className="h-[300px]">
                    {(() => {
                      // Group real hours by sprint and developer, sorted by role
                      const hoursBySprintAndRole = sprints.reduce((acc: Record<string, Record<string, number>>, sprint) => {
                        const currentSprintTasks = sprintTasks[sprint.sprintId] || [];
                        
                        // Initialize sprint entry if it doesn't exist
                        if (!acc[sprint.name]) {
                          acc[sprint.name] = {};
                        }
                        
                        // Sum real hours per developer in this sprint
                        currentSprintTasks.forEach((task: Task) => {
                          if (task.assignee && task.realHours) {
                            const role = memberRoles[task.assignee] || 'Unassigned';
                            if (!acc[sprint.name][role]) {
                              acc[sprint.name][role] = 0;
                            }
                            acc[sprint.name][role] += task.realHours;
                          }
                        });
                        
                        return acc;
                      }, {});

                      // If no data, show message
                      if (Object.keys(hoursBySprintAndRole).length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No real hours data available for any sprint</p>
                          </div>
                        );
                      }

                      // Prepare data for the chart
                      const sprintNames = Object.keys(hoursBySprintAndRole);
                      const roles = new Set<string>();
                      
                      // Collect all unique roles
                      Object.values(hoursBySprintAndRole).forEach(sprintData => {
                        Object.keys(sprintData).forEach(role => roles.add(role));
                      });

                      const datasets = Array.from(roles).map(role => {
                        const data = sprintNames.map(sprintName => {
                          const sprintData = hoursBySprintAndRole[sprintName][role];
                          return sprintData || 0;
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
                            text: 'Real Hours Developer per Sprint',
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Real Hours'
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

                {/* Total Real Hours Invested per Sprint Chart */}
                <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-xl mb-4">Total Real Hours Invested per Sprint</h3>
                  <div className="h-[300px]">
                    {(() => {
                      // Calculate total real hours for each sprint
                      const totalRealHoursBySprint = sprints.map(sprint => {
                        const tasks = sprintTasks[sprint.sprintId] || [];
                        return tasks.reduce((total, task) => total + (task.realHours || 0), 0);
                      });

                      // If no data, show message
                      if (totalRealHoursBySprint.every(hours => hours === 0)) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No real hours data available for any sprint</p>
                          </div>
                        );
                      }

                      const chartData = {
                        labels: sprints.map(sprint => sprint.name),
                        datasets: [
                          {
                            label: 'Total Real Hours',
                            data: totalRealHoursBySprint,
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
                            text: 'Total Real Hours per Sprint',
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
              </div>

              {/* Task Details Table - Manager view with all details */}
              <div className="mt-6 break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-xl mb-4">Task Details (Manager View)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Task Name</th>
                        <th className="py-2 px-4 border-b">Role</th>
                        <th className="py-2 px-4 border-b">Estimated Hours</th>
                        <th className="py-2 px-4 border-b">Real Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprints.map(sprint => (
                        (sprintTasks[sprint.sprintId] || []).map(task => (
                          <tr key={task.taskId}>
                            <td className="py-2 px-4 border-b">{task.title}</td>
                            <td className="py-2 px-4 border-b">{task.assignee ? memberRoles[task.assignee] || 'Unassigned' : 'Unassigned'}</td>
                            <td className="py-2 px-4 border-b">{task.estimatedHours || 'N/A'}</td>
                            <td className="py-2 px-4 border-b">{task.realHours || 'N/A'}</td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            // Developer Dashboard - Show simplified view
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-blue-800">My Dashboard</h3>
              
              {/* Developer-specific content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* My Tasks Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-lg mb-4">My Tasks</h3>
                  {(() => {
                    // Filter tasks assigned to current user
                    const myTasks = sprints.flatMap(sprint => 
                      (sprintTasks[sprint.sprintId] || []).filter(task => 
                        task.assignee === user?.id
                      )
                    );

                    const completedTasks = myTasks.filter(task => task.status === "COMPLETED").length;
                    const totalTasks = myTasks.length;

                    return (
                      <div className="space-y-2">
                        <p>Total Tasks: {totalTasks}</p>
                        <p>Completed: {completedTasks}</p>
                        <p>In Progress: {totalTasks - completedTasks}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* My Hours Summary */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-lg mb-4">My Hours</h3>
                  {(() => {
                    const myTasks = sprints.flatMap(sprint => 
                      (sprintTasks[sprint.sprintId] || []).filter(task => 
                        task.assignee === user?.id
                      )
                    );

                    const totalEstimated = myTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
                    const totalReal = myTasks.reduce((sum, task) => sum + (task.realHours || 0), 0);

                    return (
                      <div className="space-y-2">
                        <p>Estimated Hours: {totalEstimated}</p>
                        <p>Real Hours: {totalReal}</p>
                        <p>Variance: {totalReal - totalEstimated} hours</p>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* My Task List - Developer view with only their tasks */}
              <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium text-lg mb-4">My Task Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 border-b">Task Name</th>
                        <th className="py-2 px-4 border-b">Sprint</th>
                        <th className="py-2 px-4 border-b">Status</th>
                        <th className="py-2 px-4 border-b">Estimated Hours</th>
                        <th className="py-2 px-4 border-b">Real Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprints.map(sprint => (
                        (sprintTasks[sprint.sprintId] || [])
                          .filter(task => task.assignee === user?.id)
                          .map(task => (
                            <tr key={task.taskId}>
                              <td className="py-2 px-4 border-b">{task.title}</td>
                              <td className="py-2 px-4 border-b">{sprint.name}</td>
                              <td className="py-2 px-4 border-b">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  task.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {task.status || 'Not Started'}
                                </span>
                              </td>
                              <td className="py-2 px-4 border-b">{task.estimatedHours || 'N/A'}</td>
                              <td className="py-2 px-4 border-b">{task.realHours || 'N/A'}</td>
                            </tr>
                          ))
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Project List - Show projects assigned to the user */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">My Projects</h3>
            {projectsArray.length === 0 ? (
              <p>No projects found</p>
            ) : (
              <ul>
                {projectsArray.map((project) => (
                  <li key={project.id} className="mb-2">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <h4 className="font-medium text-md">{project.name}</h4>
                      {/* Add other project details as needed */}
                    </div>
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
