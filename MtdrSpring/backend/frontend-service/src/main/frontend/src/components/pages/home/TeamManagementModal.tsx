/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@clerk/clerk-react";
import { Users, Plus, X, UserPlus } from "lucide-react";

interface Team {
  teamId: string;
  name: string;
  projectId: string;
}

interface TeamManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: string;
  currentTeamId?: string;
  onTeamSwitch?: (teamId: string) => void;
}

export default function TeamManagementModal({ 
  isOpen, 
  onClose, 
  currentProjectId, 
  currentTeamId, 
  onTeamSwitch 
}: TeamManagementModalProps) {
  const { userId } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState(currentTeamId || "");

  const isLocalhost = window.location.hostname === 'localhost';

  // Fetch teams when modal opens or project changes
  useEffect(() => {
    if (isOpen && currentProjectId) {
      fetchTeams();
    }
  }, [isOpen, currentProjectId]);

  // Update selected team when prop changes
  useEffect(() => {
    setSelectedTeamId(currentTeamId || "");
  }, [currentTeamId]);

  const fetchTeams = async () => {
    setLoading(true);
    setError("");
    try {
      const API_URL = isLocalhost
        ? `http://localhost:8080/team/${currentProjectId}`
        : `/api/team/${currentProjectId}`;

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const teamsData = await response.json();
      setTeams(teamsData);
    } catch (error: any) {
      console.error("Error fetching teams:", error);
      setError("Failed to load teams. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      setError("Please enter a team name");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const API_URL = isLocalhost
        ? 'http://localhost:8080/team/add'
        : '/api/team/add';

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newTeamName,
          projectId: currentProjectId
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create team");
      }

      const newTeam = await response.json();
      console.log("Team created successfully:", newTeam);
      
      // Refresh teams list
      await fetchTeams();
      
      // Reset form
      setNewTeamName("");
      setShowCreateForm(false);
      
      // Automatically join the newly created team if user wants to
      if (newTeam.teamId || newTeam.id) {
        const teamId = newTeam.teamId || newTeam.id;
        await joinTeam(teamId);
      }
    } catch (error: any) {
      console.error("Error creating team:", error);
      setError(error.message || "Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (!userId) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      const API_URL = isLocalhost
        ? `http://localhost:8080/project/${currentProjectId}/adduser/${teamId}`
        : `/api/project/${currentProjectId}/adduser/${teamId}`;

      const response = await fetch(API_URL, {
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
        throw new Error(`Failed to join team: ${response.status} ${response.statusText}`);
      }

      console.log("Successfully joined team");
      setSelectedTeamId(teamId);
      
      // Notify parent component of team switch
      if (onTeamSwitch) {
        onTeamSwitch(teamId);
      }
    } catch (error: any) {
      console.error("Error joining team:", error);
      setError(error.message || "Failed to join team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    if (onTeamSwitch) {
      onTeamSwitch(teamId);
    }
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setNewTeamName("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto overflow-hidden border">
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#ff6767]"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-[#ff6767]" />
            <h2 className="text-xl font-semibold text-gray-900">
              {showCreateForm ? "Create New Team" : "Team Management"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showCreateForm ? (
            /* Create Team Form */
            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={newTeamName}
                  onChange={(e) => {
                    setNewTeamName(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6767] focus:border-transparent"
                  placeholder="Enter team name"
                  autoFocus
                />
              </div>
              
              {error && <p className="text-sm text-red-600">{error}</p>}
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewTeamName("");
                    setError("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={createTeam}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#ff6767] hover:bg-[#e55555] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !newTeamName.trim()}
                >
                  {loading ? "Creating..." : "Create Team"}
                </button>
              </div>
            </div>
          ) : (
            /* Teams List */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Select a team or create a new one
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#ff6767] border border-[#ff6767] rounded-lg hover:bg-[#ff6767] hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Team
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#ff6767] border-t-transparent mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading teams...</p>
                </div>
              ) : teams.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No teams found for this project</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#ff6767] rounded-lg hover:bg-[#e55555] transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Team
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {teams.map((team) => (
                    <div
                      key={team.teamId}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedTeamId === team.teamId 
                          ? 'border-[#ff6767] bg-[#ff6767]/5' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleTeamSelect(team.teamId)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          selectedTeamId === team.teamId ? 'bg-[#ff6767]' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{team.name}</p>
                          <p className="text-sm text-gray-500">Team ID: {team.teamId}</p>
                        </div>
                      </div>
                      
                      {selectedTeamId !== team.teamId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            joinTeam(team.teamId);
                          }}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#ff6767] border border-[#ff6767] rounded hover:bg-[#ff6767] hover:text-white transition-colors"
                          disabled={loading}
                        >
                          <UserPlus className="w-3 h-3" />
                          Join
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 