///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/src/main/frontend/src/components/pages/home/Dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { CompletedTaskItem } from "@/components/ui/Task-item";
import { ProgressCircle } from "@/components/ui/Progress-circle";
import { useUser } from "@clerk/react-router";
import { useProjects } from '../../../context/ProjectContext';
import { useNavigate } from 'react-router-dom';

interface BackendSprint {
  sprintId: string;
  projectId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { userProjects, loading, error, currentProject } = useProjects();
  const [sprintStats, setSprintStats] = useState({
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    total: 0
  });

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
      if (!currentProject?.projectId) return;

      try {
        const response = await fetch(`http://localhost:8080/sprintlist/${currentProject.projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch sprints');
        }
        
        const data = await response.json() as BackendSprint[];
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
            id: sprint.sprintId,
            name: sprint.title,
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            status
          };
        });

        // Calculate sprint statistics
        const totalSprints = sprintsWithStatus.length;
        const stats = {
          completed: sprintsWithStatus.filter((s) => s.status === "Completed").length,
          inProgress: sprintsWithStatus.filter((s) => s.status === "In Progress").length,
          notStarted: sprintsWithStatus.filter((s) => s.status === "Not Started").length,
          total: totalSprints
        };
        
        setSprintStats(stats);
      } catch (err) {
        console.error('Error fetching sprints:', err);
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
              Welcome back, {user?.firstName ?? ''} {user?.lastName ?? ''} 👋
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <Avatar className="border-2 border-white w-8 h-8">
                  <AvatarImage src={user?.imageUrl || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              
                {[...Array(4)].map((_, i) => {
                  const uniqueKey = `avatar-${i}-${Date.now()}`; // Better approach is to have real IDs
                  return (
                    <Avatar key={uniqueKey} className="border-2 border-white w-8 h-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Status */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-medium mb-4">Sprint Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#32CD32]"></div>
                      <span>Completed</span>
                    </div>
                    <span className="font-semibold">{sprintStats.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4169E1]"></div>
                      <span>In Progress</span>
                    </div>
                    <span className="font-semibold">{sprintStats.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#ff6b6b]"></div>
                      <span>Not Started</span>
                    </div>
                    <span className="font-semibold">{sprintStats.notStarted}</span>
                  </div>
                </div>
              </div>

              {/* Task Status and Completed Tasks */}
              <div className="space-y-6">
                {/* Task Status */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium mb-4">Sprints Status KPI</h3>

                  {/* Progress Circles */}
                  <div className="flex justify-around items-center">
                    <ProgressCircle 
                      value={sprintStats.total > 0 ? Math.round((sprintStats.completed / sprintStats.total) * 100) : 0} 
                      color="#32CD32" 
                      label={`Completed (${sprintStats.completed}/${sprintStats.total})`} 
                    />
                    <ProgressCircle 
                      value={sprintStats.total > 0 ? Math.round((sprintStats.inProgress / sprintStats.total) * 100) : 0} 
                      color="#4169E1" 
                      label={`In Progress (${sprintStats.inProgress}/${sprintStats.total})`} 
                    />
                    <ProgressCircle 
                      value={sprintStats.total > 0 ? Math.round((sprintStats.notStarted / sprintStats.total) * 100) : 0} 
                      color="#ff6b6b" 
                      label={`Not Started (${sprintStats.notStarted}/${sprintStats.total})`} 
                    />
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-4">Completed Tasks</h3>

                  {/* Completed Task Items */}
                  {[...Array(2)].map((_, i) => (
                    <CompletedTaskItem
                      key={i}
                      title={`Completed Task ${i + 1}`}
                      description={`Details about completed task ${i + 1}`}
                      daysAgo={i + 1}
                      image=""
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h1>Your Projects</h1>
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
