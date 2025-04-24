// /Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/services/api.ts
// Typed interfaces for API responses
interface Task {
    id: string
    title: string
    sprintId: string
    description: string
    priority: string
    status: string
    createdOn: string
    [key: string]: any // For additional properties
  }
  
  interface Sprint {
    id: string
    name: string
    startDate: string
    endDate: string
    progress: number
    status: string
    tasks: Task[]
  }
  
  // Interface for mock data structure
  interface MockDataType {
    sprints: Sprint[];
  }
  
  // Mock data for development with explicit typing
  const MOCK_DATA: MockDataType = {
    sprints: [
      {
        id: "1",
        name: "Sprint 1",
        startDate: "01/04/2025",
        endDate: "15/04/2025",
        progress: 45,
        status: "Active",
        tasks: []
      }
    ]
  };
  
  // API base URL
  const API_BASE_URL = 'http://localhost:8080/api';
  
  // Helper functions to reduce cognitive complexity
  function handleSprintGetResponse(): Sprint[] {
    return MOCK_DATA.sprints;
  }
  
  function handleSprintPostResponse(body: any): Sprint {
    const uniqueId = `sprint-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newSprint: Sprint = { 
      ...body, 
      id: uniqueId,
      tasks: body.tasks ?? [] 
    };
    MOCK_DATA.sprints.push(newSprint);
    return newSprint;
  }
  
  function handleTaskPostResponse(body: any): Task {
    const uniqueId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newTask: Task = { 
      ...body, 
      id: uniqueId
    };
    const sprint = MOCK_DATA.sprints.find(s => s.id === body.sprintId);
    if (sprint) {
      sprint.tasks.push(newTask);
    }
    return newTask;
  }
  
  
  function handleTaskDeleteResponse(taskId: string): object {
    MOCK_DATA.sprints.forEach(sprint => {
      sprint.tasks = sprint.tasks.filter(task => task.id !== taskId);
    });
    return {};
  }
  
  function handleTaskPatchResponse(taskId: string, body: any): Task | object {
    for (const sprint of MOCK_DATA.sprints) {
      const taskIndex = sprint.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        const updatedTask: Task = { ...sprint.tasks[taskIndex], ...body };
        sprint.tasks[taskIndex] = updatedTask;
        return updatedTask;
      }
    }
    return {};
  }
  
 // Main API fetch function with timeout and mock fallback
async function apiFetch<T>(method: string, endpoint: string, body?: any, token?: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.warn(`API Error: ${error.message}`);
      } else {
        console.warn('An unknown error occurred');
      }
      
      // Return clean mock data
      if (endpoint === '/sprints') {
        return MOCK_DATA.sprints as unknown as T;
      }
      
      if (endpoint.includes('/tasks')) {
        return MOCK_DATA.sprints.flatMap(sprint => sprint.tasks) as unknown as T;
      }
      
      return {} as T;
    }
  }
  
  // API functions with proper typing
  export const sprintApi = {
    getAllSprints: async (token?: string): Promise<Sprint[]> => {
      return await apiFetch<Sprint[]>('GET', '/sprints', undefined, token);
    },
    
    createSprint: async (sprint: Partial<Sprint>, token?: string): Promise<Sprint> => {
      return await apiFetch<Sprint>('POST', '/sprints', sprint, token);
    },
  };
  
  export const taskApi = {
    createTask: async (task: Partial<Task>, token?: string): Promise<Task> => {
      return await apiFetch<Task>('POST', '/tasks', task, token);
    },
    
    deleteTask: async (taskId: string, token?: string): Promise<object> => {
      return await apiFetch<object>('DELETE', `/tasks/${taskId}`, undefined, token);
    },
    
    updateTask: async (taskId: string, task: Partial<Task>, token?: string): Promise<Task> => {
      return await apiFetch<Task>('PATCH', `/tasks/${taskId}`, task, token);
    },
  };