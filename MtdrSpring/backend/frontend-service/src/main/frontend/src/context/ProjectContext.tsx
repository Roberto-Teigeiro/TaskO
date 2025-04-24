import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserProject } from '../components/hooks/getUserProject';
import { useUser } from '@clerk/react-router';

interface ProjectContextType {
    userProjects: any[];
    loading: boolean;
    error: string | null;
    refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [userProjects, setUserProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    const fetchProjects = async () => {
        if (!user?.id) return;
        
        try {
            setLoading(true);
            setError(null);
            const projects = await getUserProject(user.id);
            setUserProjects(projects);
        } catch (err) {
            setError('Failed to fetch projects');
            console.error('Error fetching projects:', err);
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
        <ProjectContext.Provider value={{ userProjects, loading, error, refreshProjects }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (context === undefined) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
} 