// @/components/ui/Task-item.tsx
import { CircleDot } from "lucide-react"
import { AssignUserDialog } from "@/components/pages/home/AssignUserDialog"
import { ChangeStatusDialog } from "@/components/pages/home/ChangeStatusDialog"

export interface TaskItemProps {
  id?: string
  title: string
  description: string
  priority: string
  status: string
  date: string
  image: string
  assignee?: string
  sprintId?: string // Añade esta propiedad
}
export function TaskItem({ id = "temp-id", title, description, priority, status, date, image, assignee }: TaskItemProps) {
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

  const handleAssignUser = async (taskId: string, userId: string) => {
    try {
      // Llamada API para asignar usuario
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
        throw new Error('Error al asignar usuario a la tarea');
      }

      // Aquí podrías actualizar el estado de la aplicación o recargar los datos
      console.log(`Usuario ${userId} asignado a la tarea ${taskId}`);
      window.location.reload(); // Forma simple de actualizar los datos
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  const handleChangeStatus = async (taskId: string, newStatus: "Not Started" | "In Progress" | "Completed") => {
    try {
      // Llamada API para cambiar estado
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
        throw new Error('Error al actualizar el estado de la tarea');
      }

      // Aquí podrías actualizar el estado de la aplicación o recargar los datos
      console.log(`Estado de la tarea ${taskId} cambiado a ${newStatus}`);
      window.location.reload(); // Forma simple de actualizar los datos
    } catch (error) {
      console.error('Error:', error);
      throw error;
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
              
              {/* Botones para las nuevas funcionalidades */}
              {id !== "temp-id" && (
                <div className="flex gap-2 mt-1">
                  <ChangeStatusDialog
                    taskId={id}
                    currentStatus={status as "Not Started" | "In Progress" | "Completed"}
                    onStatusChange={handleChangeStatus}
                  />
                  
                  <AssignUserDialog
                    taskId={id}
                    currentAssignee={assignee}
                    onAssign={handleAssignUser}
                  />
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
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  )
}

// Add the CompletedTaskItem component
// Fixed CompletedTaskItem interface
export interface CompletedTaskItemProps {
  readonly title: string;
  readonly description: string;
  readonly daysAgo: number;
  readonly image: string;
  readonly completedBy?: string;
  // Remove id since it's not used, or use it in the component
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
            src={image || "/placeholder.svg"}
            alt={title}
            className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
          />
        </div>
      </div>
    </div>
  )
}
