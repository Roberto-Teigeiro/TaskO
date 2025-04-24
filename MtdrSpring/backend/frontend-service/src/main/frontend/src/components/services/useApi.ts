// /Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/services/useApi.ts
import { useAuth } from '@clerk/clerk-react';
import { sprintApi, taskApi } from './api';

export function useApi() {
  const { getToken } = useAuth();
  
  const getApiToken = async () => {
    try {
      const token = await getToken();
      // Usar operador de coalescencia nula
      return token ?? undefined;
    } catch (error) {
      console.error("Error getting token:", error);
      return undefined;
    }
  };
  
  return {
    sprints: {
      getAll: async () => {
        const token = await getApiToken();
        return sprintApi.getAllSprints(token);
      },
      create: async (sprint: any) => {
        const token = await getApiToken();
        return sprintApi.createSprint(sprint, token);
      },
    },
    
    tasks: {
      create: async (task: any) => {
        const token = await getApiToken();
        return taskApi.createTask(task, token);
      },
      delete: async (taskId: string) => {
        const token = await getApiToken();
        return taskApi.deleteTask(taskId, token);
      },
      update: async (taskId: string, task: any) => {
        const token = await getApiToken();
        return taskApi.updateTask(taskId, task, token);
      },
    },
  };
}
