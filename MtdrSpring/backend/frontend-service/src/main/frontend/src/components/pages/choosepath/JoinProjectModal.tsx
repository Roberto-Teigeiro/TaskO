/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@clerk/clerk-react";

interface Project {
  projectId: string;
  projectName: string;
}

interface Team {
  teamId: string;
  name: string;
  projectId: string;
}

export default function JoinProjectModal() {
  const { userId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Select Project, Step 2: Select Team

  const isLocalhost = window.location.hostname === 'localhost';

  const API_URL_ALL_PROJECTS = isLocalhost
    ? 'http://localhost:8080/project/all'
    : '/api/project/all';

  // Fetch all projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL_ALL_PROJECTS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error: any) {
      console.error("Error fetching projects:", error);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async (projectId: string) => {
    
    setLoading(true);
    try {
      const API_URL_TEAMS = isLocalhost
        ? `http://localhost:8080/team/${projectId}`
        : `/api/team/${projectId}`;

      const response = await fetch(API_URL_TEAMS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const teamsData = await response.json();
      console.log(teamsData);
      setTeams(teamsData);
      setStep(2);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setSelectedTeam(null);
    setError("");
    fetchTeams(project.projectId);
  };

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setError("");
  };

  const joinProjectAndTeam = async () => {
    if (!selectedProject || !selectedTeam || !userId) {
      setError("Missing required information");
      return;
    }

    setLoading(true);
    try {
      const API_URL_ADD_USER = isLocalhost
        ? `http://localhost:8080/project/${selectedProject.projectId}/adduser/${selectedTeam.teamId}`
        : `/api/project/${selectedProject.projectId}/adduser/${selectedTeam.teamId}`;

      const response = await fetch(API_URL_ADD_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: userId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Failed to join project: ${response.status} ${response.statusText}`);
      }

      console.log("Successfully joined project and team");
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Error joining project:", error);
      setError(error.message || "Failed to join project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!selectedProject) {
        setError("Please select a project");
        return;
      }
      // Project is already selected and teams are being fetched
    } else {
      if (!selectedTeam) {
        setError("Please select a team");
        return;
      }
      joinProjectAndTeam();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedTeam(null);
      setTeams([]);
      setError("");
    }
  };

  return (
    <div className="p-8">
      <div className="relative z-10">
        <h2 className="text-2xl font-medium text-white mb-2">
          {step === 1 ? "Join a Project" : "Select a Team"}
        </h2>
        <p className="text-gray-400 mb-8">
          {step === 1 
            ? "Choose a project to join and collaborate with others" 
            : `Select a team in ${selectedProject?.projectName}`}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-2">
                Available Projects
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-gray-400 text-center py-4">Loading projects...</div>
                ) : projects.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No projects available</div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.projectId}
                      onClick={() => handleProjectSelect(project)}
                      className={`w-full p-4 bg-[#3F3A36] border border-[#4A4541] rounded-lg text-white
                                cursor-pointer transition-all hover:bg-[#4A4541] hover:border-[#C74634]
                                ${selectedProject?.projectId === project.projectId 
                                  ? 'border-[#C74634] bg-[#4A4541]' 
                                  : ''}`}
                    >
                      <div className="font-medium">{project.projectName}</div>
                      <div className="text-sm text-gray-400">Project ID: {project.projectId}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-300 mb-2">
                Available Teams
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-gray-400 text-center py-4">Loading teams...</div>
                ) : teams.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">No teams available for this project</div>
                ) : (
                  teams.map((team) => (
                    <div
                      key={team.teamId}
                      onClick={() => handleTeamSelect(team)}
                      className={`w-full p-4 bg-[#3F3A36] border border-[#4A4541] rounded-lg text-white
                                cursor-pointer transition-all hover:bg-[#4A4541] hover:border-[#C74634]
                                ${selectedTeam?.teamId === team.teamId 
                                  ? 'border-[#C74634] bg-[#4A4541]' 
                                  : ''}`}
                    >
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-400">Team ID: {team.teamId}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {error && <p className="mt-2 text-sm text-[#C74634]">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-[#3F3A36] hover:bg-[#4A4541] 
                       border border-[#4A4541] rounded-lg transition-colors"
              onClick={step === 1 ? () => window.history.back() : handleBack}
              disabled={loading}
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#C74634] hover:bg-[#B33D2B] 
                       rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (step === 1 ? !selectedProject : !selectedTeam)}
            >
              {loading ? "Loading..." : (step === 1 ? "Next" : "Join Team")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 