///Users/santosa/Documents/GitHub/oraclefront/src/components/Header.tsx

import { useProjects } from "@/context/ProjectContext"
import oracleLogo from "../assets/oracleLogo.svg"
interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
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
    <div className="flex flex-col sticky top-0 z-15 w-screen">
      <header className="bg-[#312D2A] py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 ">
            <a href="/choosepath"><img src={oracleLogo} alt="logo" className="w-32 h-8" /></a>
            <h1 className="text-3xl font-medium tracking-tight text-gray-200">
              <span>{title}</span>
            </h1>
          </div>
          <div className="text-sm text-gray-400 border-l border-gray-200 pl-6">
            Current Project: <span className="font-medium text-white">
              {loading ? "Loading..." : currentProject?.projectName || "No Project Selected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          
          
          <div className="text-right">
            <div className="font-medium text-white">{day}</div>
            <div className="text-gray-400 text-sm">{date}</div>
          </div>
        </div>
      </header>
      
    </div>
  )
}

