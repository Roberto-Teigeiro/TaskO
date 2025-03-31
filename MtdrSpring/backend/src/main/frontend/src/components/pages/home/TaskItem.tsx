import { CircleDot } from "lucide-react"

export interface TaskItemProps {
  title: string
  description: string
  priority: string
  status: string
  date: string
  image: string
}

export function TaskItem({ title, description, priority, status, date, image }: TaskItemProps) {
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

  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <div className="mt-1">
            <CircleDot className="h-4 w-4 text-[#ff6b6b]" />
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

export interface CompletedTaskItemProps {
  title: string
  description: string
  daysAgo: number
  image: string
}

export function CompletedTaskItem({ title, description, daysAgo, image }: CompletedTaskItemProps) {
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
              <div className="text-gray-400">Completed {daysAgo} days ago</div>
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

