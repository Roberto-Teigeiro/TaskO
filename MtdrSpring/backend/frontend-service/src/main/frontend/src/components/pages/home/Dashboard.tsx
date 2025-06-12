///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/pages/home/Dashboard.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react"; // Agregar useMemo y useCallback
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { useUser } from "@clerk/react-router";
import { useProjects } from '../../../context/ProjectContext';
import { useUserResolver } from '../../hooks/useUserResolver';
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
  const { resolveUserNames } = useUserResolver();
  
  // Memoizar el console.log para evitar re-renders innecesarios
  useMemo(() => {
    if (userMetadata) {
      console.log("User Metadata from Context:", userMetadata);
    }
  }, [userMetadata]);
  
  // Memoizar el cálculo del manager
  const isManager = useMemo(() => userMetadata?.manager === true, [userMetadata?.manager]);
  
  const [sprints, setSprints] = useState<BackendSprint[]>([]);
  const [sprintTasks, setSprintTasks] = useState<Record<string, Task[]>>({});
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentTeamId, setCurrentTeamId] = useState<string>("");
  const [currentTeamName, setCurrentTeamName] = useState<string>("");
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);

  const isLocalhost = window.location.hostname === 'localhost';

  // Memoizar la función para evitar re-creaciones
  const getUserDisplayName = useCallback((userId: string): string => {
    return memberNames[userId] || `User ${userId.slice(-8)}`;
  }, [memberNames]);

  // Memoizar projectsArray
  const projectsArray = useMemo(() => 
    Array.isArray(userProjects) ? userProjects : [], 
    [userProjects]
  );

  // Set selected project when currentProject or userProjects changes
  useEffect(() => {
    if (currentProject?.projectId) {
      setSelectedProject(currentProject.projectId);
    } else if (projectsArray.length > 0) {
      setSelectedProject(projectsArray[0].projectId);
    }
  }, [currentProject?.projectId, projectsArray]); // Dependencias más específicas

  // Optimizar checkUserProjects
  const checkUserProjects = useCallback(async () => {
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
  }, [user?.id, isLocalhost, navigate]);

  useEffect(() => {
    if (isSignedIn && !loading) {
      checkUserProjects();
    }
  }, [isSignedIn, loading, checkUserProjects]);

  // Optimizar fetchSprints
  const fetchSprints = useCallback(async () => {
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
  }, [selectedProject, isLocalhost]);

  useEffect(() => {
    fetchSprints();
  }, [fetchSprints]);

  // Optimizar fetchMemberRoles
  const fetchMemberRoles = useCallback(async () => {
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
      
      // Mapear roles
      const rolesMap = members.reduce((acc: Record<string, string>, member: { userId: string; role?: string }) => {
        acc[member.userId] = member.role || 'Unassigned';
        return acc;
      }, {});
      setMemberRoles(rolesMap);

      // Extraer IDs de usuario únicos y resolver nombres - ALTERNATIVA SIMPLE
      const userIds: string[] = [...new Set(
        members
          .map((member: any) => member.userId)
          .filter(Boolean)
      )] as string[];

      if (userIds.length > 0) {
        const resolvedNames = await resolveUserNames(userIds);
        setMemberNames(resolvedNames);
      }
      
    } catch (error) {
      console.error("Error fetching member roles:", error);
    }
  }, [selectedProject, isLocalhost, resolveUserNames]);

  useEffect(() => {
    fetchMemberRoles();
  }, [fetchMemberRoles]);

  // Optimizar fetchTeams
  const fetchTeams = useCallback(async () => {
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
  }, [selectedProject, isLocalhost, currentTeamId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Update team name when team ID changes
  useEffect(() => {
    if (currentTeamId && availableTeams.length > 0) {
      const team = availableTeams.find(t => t.teamId === currentTeamId);
      if (team) {
        setCurrentTeamName(team.name);
      }
    }
  }, [currentTeamId, availableTeams]);

  // Optimizar handleTeamSwitch
  const handleTeamSwitch = useCallback((teamId: string) => {
    setCurrentTeamId(teamId);
    const team = availableTeams.find(t => t.teamId === teamId);
    if (team) {
      setCurrentTeamName(team.name);
    }
    console.log("Switched to team:", teamId);
  }, [availableTeams]);

  // Memoizar datos de los charts para evitar recálculos innecesarios
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
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-md font-medium ${
                  isManager 
                    ? 'bg-gray-200 text-[#312D2A]' 
                    : 'bg-gray-200 text-[#C74634]'
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
            // Manager Dashboard - Show all analytics and charts with NAMES instead of roles
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4 text-[#312D2A]">Manager Analytics Dashboard</h3>
              <div className="columns-1 md:columns-2 gap-6 space-y-6">
                {/* Real Hours per Developer per Sprint Chart */}
                <div className="break-inside-avoid bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-xl mb-4">Real Hours Worked per Developer per Sprint</h3>
                  <div className="h-[300px]">
                    {(() => {
                      // Group real hours by sprint and DEVELOPER NAME (not role)
                      const hoursBySprintAndDeveloper = sprints.reduce((acc: Record<string, Record<string, number>>, sprint) => {
                        const currentSprintTasks = sprintTasks[sprint.sprintId] || [];
                        
                        // Initialize sprint entry if it doesn't exist
                        if (!acc[sprint.name]) {
                          acc[sprint.name] = {};
                        }
                        
                        // Sum real hours per developer NAME in this sprint
                        currentSprintTasks.forEach((task: Task) => {
                          if (task.assignee && task.realHours) {
                            const developerName = getUserDisplayName(task.assignee); // Usar nombre en lugar de rol
                            if (!acc[sprint.name][developerName]) {
                              acc[sprint.name][developerName] = 0;
                            }
                            acc[sprint.name][developerName] += task.realHours;
                          }
                        });
                        
                        return acc;
                      }, {});

                      // If no data, show message
                      if (Object.keys(hoursBySprintAndDeveloper).length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No real hours data available for any sprint</p>
                          </div>
                        );
                      }

                      // Prepare data for the chart
                      const sprintNames = Object.keys(hoursBySprintAndDeveloper);
                      const developers = new Set<string>();
                      
                      // Collect all unique developer names
                      Object.values(hoursBySprintAndDeveloper).forEach(sprintData => {
                        Object.keys(sprintData).forEach(dev => developers.add(dev));
                      });

                      const datasets = Array.from(developers).map((developer, index) => {
                        const data = sprintNames.map(sprintName => {
                          const sprintData = hoursBySprintAndDeveloper[sprintName][developer];
                          return sprintData || 0;
                        });

                        // Colores más distintivos para cada desarrollador
                        const colors = [
                          'rgba(255, 107, 107, 0.6)', // Rojo
                          'rgba(54, 162, 235, 0.6)',  // Azul
                          'rgba(255, 206, 86, 0.6)',  // Amarillo
                          'rgba(75, 192, 192, 0.6)',  // Verde
                          'rgba(153, 102, 255, 0.6)', // Púrpura
                          'rgba(255, 159, 64, 0.6)',  // Naranja
                        ];

                        return {
                          label: developer,
                          data: data,
                          backgroundColor: colors[index % colors.length],
                          borderColor: colors[index % colors.length].replace('0.6', '1'),
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
                            text: 'Real Hours per Developer per Sprint',
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
                      // Group tasks by sprint and DEVELOPER NAME
                      const tasksBySprintAndDeveloper = sprints.reduce((acc: Record<string, Record<string, { total: number; completed: number }>>, sprint) => {
                        const currentSprintTasks = sprintTasks[sprint.sprintId] || [];
                        
                        // Initialize sprint entry if it doesn't exist
                        if (!acc[sprint.name]) {
                          acc[sprint.name] = {};
                        }
                        
                        // Count tasks per developer NAME in this sprint
                        currentSprintTasks.forEach((task: Task) => {
                          if (task.assignee) {
                            const developerName = getUserDisplayName(task.assignee); // Usar nombre en lugar de rol
                            if (!acc[sprint.name][developerName]) {
                              acc[sprint.name][developerName] = { total: 0, completed: 0 };
                            }
                            acc[sprint.name][developerName].total++;
                            if (task.status === "COMPLETED") {
                              acc[sprint.name][developerName].completed++;
                            }
                          }
                        });
                        
                        return acc;
                      }, {});

                      // If no data, show message
                      if (Object.keys(tasksBySprintAndDeveloper).length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-gray-500">No task data available for any sprint</p>
                          </div>
                        );
                      }

                      // Prepare data for the chart
                      const sprintNames = Object.keys(tasksBySprintAndDeveloper);
                      const developers = new Set<string>();
                      
                      // Collect all unique developer names
                      Object.values(tasksBySprintAndDeveloper).forEach(sprintData => {
                        Object.keys(sprintData).forEach(dev => developers.add(dev));
                      });

                      const datasets = Array.from(developers).map((developer, index) => {
                        const data = sprintNames.map(sprintName => {
                          const sprintData = tasksBySprintAndDeveloper[sprintName][developer];
                          return sprintData ? sprintData.completed : 0;
                        });

                        // Usar los mismos colores que en el gráfico anterior
                        const colors = [
                          'rgba(255, 107, 107, 0.6)', // Rojo
                          'rgba(54, 162, 235, 0.6)',  // Azul
                          'rgba(255, 206, 86, 0.6)',  // Amarillo
                          'rgba(75, 192, 192, 0.6)',  // Verde
                          'rgba(153, 102, 255, 0.6)', // Púrpura
                          'rgba(255, 159, 64, 0.6)',  // Naranja
                        ];

                        return {
                          label: developer,
                          data: data,
                          backgroundColor: colors[index % colors.length],
                          borderColor: colors[index % colors.length].replace('0.6', '1'),
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
                            text: 'Completed Tasks per Developer by Sprint',
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

                {/* Total Real Hours Invested per Sprint Chart - No changes needed */}
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

              {/* Task Details Table - Manager view with NAMES instead of roles */}
              <div className="mt-6 break-inside-avoid bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-medium text-xl mb-6 text-center">Task Details (Manager View)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Task Name
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estimated Hours
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Real Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sprints.map(sprint => (
                        (sprintTasks[sprint.sprintId] || []).map((task, index) => (
                          <tr 
                            key={task.taskId}
                            className={`hover:bg-gray-50 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                            }`}
                          >
                            <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                              <div className="max-w-xs">
                                <p className="truncate" title={task.title}>
                                  {task.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Sprint: {sprint.name}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-medium text-gray-900">
                                  {task.assignee ? getUserDisplayName(task.assignee) : 'Unassigned'}
                                </span>
                                {task.assignee && (
                                  <span className="text-xs text-gray-500 mt-1">
                                    ID: {task.assignee.slice(-8)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                task.assignee && memberRoles[task.assignee] && memberRoles[task.assignee] !== 'Unassigned'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {task.assignee ? memberRoles[task.assignee] || 'Unassigned' : 'Unassigned'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`text-sm font-medium ${
                                  task.estimatedHours ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                  {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex flex-col items-center">
                                <span className={`text-sm font-medium ${
                                  task.realHours ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                  {task.realHours ? `${task.realHours}h` : 'N/A'}
                                </span>
                                {task.estimatedHours && task.realHours && (
                                  <span className={`text-xs mt-1 ${
                                    task.realHours > task.estimatedHours 
                                      ? 'text-red-600' 
                                      : task.realHours < task.estimatedHours 
                                        ? 'text-green-600' 
                                        : 'text-gray-600'
                                  }`}>
                                    {task.realHours > task.estimatedHours ? '+' : ''}
                                    {task.realHours - task.estimatedHours}h
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Empty state if no tasks */}
                  {sprints.every(sprint => (sprintTasks[sprint.sprintId] || []).length === 0) && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">📋</div>
                      <p className="text-gray-500 text-sm">No tasks found in any sprint</p>
                    </div>
                  )}
                </div>
                
                {/* Summary Row */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
                      <p className="text-xl font-bold text-blue-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || []).length, 0
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600 font-medium">Total Estimated</p>
                      <p className="text-xl font-bold text-green-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || []).reduce((sum, task) => 
                            sum + (task.estimatedHours || 0), 0
                          ), 0
                        )}h
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-orange-600 font-medium">Total Real</p>
                      <p className="text-xl font-bold text-orange-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || []).reduce((sum, task) => 
                            sum + (task.realHours || 0), 0
                          ), 0
                        )}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Developer Dashboard - Show simplified view (no changes needed here)
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
              <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-medium text-xl mb-6 text-center">My Task Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="py-3 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Task Name
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Sprint
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Estimated Hours
                        </th>
                        <th className="py-3 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Real Hours
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sprints.map(sprint => (
                        (sprintTasks[sprint.sprintId] || [])
                          .filter(task => task.assignee === user?.id)
                          .map((task, index) => (
                            <tr 
                              key={task.taskId}
                              className={`hover:bg-gray-50 transition-colors ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                              }`}
                            >
                              <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                                <div className="max-w-xs">
                                  <p className="truncate" title={task.title}>
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    ID: {task.taskId.slice(-8)}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {sprint.name}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  task.status === 'COMPLETED' 
                                    ? 'bg-green-100 text-green-800'
                                    : task.status === 'IN_PROGRESS'
                                      ? 'bg-blue-100 text-blue-800'
                                      : task.status === 'TODO'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {task.status === 'COMPLETED' ? '✅ Completed' :
                                   task.status === 'IN_PROGRESS' ? '🔄 In Progress' :
                                   task.status === 'TODO' ? '📋 To Do' :
                                   '⏸️ Not Started'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`text-sm font-medium ${
                                    task.estimatedHours ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex flex-col items-center">
                                  <span className={`text-sm font-medium ${
                                    task.realHours ? 'text-gray-900' : 'text-gray-400'
                                  }`}>
                                    {task.realHours ? `${task.realHours}h` : 'N/A'}
                                  </span>
                                  {task.estimatedHours && task.realHours && (
                                    <span className={`text-xs mt-1 ${
                                      task.realHours > task.estimatedHours 
                                        ? 'text-red-600' 
                                        : task.realHours < task.estimatedHours 
                                          ? 'text-green-600' 
                                          : 'text-gray-600'
                                    }`}>
                                      {task.realHours > task.estimatedHours ? '+' : ''}
                                      {task.realHours - task.estimatedHours}h
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Empty state if no tasks assigned to developer */}
                  {sprints.every(sprint => 
                    (sprintTasks[sprint.sprintId] || []).filter(task => task.assignee === user?.id).length === 0
                  ) && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg mb-2">👨‍💻</div>
                      <p className="text-gray-500 text-sm">No tasks assigned to you yet</p>
                      <p className="text-gray-400 text-xs mt-1">Contact your manager to get tasks assigned</p>
                    </div>
                  )}
                </div>
                
                {/* Developer Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-600 font-medium">My Tasks</p>
                      <p className="text-xl font-bold text-blue-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || []).filter(task => task.assignee === user?.id).length, 0
                        )}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600 font-medium">Completed</p>
                      <p className="text-xl font-bold text-green-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || []).filter(task => 
                            task.assignee === user?.id && task.status === 'COMPLETED'
                          ).length, 0
                        )}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-sm text-purple-600 font-medium">My Estimated</p>
                      <p className="text-xl font-bold text-purple-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || [])
                            .filter(task => task.assignee === user?.id)
                            .reduce((sum, task) => sum + (task.estimatedHours || 0), 0), 0
                        )}h
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-sm text-orange-600 font-medium">My Real</p>
                      <p className="text-xl font-bold text-orange-800">
                        {sprints.reduce((total, sprint) => 
                          total + (sprintTasks[sprint.sprintId] || [])
                            .filter(task => task.assignee === user?.id)
                            .reduce((sum, task) => sum + (task.realHours || 0), 0), 0
                        )}h
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>
    </div>
  );
}
