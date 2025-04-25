/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  CalendarIcon as CalendarIconFull,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProjects } from "../../../context/ProjectContext"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isWithinInterval,
} from "date-fns"

interface SprintType {
  sprintId: string
  projectId: string
  name: string
  startDate: string
  endDate: string
  status: "Completed" | "In Progress" | "Not Started"
}


const getStatusColor = (status: string) => {
  console.log("status:" , status)
  switch (status) {
    case "Completed":
      return "bg-[#32CD32] text-white"
    case "In Progress":
      return "bg-[#4169E1] text-white"
    case "Not Started":
      return "bg-[#ff6b6b] text-white"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function SchedulePage() {
  const { currentProject } = useProjects()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedEvent, setSelectedEvent] = useState<{ type: "sprint"; data: SprintType } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sprints, setSprints] = useState<SprintType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSprints = async () => {
      if (!currentProject?.projectId) {
        setError('No project selected')
        setIsLoading(false)
        return
      }
  
      try {
        const response = await fetch(`http://localhost:8080/sprintlist/${currentProject.projectId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch sprints')
        }
  
        const data = await response.json()
  
        if (!Array.isArray(data)) {
          throw new Error('Invalid response format from server')
        }
  
        const currentDate = new Date()
        const transformedSprints = data.map((sprint) => {
          const startDate = new Date(sprint.startDate)
          const endDate = new Date(sprint.endDate)
  
          let status: "Completed" | "In Progress" | "Not Started"
          if (currentDate > endDate) {
            status = "Completed"
          } else if (currentDate >= startDate && currentDate <= endDate) {
            status = "In Progress"
          } else {
            status = "Not Started"
          }
  
          return {
            ...sprint,
            status,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
          }
        })
  
        setSprints(transformedSprints)
        setError(null)
      } catch (err) {
        console.error('Error fetching sprints:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching sprints')
        setSprints([])
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchSprints()
  }, [currentProject?.projectId])
  

  // Navigation functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Get days for the current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Check if a date has sprints
  const getSprintsForDate = (date: Date) => {
    return sprints.filter((sprint) => {
      const startDate = parseISO(sprint.startDate)
      const endDate = parseISO(sprint.endDate)
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  // Handle sprint click
  const handleEventClick = (sprint: SprintType) => {
    setSelectedEvent({ type: "sprint", data: sprint })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6767] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sprints...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            className="mt-4 bg-[#ff6767] hover:bg-[#ff5252] text-white"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header title="To" titleSpan="Do"/>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          
        />

        {/* Main Content Area */}
        <div className="p-4 md:p-6 flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center">
                <CalendarIconFull className="mr-2 h-6 w-6 text-[#ff6767]" />
                Calendar
              </h2>
              <p className="text-gray-500 mt-1">View your project sprints in a calendar view</p>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Select value={view} onValueChange={(value: any) => setView(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-medium">{format(currentDate, "MMMM yyyy")}</h3>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            </div>

            {/* Calendar Grid - Month View */}
            {view === "month" && (
              <div className="p-4">
                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center font-medium text-sm py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} className="h-32 p-1 bg-gray-50 rounded-md"></div>
                  ))}

                  {monthDays.map((day) => {
                    const daySprints = getSprintsForDate(day)
                    const isToday = isSameDay(day, new Date())
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

                    return (
                      <div
                        key={day.toString()}
                        className={`h-32 p-1 rounded-md border overflow-hidden ${
                          isToday
                            ? "bg-blue-50 border-blue-200"
                            : isSelected
                              ? "bg-gray-100 border-gray-300"
                              : "border-gray-100"
                        }`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="flex justify-between items-start">
                          <span
                            className={`text-sm font-medium rounded-full w-6 h-6 flex items-center justify-center ${
                              isToday ? "bg-[#ff6767] text-white" : ""
                            }`}
                          >
                            {format(day, "d")}
                          </span>
                        </div>

                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                          {daySprints.map((sprint) => (
                            <div
                              key={sprint.sprintId}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${getStatusColor(sprint.status)}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick(sprint)
                              }}
                            >
                              
                              <div className="font-semibold text-sm mb-0.5">{sprint.name}</div>
                              <div className="text-xs text-white">{format(parseISO(sprint.startDate), "MMM d")} - {format(parseISO(sprint.endDate), "MMM d")}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {view === "week" && (
              <div className="p-4">
                <div className="text-center p-4">
                  <p>Week view coming soon</p>
                </div>
              </div>
            )}

            {/* Day View */}
            {view === "day" && (
              <div className="p-4">
                <div className="text-center p-4">
                  <p>Day view coming soon</p>
                </div>
              </div>
            )}
          </div>

          {/* Selected Date Information */}
          {selectedDate && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">{format(selectedDate, "MMMM d, yyyy")}</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Sprints for selected date */}
                {getSprintsForDate(selectedDate).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Sprints
                    </h4>
                    <div className="space-y-2">
                      {getSprintsForDate(selectedDate).map((sprint) => (
                        <div
                          key={sprint.sprintId}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleEventClick(sprint)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{sprint.name}</h5>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(parseISO(sprint.startDate), "MMM d")} -{" "}
                                {format(parseISO(sprint.endDate), "MMM d, yyyy")}
                              </div>
                            </div>
                            <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {getSprintsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No sprints scheduled for this day</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Sprint Details</DialogTitle>
          </DialogHeader>

          {selectedEvent?.type === "sprint" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-medium">{selectedEvent.data.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {format(parseISO(selectedEvent.data.startDate), "MMM d")} -{" "}
                  {format(parseISO(selectedEvent.data.endDate), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(selectedEvent.data.status)}>{selectedEvent.data.status}</Badge>
                </div>
              </div>

              
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

