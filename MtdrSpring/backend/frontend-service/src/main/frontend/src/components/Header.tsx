///Users/santosa/Documents/GitHub/oraclefront/src/components/Header.tsx
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { useProjects } from "@/context/ProjectContext"

interface HeaderProps {
  title: string
  titleSpan: string
}

export function Header({ title, titleSpan }: HeaderProps) {
  const { currentProject, loading } = useProjects()
  
  // Get current date and format it
  const currentDate = new Date()
  const day = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
  const date = currentDate.toLocaleDateString('en-GB', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  return (
    <header className="bg-white py-3 px-6 flex items-center justify-between border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">
          <span className="text-[#ff6767]">{title}</span>-{titleSpan}
        </h1>
        <div className="text-sm text-gray-500">
          Current Project: <span className="font-medium text-gray-700">
            {loading ? "Loading..." : currentProject?.projectName || "No Project Selected"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full border-gray-200 bg-[#ff6767] text-white hover:bg-[#ff5252]"
        >
          <Bell className="h-5 w-5" />
        </Button>
        
        <div className="text-right text-sm">
          <div className="font-medium">{day}</div>
          <div className="text-[#ff6767]">{date}</div>
        </div>
      </div>
    </header>
  )
}

