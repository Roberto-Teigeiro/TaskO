// @/components/ui/Task-item.tsx
import { CircleDot } from "lucide-react"
import { AssignUserDialog } from "@/components/pages/home/AssignUserDialog"
import { ChangeStatusDialog } from "@/components/pages/home/ChangeStatusDialog"
import { useState, useEffect } from "react"
import { DeleteTaskDialog } from "./pages/home/DeleteTaskDialog"

// Tipo de estado para el backend
export type BackendStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
// Tipo de estado para el frontend
export type FrontendStatus = "Not Started" | "In Progress" | "Completed";

// Función para convertir estado del frontend al backend
export const getBackendStatus = (frontendStatus: string): BackendStatus => {
  switch (frontendStatus) {
    case "Not Started":
      return "TODO";
    case "In Progress":
      return "IN_PROGRESS";
    case "Completed":
      return "COMPLETED";
    default:
      return "TODO";
  }
};

// Función para convertir estado del backend al frontend
export const getFrontendStatus = (backendStatus: string): FrontendStatus => {
  switch (backendStatus) {
    case "TODO":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return "Not Started";
  }
};

export interface TaskItemProps {
  readonly id?: string;
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly status: string;
  readonly date: string;
  readonly image: string;
  readonly assignee?: string;
  readonly assigneeId?: string;
  readonly sprintId?: string;
  readonly onTaskUpdated?: () => void;
  readonly estimatedHours?: number;
  readonly realHours?: number;
  readonly currentUserId?: string;
  readonly storyPoints?: number;
  readonly isManager?: boolean;
}

