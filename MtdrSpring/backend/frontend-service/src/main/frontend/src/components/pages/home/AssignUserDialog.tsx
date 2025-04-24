// AssignUserDialog.tsx
// @/components/pages/home/AssignUserDialog.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, User, Check } from "lucide-react"

interface UserType {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AssignUserDialogProps {
  taskId: string
  currentAssignee?: string
  onAssign: (taskId: string, userId: string) => Promise<void>
}

export function AssignUserDialog({ taskId, currentAssignee, onAssign }: AssignUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(currentAssignee || null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
    // Reset selected user when dialog opens
    setSelectedUser(currentAssignee || null)
  }, [open, currentAssignee])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      // Aquí iría la llamada a la API real para obtener usuarios
      const response = await fetch('http://localhost:8080/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      // Datos de ejemplo en caso de fallo
      setUsers([
        { id: '1', name: 'Ana García', email: 'ana@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Carlos López', email: 'carlos@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Elena Martínez', email: 'elena@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (selectedUser) {
      setIsSubmitting(true)
      try {
        await onAssign(taskId, selectedUser)
        setOpen(false)
      } catch (error) {
        console.error('Error assigning user:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <UserPlus className="h-3 w-3" />
          {currentAssignee ? "Reasignar" : "Asignar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">
            Asignar Usuario a la Tarea
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Selecciona un usuario para asignar a esta tarea.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6767]"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    selectedUser === user.id
                      ? "bg-[#fff8f8] border border-[#ff6767]"
                      : "hover:bg-gray-100 border border-transparent"
                  }`}
                  onClick={() => setSelectedUser(user.id)}
                >
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  {selectedUser === user.id && (
                    <Check className="h-5 w-5 text-[#ff6767]" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAssign}
            className="bg-[#ff6767] hover:bg-[#ff5252] text-white"
            disabled={!selectedUser || isSubmitting}
          >
            {isSubmitting ? "Asignando..." : "Asignar Usuario"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
