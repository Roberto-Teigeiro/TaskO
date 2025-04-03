"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
}

export function ProjectDropdown() {
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Project Alpha" },
    { id: "2", name: "Project Beta" },
  ]);
  const [newProjectName, setNewProjectName] = useState("");
  const [isOpen, setIsOpen] = useState(false); // Dropdown open state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state

  const handleAddProject = () => {
    if (newProjectName.trim() === "") return;
    const newProject: Project = {
      id: crypto.randomUUID(), // Simulating backend-generated ID
      name: newProjectName,
    };
    setProjects([...projects, newProject]);
    setNewProjectName(""); // Reset the input field
    setIsModalOpen(false); // Close the modal after adding the project
  };

  return (
    <div className="relative inline-block">
      {/* Dropdown Button */}
      <Button
        variant="outline"
        className="flex items-center"
        onClick={() => setIsOpen(!isOpen)} // Toggle dropdown visibility
      >
        Projects <ChevronDown className="ml-2 h-4 w-4" />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-56 p-2 bg-white border shadow-md rounded-md">
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                {project.name}
              </div>
            ))}

            {/* Add New Project Button */}
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 w-full"
              onClick={() => setIsModalOpen(true)} // Open the modal to add a project
            >
              <Plus className="h-4 w-4 mr-1" /> Add New Project
            </Button>
          </div>
        </div>
      )}

      {/* Modal for Adding a New Project */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Project</h2>
            <Input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
              className="mb-4"
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                className="text-gray-500"
                onClick={() => setIsModalOpen(false)} // Close modal without adding project
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-500 hover:bg-red-400 text-white"
                onClick={handleAddProject}
              >
                Add Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