export function TaskItem({
  id = "temp-id",
  title,
  description,
  priority,
  status,
  date,
  image,
  assignee,
  assigneeId,
  estimatedHours = 0,
  realHours = 0,
  currentUserId,
  onTaskUpdated,
  storyPoints = 0,
  isManager = false
}: TaskItemProps) {
  const [localRealHours, setLocalRealHours] = useState<number>(realHours);

  // Update local state when prop changes
  useEffect(() => {
    setLocalRealHours(realHours);
  }, [realHours]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Completed":
        return "text-[#32CD32]";
      case "In Progress":
        return "text-[#4169E1]";
      case "Not Started":
        return "text-[#ff6b6b]";
      default:
        return "text-gray-500";
    }
  };

  const handleAssignUser = async (
    taskId: string,
    userId: string,
  ): Promise<void> => {
    try {
      console.log(`Asignando usuario ${userId} a tarea ${taskId}`);

      // Verificar si el ID de tarea es válido
      if (!taskId || taskId === "temp-id") {
        console.error("ID de tarea no válido");
        return;
      }
      const isLocalhost = window.location.hostname === 'localhost';

        const url = isLocalhost 
        ? `http://localhost:8080/task/${taskId}` 
        : `/api/task/${taskId}`;

      // First, get the current task to preserve all fields
      const getResponse = await fetch(url);


      if (!getResponse.ok) {
        throw new Error(`Error al obtener la tarea: ${getResponse.status}`);
      }

      const currentTask = await getResponse.json();

      // Update only the assignee field
      currentTask.assignee = userId;

      // Call the generic update endpoint with the complete object
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTask),
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Si hay una función de actualización, usarla en lugar de recargar la página
      if (onTaskUpdated) {
        onTaskUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al asignar usuario:", error);
    }
  };

  const handleChangeStatus = async (
    taskId: string,
    newStatus: BackendStatus,
  ): Promise<void> => {
    try {
      console.log(`Cambiando estado de tarea ${taskId} a ${newStatus}`);

      // Verificar si el ID de tarea es válido
      if (!taskId || taskId === "temp-id") {
        console.error("ID de tarea no válido");
        return;
      }
      const isLocalhost = window.location.hostname === 'localhost';

      const url = isLocalhost 
      ? `http://localhost:8080/task/${taskId}` 
      : `/api/task/${taskId}`;

      // Primero, obtener la tarea actual para no perder datos
      const getResponse = await fetch(url);;

      if (!getResponse.ok) {
        throw new Error(`Error al obtener la tarea: ${getResponse.status}`);
      }

      const currentTask = await getResponse.json();

      // Actualizar solo el estado
      currentTask.status = newStatus;

      // Llamar al endpoint genérico de actualización con el objeto completo
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentTask),
      });

      // Mejor manejo de respuestas de error
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      console.log(
        `Estado actualizado correctamente para tarea ${taskId} a ${newStatus}`,
      );

      // Actualizar UI
      if (onTaskUpdated) {
        onTaskUpdated();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error);
    }
  };

  const handleRealHoursUpdate = async (taskId: string, hours: number): Promise<void> => {
    try {
      if (!taskId || taskId === "temp-id") {
        console.error("ID de tarea no válido");
        return;
      }
      const isLocalhost = window.location.hostname === 'localhost';

      const url = isLocalhost 
      ? `http://localhost:8080/task/${taskId}` 
      : `/api/task/${taskId}`;

      // First, get the current task to preserve all fields
      const getResponse = await fetch(url);;
      
      if (!getResponse.ok) {
        throw new Error(`Error al obtener la tarea: ${getResponse.status}`);
      }
      
      const currentTask = await getResponse.json();
      
      // Update only the realHours field
      currentTask.realHours = hours;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTask),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      await response.json(); // Consume the response

      if (onTaskUpdated) {
        onTaskUpdated();
      }
    } catch (error) {
      console.error('Error al actualizar horas reales:', error);
      // Revert to previous value on error
      setLocalRealHours(realHours);
    }
  };

  const handleDeleteTask = () => {
    if (onTaskUpdated) {
      onTaskUpdated();
    }
  };

  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <CircleDot className={`h-4 w-4 ${getStatusColor(status)}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Priority: </span>
                <span className="text-amber-500">{priority}</span>
              </div>
              <div>
                <span className="text-gray-500">Status: </span>
                <span className={getStatusColor(status)}>{status}</span>
              </div>
              <div className="text-gray-400">Created: {date}</div>
              
              {/* Story Points */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Story Points: </span>
                <span className="font-medium">{storyPoints}</span>
              </div>
              
              {/* Hours information */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Est. Hours: </span>
                <span className="font-medium">{estimatedHours}</span>
              </div>
              
              {/* Real hours display/input - only show input to assigned user */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Real Hours: </span>
                {assigneeId && currentUserId === assigneeId ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={localRealHours}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setLocalRealHours(value);
                      handleRealHoursUpdate(id, value);
                    }}
                    className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                ) : (
                  <span className="font-medium">{realHours}</span>
                )}
              </div>
              
              {/* Task ID debugging info */}
              <div className="text-gray-400 text-xs">
                ID: {id?.substring(0, 8)}
              </div>

              {/* Botones para las nuevas funcionalidades - solo mostrar si no es un ID temporal */}
              {id !== "temp-id" && (
                <div className="flex gap-2 mt-1">
                  <ChangeStatusDialog
                    taskId={id}
                    currentStatus={status as FrontendStatus}
                    onStatusChange={handleChangeStatus}
                  />

                  <AssignUserDialog
                    taskId={id}
                    currentAssignee={assignee}
                    onAssign={handleAssignUser}
                  />

                  {/* Delete button - only visible to managers */}
                  {isManager && (
                    <DeleteTaskDialog
                      taskId={id}
                      taskTitle={title}
                      onDelete={handleDeleteTask}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Mostrar asignado a (si existe) */}
            {assignee && (
              <div className="mt-2 text-xs text-gray-500">
                <span>Asignado a: </span>
                <span className="font-medium">{assignee}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          <img
            src={image ?? "/placeholder.svg"}
            alt={title}
            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}

// CompletedTaskItem component
export interface CompletedTaskItemProps {
  readonly title: string;
  readonly description: string;
  readonly daysAgo: number;
  readonly image: string;
  readonly completedBy?: string;
}

export function CompletedTaskItem({
  title,
  description,
  daysAgo,
  image,
  completedBy,
}: CompletedTaskItemProps) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <CircleDot className="h-4 w-4 text-[#32CD32]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {description}
            </p>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Status: </span>
                <span className="text-[#32CD32]">Completed</span>
              </div>
              <div className="text-gray-400">
                Completed {daysAgo} {daysAgo === 1 ? "day" : "days"} ago
              </div>

              {/* Mostrar quién completó la tarea (si existe) */}
              {completedBy && (
                <div className="text-gray-500">
                  <span>Completada por: </span>
                  <span className="font-medium">{completedBy}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          <img
            src={image ?? "/placeholder.svg"}
            alt={title}
            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  );
}