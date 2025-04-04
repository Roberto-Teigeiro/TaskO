/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect } from "react"
import { useUser } from "@clerk/clerk-react"; // Importa el hook de Clerk

interface AddSprintDialogProps {
  onAddSprint?: (sprint: any) => void
}

export function AddSprintDialog({ onAddSprint }: AddSprintDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [progress, setProgress] = useState<number>(0)
  const [status, setStatus] = useState("Not Started")
  const { user } = useUser(); // Obtén el usuario autenticado

  useEffect(() => {
    console.log("montado")
    const fetchProjectId = async () => {
      
      try {
        
        if (!user) return; // Asegúrate de que el usuario esté autenticado
        console.log(user.id)
        const userId = user.id; // Obtén el userId del usuario autenticado
        const response = await fetch(`http://localhost:8080/api/projects/${userId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }

        const data = await response.json();
        console.log(data); // Maneja los datos del proyecto aquí
      } catch (error) {
        console.error("Error fetching project data:", error);
      }
    };

    fetchProjectId();
  }, [user]); // Ejecuta el efecto cuando el usuario cambie


  const handleSubmit = async () => {
    const newSprint = {
      name,
      startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
      endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
      progress,
      status,
      tasks: [],
    }

    
  
    try {
      const response = await fetch("http://localhost:8080/api/sprint/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSprint),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create sprint");
      }
  
      const createdSprint = await response.json();
  
      if (onAddSprint) {
        onAddSprint(createdSprint);
      }
  
      // Reset form
      setName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setProgress(0);
      setStatus("Not Started");
  
      // Close dialog
      setOpen(false);
    } catch (error) {
      console.error("Error creating sprint:", error);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="text-[#ff6767]">
          <Plus className="h-4 w-4 mr-1" /> Add Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">Add New Sprint</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Sprint Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter sprint name" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}> 
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Select a start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}> 
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>Select an end date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label htmlFor="progress" className="block text-sm font-medium mb-1">Progress</label>
            <Input id="progress" type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} min="0" max="100" className="w-full" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full border-gray-300 rounded-md p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          <div className="mt-4">
            <Button className="bg-[#ff6767] hover:bg-[#ff5252] text-white w-full" onClick={handleSubmit}>Create Sprint</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
