/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { Button } from "@/components/ui/button"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Users,
  CalendarIcon as CalendarIconFull,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { TaskItem } from "@/components/pages/home/TaskItem"
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
import Sprints from "./Sprints"

interface Task {
  id: string
  
  title: string
  description: string
  priority: string
  status: string
  date: string
  image: string
  assignee?: string
  assigneeAvatar?: string
}

interface SprintType {
  id: string
  name: string
  startDate: string
  endDate: string
  progress: number
  status: "Active" | "Completed" | "Planned"
  tasks: Task[]
}

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [selectedEvent, setSelectedEvent] = useState<{ type: "sprint" | "task"; data: any } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "sprints" | "tasks">("all")

  // Sample data with more tasks
  const sprintsData: SprintType[] = [
    {
      id: "sprint1",
      name: "Sprint 1: User Authentication",
      startDate: "2023-07-01",
      endDate: "2023-07-14",
      progress: 100,
      status: "Completed",
      tasks: [
        {
          id: "task1",
          title: "Implement Login UI",
          description: "Create responsive login interface with email and password fields",
          priority: "High",
          status: "Completed",
          date: "2023-07-02",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "John Doe",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task2",
          title: "Implement Registration UI",
          description: "Create responsive registration form with validation",
          priority: "High",
          status: "Completed",
          date: "2023-07-05",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Jane Smith",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task3",
          title: "Backend Authentication API",
          description: "Implement JWT authentication with secure password hashing",
          priority: "Extreme",
          status: "Completed",
          date: "2023-07-10",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Mike Johnson",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: "sprint2",
      name: "Sprint 2: Task Management Core",
      startDate: "2023-07-15",
      endDate: "2023-07-28",
      progress: 75,
      status: "Active",
      tasks: [
        {
          id: "task4",
          title: "Task Creation UI",
          description: "Design and implement task creation modal with all required fields",
          priority: "High",
          status: "Completed",
          date: "2023-07-16",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "John Doe",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task5",
          title: "Task Listing UI",
          description: "Implement responsive task listing with filtering and sorting",
          priority: "Moderate",
          status: "In Progress",
          date: "2023-07-18",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Jane Smith",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task6",
          title: "Task CRUD API",
          description: "Implement backend API for creating, reading, updating and deleting tasks",
          priority: "Extreme",
          status: "In Progress",
          date: "2023-07-20",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Mike Johnson",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: "sprint3",
      name: "Sprint 3: Dashboard & Analytics",
      startDate: "2023-07-29",
      endDate: "2023-08-11",
      progress: 0,
      status: "Planned",
      tasks: [
        {
          id: "task7",
          title: "Dashboard UI",
          description: "Design and implement main dashboard with task overview and statistics",
          priority: "High",
          status: "Not Started",
          date: "2023-07-29",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "John Doe",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task8",
          title: "Task Analytics",
          description: "Implement charts and graphs for task completion analytics",
          priority: "Moderate",
          status: "Not Started",
          date: "2023-08-02",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Jane Smith",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task9",
          title: "User Performance Metrics",
          description: "Implement user performance tracking and visualization",
          priority: "Low",
          status: "Not Started",
          date: "2023-08-05",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Mike Johnson",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: "sprint4",
      name: "Sprint 4: Notifications & Reminders",
      startDate: "2023-08-12",
      endDate: "2023-08-25",
      progress: 0,
      status: "Planned",
      tasks: [
        {
          id: "task10",
          title: "Email Notification System",
          description: "Implement email notifications for task assignments and deadlines",
          priority: "High",
          status: "Not Started",
          date: "2023-08-14",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Jane Smith",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task11",
          title: "In-App Notification UI",
          description: "Design and implement in-app notification center",
          priority: "Moderate",
          status: "Not Started",
          date: "2023-08-16",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "John Doe",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task12",
          title: "Reminder System",
          description: "Implement task reminders with customizable timing options",
          priority: "High",
          status: "Not Started",
          date: "2023-08-20",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Mike Johnson",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
    {
      id: "sprint5",
      name: "Sprint 5: Mobile Optimization",
      startDate: "2023-08-26",
      endDate: "2023-09-08",
      progress: 0,
      status: "Planned",
      tasks: [
        {
          id: "task13",
          title: "Mobile UI Improvements",
          description: "Optimize UI components for mobile devices",
          priority: "High",
          status: "Not Started",
          date: "2023-08-28",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "John Doe",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task14",
          title: "Offline Mode",
          description: "Implement offline functionality for mobile users",
          priority: "Extreme",
          status: "Not Started",
          date: "2023-09-01",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Mike Johnson",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
        {
          id: "task15",
          title: "Touch Gestures",
          description: "Add swipe and touch gesture support for mobile interactions",
          priority: "Moderate",
          status: "Not Started",
          date: "2023-09-05",
          image: "/placeholder.svg?height=80&width=80",
          assignee: "Jane Smith",
          assigneeAvatar: "/placeholder.svg?height=32&width=32",
        },
      ],
    },
  ]

  // Additional standalone tasks (not part of any sprint)
  const standaloneTasks: Task[] = [
    {
      id: "standalone1",
      title: "Team Meeting",
      description: "Weekly team sync to discuss project progress",
      priority: "Moderate",
      status: "Not Started",
      date: "2023-07-07",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "All Team Members",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone2",
      title: "Client Presentation",
      description: "Present project progress to the client",
      priority: "High",
      status: "Not Started",
      date: "2023-07-21",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "John Doe",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone3",
      title: "Code Review",
      description: "Review and provide feedback on recent code changes",
      priority: "High",
      status: "Not Started",
      date: "2023-07-25",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Mike Johnson",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone4",
      title: "Security Audit",
      description: "Perform security audit of the application",
      priority: "Extreme",
      status: "Not Started",
      date: "2023-08-08",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Security Team",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone5",
      title: "User Testing Session",
      description: "Conduct user testing with focus group",
      priority: "High",
      status: "Not Started",
      date: "2023-08-15",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Jane Smith",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone6",
      title: "Performance Optimization",
      description: "Identify and fix performance bottlenecks",
      priority: "Moderate",
      status: "Not Started",
      date: "2023-08-22",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Mike Johnson",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone7",
      title: "Documentation Update",
      description: "Update user and developer documentation",
      priority: "Low",
      status: "Not Started",
      date: "2023-09-04",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "John Doe",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "standalone8",
      title: "Quarterly Planning",
      description: "Plan next quarter's development roadmap",
      priority: "High",
      status: "Not Started",
      date: "2023-09-12",
      image: "/placeholder.svg?height=80&width=80",
      assignee: "All Team Members",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    // Current month tasks (assuming current month is the month when viewing the calendar)
    {
      id: "current1",
      title: "Bug Fixing Session",
      description: "Address critical bugs reported by users",
      priority: "High",
      status: "Not Started",
      date: new Date().toISOString().split("T")[0], // Today
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Development Team",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "current2",
      title: "Release Planning",
      description: "Plan the next release cycle and features",
      priority: "Moderate",
      status: "Not Started",
      date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0], // 2 days from now
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Product Team",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
    {
      id: "current3",
      title: "Design Review",
      description: "Review and finalize new feature designs",
      priority: "High",
      status: "Not Started",
      date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split("T")[0], // 5 days from now
      image: "/placeholder.svg?height=80&width=80",
      assignee: "Design Team",
      assigneeAvatar: "/placeholder.svg?height=32&width=32",
    },
  ]

  // Get all tasks from all sprints and standalone tasks
  const allTasks = [
    ...sprintsData.flatMap((sprint) =>
      sprint.tasks.map((task) => ({
        ...task,
        sprintId: sprint.id,
        sprintName: sprint.name,
      })),
    ),
    ...standaloneTasks,
  ]

  // Navigation functions
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  // Get days for the current month view
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Check if a date has sprints or tasks
  const getSprintsForDate = (date: Date) => {
    return sprintsData.filter((sprint) => {
      const startDate = parseISO(sprint.startDate)
      const endDate = parseISO(sprint.endDate)
      return isWithinInterval(date, { start: startDate, end: endDate })
    })
  }

  const getTasksForDate = (date: Date) => {
    return allTasks.filter((task) => {
      const taskDate = parseISO(task.date)
      return isSameDay(date, taskDate)
    })
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  // Handle sprint or task click
  const handleEventClick = (type: "sprint" | "task", data: any) => {
    setSelectedEvent({ type, data })
    setIsDialogOpen(true)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Completed":
        return "bg-green-100 text-green-800"
      case "Planned":
        return "bg-amber-100 text-amber-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Not Started":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Extreme":
        return "bg-red-100 text-red-800"
      case "High":
        return "bg-orange-100 text-orange-800"
      case "Moderate":
        return "bg-amber-100 text-amber-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8fb] flex flex-col">
      {/* Top Navigation */}
      <Header day="Tuesday" date="20/06/2023" title = "To" titleSpan = "Do"/>

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
              <p className="text-gray-500 mt-1">View all your tasks and sprints in a calendar view</p>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sprints">Sprints</SelectItem>
                  <SelectItem value="tasks">Tasks</SelectItem>
                </SelectContent>
              </Select>

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

              <Button className="bg-[#ff6767] hover:bg-[#ff5252] rounded-lg" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Event
              </Button>
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
                    const dayTasks = getTasksForDate(day)
                    const daySprints = getSprintsForDate(day)
                    const isToday = isSameDay(day, new Date())
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false

                    // Filter based on user selection
                    const visibleSprints = filter === "tasks" ? [] : daySprints
                    const visibleTasks = filter === "sprints" ? [] : dayTasks

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
                          {/* Sprints */}
                          {visibleSprints.map((sprint) => (
                            <div
                              key={sprint.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${
                                sprint.status === "Active"
                                  ? "bg-blue-100 text-blue-800"
                                  : sprint.status === "Completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick("sprint", sprint)
                              }}
                            >
                              <Sprints  />
                              {sprint.name}
                            </div>
                          ))}

                          {/* Tasks */}
                          {visibleTasks.map((task) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${
                                task.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "In Progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEventClick("task", task)
                              }}
                            >
                              {task.title}
                            </div>
                          ))}

                          {/* Show count if there are more items than can fit */}
                          {visibleSprints.length + visibleTasks.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{visibleSprints.length + visibleTasks.length - 3} more
                            </div>
                          )}
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
                {filter !== "tasks" && getSprintsForDate(selectedDate).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Sprints />
                      Sprints
                    </h4>
                    <div className="space-y-2">
                      {getSprintsForDate(selectedDate).map((sprint) => (
                        <div
                          key={sprint.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleEventClick("sprint", sprint)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{sprint.name}</h5>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(parseISO(sprint.startDate), "MMM d")} -{" "}
                                {format(parseISO(sprint.endDate), "MMM d, yyyy")}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Users className="h-4 w-4 mr-1" />
                                {sprint.tasks.length} tasks
                              </div>
                            </div>
                            <Badge className={getStatusColor(sprint.status)}>{sprint.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks for selected date 
                {filter !== "sprints" && getTasksForDate(selectedDate).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Tasks
                    </h4>
                    <div className="space-y-2">
                      {getTasksForDate(selectedDate).map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => handleEventClick("task", task)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{task.title}</h5>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                                <Sprints />
                              </div>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center">
                                <img
                                  src={task.assigneeAvatar || "/placeholder.svg?height=24&width=24"}
                                  alt={task.assignee}
                                  className="w-6 h-6 rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}*/}

                {filter === "all" &&
                  getSprintsForDate(selectedDate).length === 0 &&
                  getTasksForDate(selectedDate).length === 0 && (
                    <div className="text-center py-4 text-gray-500">No events scheduled for this day</div>
                  )}

                {filter === "sprints" && getSprintsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No sprints scheduled for this day</div>
                )}

                {filter === "tasks" && getTasksForDate(selectedDate).length === 0 && (
                  <div className="text-center py-4 text-gray-500">No tasks due on this day</div>
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
            <DialogTitle>{selectedEvent?.type === "sprint" ? "Sprint Details" : "Task Details"}</DialogTitle>
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
                  <div className="text-sm">Progress: {selectedEvent.data.progress}%</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tasks in this Sprint</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedEvent.data.tasks.map((task: Task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <TaskItem
                        title={task.title}
                        description={task.description}
                        priority={task.priority}
                        status={task.status}
                        date={task.date}
                        image={task.image}
                      />
                      {task.assignee && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <div className="flex items-center">
                            <img
                              src={task.assigneeAvatar || "/placeholder.svg?height=24&width=24"}
                              alt={task.assignee}
                              className="w-5 h-5 rounded-full mr-1"
                            />
                            Assigned to: {task.assignee}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedEvent?.type === "task" && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedEvent.data.image || "/placeholder.svg?height=80&width=80"}
                  alt={selectedEvent.data.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-xl font-medium">{selectedEvent.data.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedEvent.data.status)}>{selectedEvent.data.status}</Badge>
                    <Badge className={getPriorityColor(selectedEvent.data.priority)}>
                      {selectedEvent.data.priority}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Due: {format(parseISO(selectedEvent.data.date), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-gray-700">{selectedEvent.data.description}</p>
              </div>

              {selectedEvent.data.assignee && (
                <div>
                  <h4 className="font-medium mb-1">Assigned To</h4>
                  <div className="flex items-center">
                    <img
                      src={selectedEvent.data.assigneeAvatar || "/placeholder.svg?height=32&width=32"}
                      alt={selectedEvent.data.assignee}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span>{selectedEvent.data.assignee}</span>
                  </div>
                </div>
              )}

              {selectedEvent.data.sprintName && (
                <div>
                  <h4 className="font-medium mb-1">Sprint</h4>
                  <div className="flex items-center">
                    <Sprints />
                    <span>{selectedEvent.data.sprintName}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

