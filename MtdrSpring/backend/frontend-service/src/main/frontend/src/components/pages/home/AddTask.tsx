///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/AddTask.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddTaskDialogProps {
  readonly onAddTask?: (task: any) => void;
  readonly sprintId: string;
  readonly projectId: string;
}

// Función para convertir de frontend a backend
const getBackendStatus = (frontendStatus: string) => {
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

// Function to convert backend status to frontend status
const getFrontendStatus = (backendStatus: string) => {
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
  const [estimatedHours, setEstimatedHours] = useState<string>("")
  const [realHours] = useState<string>("")

  const isLocalhost = window.location.hostname === 'localhost';

  const API_URL_ADD_TASK = isLocalhost
    ? 'http://localhost:8080/task/add'
    : '/api/task/add';

  // Debug function to validate UUIDs
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const handleSubmit = async () => {
    if (!title || !date) {
      setError("Please fill in all required fields");
      return;
    }

    // Verificar que sprintId esté definido y sea un UUID válido
    if (!sprintId) {
      setError("No se puede crear una tarea sin un sprint asociado");
      return;
    }

    if (!isValidUUID(sprintId)) {
      setError("Sprint ID inválido. Por favor, selecciona un sprint válido.");
      return;
    }

    if (!projectId || !isValidUUID(projectId)) {
      setError("Project ID inválido. Por favor, selecciona un proyecto válido.");
      return;
    }

    setIsLoading(true);
    setError(null);

  try {
    // Objeto ajustado a la estructura del backend
    const taskData = {
      projectId: projectId, // UUID
      sprintId: sprintId,   // UUID
      title: title,
      description: description,
      assignee: null,       // Correcto según el modelo TaskItem.java
      status: getBackendStatus("Not Started"), // Valor del enum en backend
      startDate: date.toISOString(), // Formato ISO completo
      endDate: date.toISOString(),
      comments: description, // Si no tienes campo comments específico
      storyPoints: parseInt(storyPoints),
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : 0,
      realHours: realHours ? parseInt(realHours) : 0,
    };
    
    const response = await fetch(API_URL_ADD_TASK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData)
    });

      // Mejor manejo de errores
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create task: ${response.status} ${errorText}`,
        );
      }

      // Registro de respuesta exitosa
      const newTask = await response.json();

      if (onAddTask) {
        onAddTask({
          ...newTask,
          priority: priority,
          status: getFrontendStatus(newTask.status) || "Not Started", // Convertir de backend a frontend
          createdOn: newTask.startDate || new Date().toISOString(),
          image: imagePreview || "/placeholder.svg",
        });
      }

    // Resetear formulario
    setTitle("");
    setDate(undefined);
    setPriority("Moderate");
    setStoryPoints("5");
    setDescription("");
    setImagePreview(null);
    setOpen(false);
    setEstimatedHours("");
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
            <Button
              variant="ghost"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setOpen(false)}
            >
              Go Back
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
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
                <label
                  htmlFor="date"
                  className="block text-sm font-medium mb-1"
                >
                  Date *
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority
                </label>
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
                      className={`w-4 h-4 rounded-full ${priority === "Moderate" ? "bg-[#ffef3a]" : "border border-gray-300"}`}
                      onClick={() => setPriority("Moderate")}
                    />
                    <span className="text-sm">Moderate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full ${priority === "Low" ? "bg-[#4ed64c]" : "border border-gray-300"}`}
                      onClick={() => setPriority("Low")}
                    />
                    <span className="text-sm">Low</span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
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
                <label
                  htmlFor="storyPoints"
                  className="block text-sm font-medium mb-1"
                >
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
                 <label htmlFor="estimatedHours" className="block text-sm font-medium mb-1">
                  Estimated hours
                </label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full"
                  min="1"
                />

                

              </div>
            </div>
          </div>

          {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

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
  );
}
