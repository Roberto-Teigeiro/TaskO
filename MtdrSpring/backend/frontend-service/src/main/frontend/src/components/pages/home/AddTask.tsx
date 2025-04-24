///Users/santosa/Documents/GitHub/TaskO/MtdrSpring/backend/frontend-service/src/main/frontend/src/components/pages/home/AddTask.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Plus, X } from "lucide-react"

interface Task {
  id?: string
  title: string
  sprintId: string
  date?: string
  description: string
  priority: "Extreme" | "High" | "Moderate" | "Low"
  status: "Not Started" | "In Progress" | "Completed"
  createdOn: string
  image?: string
  assignee?: string
  storyPoints?: number
  objective?: string
  fullDescription?: string
  additionalNotes?: string[]
  deadline?: string
}

interface AddTaskDialogProps {
  readonly onAddTask: (task: Task) => void
}

export function AddTaskDialog({ onAddTask }: AddTaskDialogProps) {
  // Removida la variable auth no utilizada
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fullDescription, setFullDescription] = useState("")
  const [objective, setObjective] = useState("")
  const [deadline, setDeadline] = useState<Date>()
  const [open, setOpen] = useState(false)
  const [priority, setPriority] = useState<"Extreme" | "High" | "Moderate" | "Low">("Moderate")
  const [status, setStatus] = useState<"Not Started" | "In Progress" | "Completed">("Not Started")
  const [additionalNote, setAdditionalNote] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState<string[]>([])
  const [storyPoints, setStoryPoints] = useState<number>(0)
  const [assignee, setAssignee] = useState("")

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    const newTask: Task = {
      title,
      sprintId: "", // Esto será establecido por el componente padre
      description,
      fullDescription,
      objective,
      priority,
      status,
      createdOn: new Date().toISOString(),
      additionalNotes: additionalNotes.length > 0 ? additionalNotes : undefined,
      deadline: deadline ? format(deadline, "PPP") : undefined,
      storyPoints: storyPoints || undefined,
      assignee: assignee || undefined,
      image: "/placeholder.svg"
    }

    onAddTask(newTask)

    // Reset form
    resetForm()

    // Close dialog
    setOpen(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setFullDescription("")
    setObjective("")
    setDeadline(undefined)
    setPriority("Moderate")
    setStatus("Not Started")
    setAdditionalNote("")
    setAdditionalNotes([])
    setStoryPoints(0)
    setAssignee("")
  }

  return (
    <Dialog open={!!open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-[#ff6767]">
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">Add New Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Task Title *</label>
            <Input 
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Short Description *</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the task"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fullDescription" className="block text-sm font-medium mb-1">Full Description</label>
            <Textarea
              id="fullDescription"
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Detailed task description"
              className="min-h-[100px]"
            />
          </div>
          
          <div>
            <label htmlFor="objective" className="block text-sm font-medium mb-1">Objective</label>
            <Input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Main objective of this task"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Extreme">Extreme</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium mb-1">Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="deadline"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {deadline ? format(deadline, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="storyPoints" className="block text-sm font-medium mb-1">Story Points</label>
              <Input
                id="storyPoints"
                type="number"
                min="0"
                value={storyPoints.toString()}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              />
            </div>
            
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium mb-1">Assignee</label>
              <Input
                id="assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Task assignee"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="additionalNote" className="block text-sm font-medium mb-1">Additional Notes</label>
            <div className="flex gap-2">
              <Input
                id="additionalNote"
                value={additionalNote}
                onChange={(e) => setAdditionalNote(e.target.value)}
                placeholder="Add a note"
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={() => {
                  if (additionalNote.trim()) {
                    setAdditionalNotes([...additionalNotes, additionalNote]);
                    setAdditionalNote("");
                  }
                }}
                size="sm"
              >
                Add
              </Button>
            </div>
            
            {additionalNotes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {additionalNotes.map((note, idx) => (
                  <li key={`note-${idx}-${note.substring(0, 10)}`} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="text-sm">{note}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const updatedNotes = [...additionalNotes];
                        updatedNotes.splice(idx, 1);
                        setAdditionalNotes(updatedNotes);
                      }}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
