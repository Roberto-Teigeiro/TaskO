///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/AddTask.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  readonly onAddTask?: (task: any) => void
  readonly sprintId: string
  readonly projectId: string
}

export function AddTaskDialog({ onAddTask, sprintId, projectId }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date>()
  const [priority, setPriority] = useState<string>("Moderate")
  const [storyPoints, setStoryPoints] = useState<string>("5")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0] || null
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    if (!title || !date) {
      setError("Please fill in all required fields");
      return;
    }

    // Verificar que sprintId esté definido
    if (!sprintId) {
      setError("No se puede crear una tarea sin un sprint asociado");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Creating task with sprintId:', sprintId);
      
      // AddTask.tsx - Modificación en handleSubmit
const taskData = {
  title,
  description,
  startDate: date.toISOString(), // Asegúrate de enviar en formato ISO completo
  endDate: date.toISOString(),   // Asegúrate de enviar en formato ISO completo
  projectId,
  sprintId,
  priority,
  storyPoints: parseInt(storyPoints),
  status: "Not Started",
  // No envíes campos nulos si el backend no los espera
  // Asegúrate de que el backend espera estos campos exactamente como los nombras aquí
};

// Log para debug
console.log('Task data being sent:', JSON.stringify(taskData));

      
      const response = await fetch('http://localhost:8080/task/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error details:", errorText);
        throw new Error(`Failed to create task: ${errorText}`);
      }

      const newTask = await response.json();

      if (onAddTask) {
        onAddTask({
          ...newTask,
          priority: priority,
          status: newTask.status || "Not Started",
          createdOn: newTask.createdAt || new Date().toISOString(),
          image: imagePreview || "/placeholder.svg",
        });
      }

      // Reset form
      setTitle("");
      setDate(undefined);
      setPriority("Moderate");
      setStoryPoints("5");
      setDescription("");
      setImagePreview(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-[#ff6767]">
          <Plus className="h-4 w-4 mr-1" /> Add task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1 pr-4 inline-block">
              Add New Task
            </DialogTitle>
            <Button variant="ghost" className="text-gray-500 hover:text-gray-700" onClick={() => setOpen(false)}>
              Go Back
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${priority === "Extreme" ? "bg-[#ff6767]" : "border border-gray-300"}`}
                      onClick={() => setPriority("Extreme")}
                    />
                    <span className="text-sm">Extreme</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${priority === "Moderate" ? "bg-[#3abeff]" : "border border-gray-300"}`}
                      onClick={() => setPriority("Moderate")}
                    />
                    <span className="text-sm">Moderate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${priority === "Low" ? "bg-[#05a301]" : "border border-gray-300"}`}
                      onClick={() => setPriority("Low")}
                    />
                    <span className="text-sm">Low</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Task Description
                </label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Start writing here..."
                  className="min-h-[120px]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="storyPoints" className="block text-sm font-medium mb-1">
                  Story points
                </label>
                <Input
                  id="storyPoints"
                  type="number"
                  value={storyPoints}
                  onChange={(e) => setStoryPoints(e.target.value)}
                  className="w-full"
                  min="1"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Upload Image</label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-md p-4 h-[180px] flex flex-col items-center justify-center text-center"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {imagePreview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => {
                          setImagePreview(null)
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 mb-1">Drag&Drop files here</p>
                      <p className="text-sm text-gray-400 mb-2">or</p>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded text-sm">
                          Browse
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-500 text-sm">{error}</div>
          )}

          <div className="mt-6">
            <Button 
              className="bg-[#ff6767] hover:bg-[#ff5252] text-white" 
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Done"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
