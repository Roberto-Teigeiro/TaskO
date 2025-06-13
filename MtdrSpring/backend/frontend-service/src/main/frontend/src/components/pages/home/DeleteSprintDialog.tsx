import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { AlertTriangle } from "lucide-react"

interface DeleteSprintDialogProps {
  readonly sprintId: string;
  readonly sprintName: string;
  readonly onDelete: (sprintId: string) => void;
}

export function DeleteSprintDialog({ sprintId, sprintName, onDelete }: DeleteSprintDialogProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const isLocalhost = window.location.hostname === 'localhost';
      const url = isLocalhost 
        ? `http://localhost:8080/sprint/${sprintId}` 
        : `/api/sprint/${sprintId}`;

      const response = await fetch(url, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(sprintId)
        setOpen(false)
      } else {
        console.error('Failed to delete sprint')
        alert('Failed to delete sprint. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting sprint:', error)
      alert('Error deleting sprint, Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Sprint
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the sprint <strong>"{sprintName}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone. All tasks in this sprint will remain but will no longer be associated with this sprint.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Sprint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 