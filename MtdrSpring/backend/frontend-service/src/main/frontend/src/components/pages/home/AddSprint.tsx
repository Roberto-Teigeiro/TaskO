///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/AddSprint.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "../../../context/ProjectContext";

interface AddSprintDialogProps {
  readonly onAddSprint?: (sprint: any) => void;
}

export function AddSprintDialog({ onAddSprint }: AddSprintDialogProps) {
  const { userProjects } = useProjects();
  const projectId =
    Array.isArray(userProjects) && userProjects.length > 0
      ? userProjects[0].projectId
      : null;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ID único para el DialogDescription
  const dialogDescriptionId = "add-sprint-dialog-description";

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (!projectId) {
      setError("No hay proyectos disponibles para crear sprints");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Formatea las fechas correctamente con manejo explícito de timezone
      const sprintData = {
        name,
        description,
        startDate: startDate.toISOString(), // Formato ISO 8601 completo con timezone
        endDate: endDate.toISOString(), // Formato ISO 8601 completo con timezone
        projectId,
      };

      console.log("Sprint data being sent:", JSON.stringify(sprintData));

      const response = await fetch("/api/sprint/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sprintData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to create sprint: ${response.status} - ${errorText}`,
        );
      }

      const newSprint = await response.json();

      if (onAddSprint) {
        onAddSprint(newSprint);
      }

      // Reset form
      setName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setDescription("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-[#ff6767]">
          <Plus className="h-4 w-4 mr-1" /> Add Sprint
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] p-6"
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">
            Add New Sprint
          </DialogTitle>
          <DialogDescription
            id={dialogDescriptionId}
            className="text-sm text-gray-500"
          >
            Crea un nuevo sprint para organizar tus tareas del proyecto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Sprint Name *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sprint name"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description
            </label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter sprint description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Select a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Select an end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="mt-4">
            <Button
              className="bg-[#ff6767] hover:bg-[#ff5252] text-white w-full"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Sprint"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
