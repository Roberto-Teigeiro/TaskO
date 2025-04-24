// /Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/services/localStorageService.ts
const SPRINTS_KEY = 'tasko_sprints';
const TASKS_KEY = 'tasko_tasks';

export const localStorageService = {
  // Sprints
  getSprints: () => {
    const storedSprints = localStorage.getItem(SPRINTS_KEY);
    return storedSprints ? JSON.parse(storedSprints) : [];
  },
  
  saveSprints: (sprints) => {
    localStorage.setItem(SPRINTS_KEY, JSON.stringify(sprints));
  },
  
  // Tasks
  getTasks: () => {
    const storedTasks = localStorage.getItem(TASKS_KEY);
    return storedTasks ? JSON.parse(storedTasks) : {};
  },
  
  getTasksBySprintId: (sprintId) => {
    const allTasks = localStorageService.getTasks();
    return allTasks[sprintId] || [];
  },
  
  saveTasks: (tasks) => {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },
  
  addTask: (sprintId, task) => {
    const allTasks = localStorageService.getTasks();
    const sprintTasks = allTasks[sprintId] || [];
    
    // Generar un ID único para la tarea
    const newTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    allTasks[sprintId] = [...sprintTasks, newTask];
    localStorageService.saveTasks(allTasks);
    
    return newTask;
  },
  
  updateTaskStatus: (taskId, status) => {
    const allTasks = localStorageService.getTasks();
    
    // Buscar la tarea en todos los sprints
    let foundTask = null;
    let foundSprintId = null;
    
    Object.entries(allTasks).forEach(([sprintId, tasks]) => {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        foundTask = tasks[taskIndex];
        foundSprintId = sprintId;
      }
    });
    
    if (foundTask && foundSprintId) {
      const updatedTasks = allTasks[foundSprintId].map(t => 
        t.id === taskId ? { ...t, status } : t
      );
      
      allTasks[foundSprintId] = updatedTasks;
      localStorageService.saveTasks(allTasks);
      return true;
    }
    
    return false;
  },
  
  assignUserToTask: (taskId, userId) => {
    const allTasks = localStorageService.getTasks();
    
    // Similar a updateTaskStatus
    let foundTask = null;
    let foundSprintId = null;
    
    Object.entries(allTasks).forEach(([sprintId, tasks]) => {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex >= 0) {
        foundTask = tasks[taskIndex];
        foundSprintId = sprintId;
      }
    });
    
    if (foundTask && foundSprintId) {
      const updatedTasks = allTasks[foundSprintId].map(t => 
        t.id === taskId ? { ...t, assignedTo: userId } : t
      );
      
      allTasks[foundSprintId] = updatedTasks;
      localStorageService.saveTasks(allTasks);
      return true;
    }
    
    return false;
  }
};
