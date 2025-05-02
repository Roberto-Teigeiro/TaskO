/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import React from "react";
import { useAuth } from "@clerk/clerk-react";
export default function NewProjectModal() {
  const { userId } = useAuth();
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

    // First create the project
    fetch("/api/project/new", {
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
        return fetch("/api/team/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: teamName,
            projectId: projectId,
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
          console.warn(
            "Team ID not found in response, generating a fallback ID",
          );
          // Fallback to a generated ID if not provided by the backend
          return {
            teamId:
              teamName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
            message: "Team created successfully",
          };
        }

        return {
          teamId: teamId,
          message: "Team created successfully",
        };
      })
      .then((teamData) => {
        // Use the teamId (either from backend or generated)
        const teamId = teamData.teamId;

        console.log("Using team ID:", teamId);

        // Now use savedProjectData instead of projectData
        return fetch(
          `/api/project/${savedProjectData.projectId}/adduser/${teamId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
            }),
          },
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add user to team");
        }
        console.log("User added to team successfully");
        // Redirect to dashboard or show success message
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        console.error("Error in project/team creation process:", error);
        setError(error.message || "An error occurred during setup");
      });
  };

  return (
    <div className="p-6 relative">
      {/* Rainbow border effect */}
      <div className="absolute inset-0 rounded-lg p-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 via-teal-500 to-blue-500">
        <div className="bg-white h-full w-full rounded-md"></div>
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-purple-800 mb-4">
          {step === 1 ? "Create a Project" : "Create Your First Team"}
        </h2>
        <p className="text-gray-600 mb-6">
          {step === 1
            ? "Name your project to get started"
            : "Create a team you'll be part of"}
        </p>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div className="mb-6">
              <label
                htmlFor="projectName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="My awesome project"
                autoFocus
              />
            </div>
          ) : (
            <div className="mb-6">
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Core team"
                autoFocus
              />
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => (step === 1 ? window.history.back() : setStep(1))}
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              {step === 1 ? "Next" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
