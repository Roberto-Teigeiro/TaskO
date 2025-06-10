/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserProject } from "../components/hooks/getUserProject";
import { useUser } from "@clerk/clerk-react";

interface ProjectDetails {
  projectId: string;
  projectName: string;
  description?: string;
}

interface ProjectContextType {
  userProjects: any[];
  currentProject: ProjectDetails | null;
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const isLocalhost = window.location.hostname === "localhost";

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8080/project/${projectId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const projectData = await response.json();
      setCurrentProject(projectData);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setCurrentProject(null);
    }
  };
  const fetchProjectDetails = async (projectId: string) => {
    try {
      const API_URL_PROJECT_DETAILS = isLocalhost
        ? `http://localhost:8080/project/${projectId}`
        : `/api/project/${projectId}`;

      const response = await fetch(API_URL_PROJECT_DETAILS);
      if (!response.ok) {
        throw new Error("Failed to fetch project details");
      }
      const projectData = await response.json();
      setCurrentProject(projectData);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setCurrentProject(null);
    }
  };

  const fetchProjects = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const projects = await getUserProject(user.id);
      setUserProjects(projects);

      // If we have projects, fetch details for the first one
      if (projects && projects.length > 0) {
        await fetchProjectDetails(projects[0].projectId);
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      setError("Failed to fetch projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user?.id]);

  const refreshProjects = async () => {
    await fetchProjects();
  };

  return (
    <ProjectContext.Provider
      value={{ userProjects, currentProject, loading, error, refreshProjects }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
