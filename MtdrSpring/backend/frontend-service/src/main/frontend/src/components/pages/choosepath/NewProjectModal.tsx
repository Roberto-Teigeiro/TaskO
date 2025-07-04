/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import React from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function NewProjectModal() {
  const { userId } = useAuth();
  const { user } = useUser();
  const [projectName, setProjectName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // Step 1: Project Name, Step 2: Team Name

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!projectName.trim()) {
        setError("Please enter a project name");
        return;
      }
      setStep(2); // Move to team creation step
      setError("");
    } else {
      if (!teamName.trim()) {
        setError("Please enter a team name");
        return;
      }
      createProjectAndTeam();
    }
  };

  const createProjectAndTeam = () => {
    // Create a variable to store projectData outside the promise chain
    let savedProjectData: any;

    const isLocalhost = window.location.hostname === 'localhost';

    const API_URL_PROJECT_NEW = isLocalhost
      ? 'http://localhost:8080/project/new'
      : '/api/project/new';

    const API_URL_TEAM_ADD = isLocalhost
      ? 'http://localhost:8080/team/add'
      : '/api/team/add';

    // First create the project
    fetch(API_URL_PROJECT_NEW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectName: projectName }),
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create project");
      }
      return response.json();
    })
    .then((projectData) => {
      console.log("Project created:", projectData);
      // Save projectData to use it later
      savedProjectData = projectData;
      
      // Extract the projectId from the response
      const projectId = projectData.projectId;
      
      if (!projectId) {
        throw new Error("Project ID not found in response");
      }
      
      // Then create the team with the returned project ID
      return fetch(API_URL_TEAM_ADD, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          name: teamName,
          projectId: projectId
        }),
      });
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to create team");
      }
      
      console.log("Team created:", response);
      
      // Parse the response to get the saved team with its generated ID
      return response.json();
    })
    .then((savedTeam) => {
      console.log("Saved team data:", savedTeam);
      
      // Extract the team ID from the saved team
      const teamId = savedTeam.id || savedTeam.teamId;
      
      if (!teamId) {
        console.warn("Team ID not found in response, generating a fallback ID");
        // Fallback to a generated ID if not provided by the backend
        return { 
          teamId: teamName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
          message: "Team created successfully"
        };
      }
      
      return {
        teamId: teamId,
        message: "Team created successfully"
      };
    })
    .then((teamData) => {
      // Use the teamId (either from backend or generated)
      const teamId = teamData.teamId;
      
      console.log("Using team ID:", teamId);
      console.log("Using project ID:", savedProjectData.projectId);
      
      // Validate IDs before making the request
      if (!savedProjectData || !savedProjectData.projectId) {
        throw new Error("Project ID is missing or invalid");
      }
      
      if (!teamId) {
        throw new Error("Team ID is missing or invalid");
      }

      const API_URL_ADD_USER = isLocalhost
        ? `http://localhost:8080/project/${savedProjectData.projectId}/adduser/${teamId}`
        : `/api/project/${savedProjectData.projectId}/adduser/${teamId}`;
      
      // Now use savedProjectData instead of projectData
      return fetch(API_URL_ADD_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          userId: userId
        }),
      });
    })
    .then(response => {
      if (!response.ok) {
        // Log detailed error information
        return response.text().then(text => {
          console.error("Error response:", text);
          throw new Error(`Failed to add user to team: ${response.status} ${response.statusText}`);
        });
      }
      console.log("User added to team successfully");
      
      // Update user unsafeMetadata to set manager status (frontend accessible)
      return user?.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          manager: true,
          projectCreator: true,
          projectId: savedProjectData.projectId,
          teamName: teamName
        }
      });
    })
    .then(() => {
      console.log("User metadata updated with manager status");
      // Redirect to dashboard or show success message
      window.location.href = "/dashboard";
    })
    .catch(error => {
      console.error("Error in project/team creation process:", error);
      setError(error.message || "An error occurred during setup");
    });
  };

  return (
    <div className="p-8">
      <div className="relative z-10">
        <h2 className="text-2xl font-medium text-white mb-2">
          {step === 1 ? "Create a Project" : "Create Your First Team"}
        </h2>
        <p className="text-gray-400 mb-8">
          {step === 1 ? "Name your project to get started" : "Create a team you'll be part of"}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-300 mb-2">
                Project name
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 bg-[#3F3A36] border border-[#4A4541] rounded-lg text-white placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-[#C74634] focus:border-transparent transition-all"
                placeholder="My awesome project"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
                Team name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 bg-[#3F3A36] border border-[#4A4541] rounded-lg text-white placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-[#C74634] focus:border-transparent transition-all"
                placeholder="Core team"
                autoFocus
              />
            </div>
          )}

          {error && <p className="mt-2 text-sm text-[#C74634]">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-medium text-gray-300 bg-[#3F3A36] hover:bg-[#4A4541] 
                       border border-[#4A4541] rounded-lg transition-colors"
              onClick={() => step === 1 ? window.history.back() : setStep(1)}
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#C74634] hover:bg-[#B33D2B] 
                       rounded-lg shadow-sm transition-colors"
            >
              {step === 1 ? "Next" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
