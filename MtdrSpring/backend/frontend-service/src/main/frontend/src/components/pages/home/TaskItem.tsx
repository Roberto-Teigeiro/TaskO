///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/TaskItem.tsx
import { CircleDot } from "lucide-react"
import { AssignUserDialog } from "@/components/pages/home/AssignUserDialog"
import { ChangeStatusDialog } from "@/components/pages/home/ChangeStatusDialog"

// Tipo de estado para el backend
export type BackendStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
// Tipo de estado para el frontend
export type FrontendStatus = "Not Started" | "In Progress" | "Completed";

// Función para convertir estado del frontend al backend
export const getBackendStatus = (frontendStatus: string): BackendStatus => {
  switch (frontendStatus) {
    case "Not Started": return "TODO";
    case "In Progress": return "IN_PROGRESS";
    case "Completed": return "COMPLETED";
    default: return "TODO";
  }
};

// Función para convertir estado del backend al frontend
export const getFrontendStatus = (backendStatus: string): FrontendStatus => {
  switch (backendStatus) {
    case "TODO": return "Not Started";
    case "IN_PROGRESS": return "In Progress";
    case "COMPLETED": return "Completed";
    default: return "Not Started";
  }
};

// Versión unificada para TaskItem.tsx
export interface TaskItemProps {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly priority: string;
  readonly status: string;
  readonly date: string;
  readonly image: string;
  readonly assignee?: string;
  readonly sprintId?: string;
  readonly className?: string;
}

export function TaskItem({ 
  id, 
  title, 
  description, 
  priority, 
  status, 
  date, 
  image, 
  assignee,
  sprintId 
}: TaskItemProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Completed":
        return "text-[#32CD32]"
      case "In Progress":
        return "text-[#4169E1]"
      case "Not Started":
        return "text-[#ff6b6b]"
      default:
        return "text-gray-500"
    }
  }

  const handleAssignUser = async (taskId: string, userId: string): Promise<void> => {
    try {
      console.log(`Asignando usuario ${userId} a tarea ${taskId}`);
      
      const response = await fetch(`http://localhost:8080/task/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error de asignación:", errorText);
        throw new Error('Error al asignar usuario a la tarea');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función corregida para cambiar el estado - usa los tipos adecuados
  const handleChangeStatus = async (
    taskId: string, 
    newStatus: BackendStatus
  ): Promise<void> => {
    try {
      console.log(`Cambiando estado de tarea ${taskId} a ${newStatus}`);
      
      const response = await fetch(`http://localhost:8080/task/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error al cambiar estado:", errorText);
        throw new Error('Error al actualizar el estado de la tarea');
      }

      window.location.reload();
    } catch (error) {
      console.error('Error:', error);
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
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>

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
              
              {/* Task ID debugging info */}
              <div className="text-gray-400 text-xs">ID: {id?.substring(0, 8)}</div>
              
              {/* Buttons for task actions */}
              <div className="flex gap-2 mt-1">
              <ChangeStatusDialog
              taskId={id}
              currentStatus={status as FrontendStatus} // Ensure correct type
                 onStatusChange={handleChangeStatus}
                 />
                
                <AssignUserDialog
                  taskId={id}
                  currentAssignee={assignee}
                  onAssign={handleAssignUser}
                />
              </div>
            </div>
            
            {/* Show assignee (if exists) */}
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
  )
}

export interface CompletedTaskItemProps {
  readonly title: string;
  readonly description: string;
  readonly daysAgo: number;
  readonly image: string;
  readonly completedBy?: string;
}

export function CompletedTaskItem({ title, description, daysAgo, image, completedBy }: CompletedTaskItemProps) {
  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <CircleDot className="h-4 w-4 text-[#32CD32]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{title}</h4>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{description}</p>

            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs">
              <div>
                <span className="text-gray-500">Status: </span>
                <span className="text-[#32CD32]">Completed</span>
              </div>
              <div className="text-gray-400">Completed {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ago</div>
              
              {/* Show who completed the task (if available) */}
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
  )
}