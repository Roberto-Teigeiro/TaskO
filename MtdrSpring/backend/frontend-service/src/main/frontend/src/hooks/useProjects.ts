import { useState, useEffect } from "react";

interface Project {
  projectId: string;
  name: string;
  description: string;
}

interface BackendProject {
  projectId: string;
  projectName: string;
  description?: string;
}

export function useProjects() {
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLocalhost = window.location.hostname === 'localhost';

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const API_URL = isLocalhost
          ? 'http://localhost:8080/project/all'
          : '/api/project/all';

        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = (await response.json()) as BackendProject[];
        // Ensure project IDs are properly formatted
        const formattedProjects = data.map((project) => ({
          projectId: project.projectId,
          name: project.projectName,
          description: project.description || "",
        }));
        setUserProjects(formattedProjects);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching projects",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return {
    userProjects,
    isLoading,
    error,
  };
}
