/* eslint-disable @typescript-eslint/no-explicit-any */
// AssignUserDialog.tsx
// AssignUserDialog.tsx
// @/components/pages/home/AssignUserDialog.tsx
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserPlus, User, Check } from "lucide-react"
import { useProjects } from "../../../context/ProjectContext"

// Definir las interfaces basadas en los datos reales del API
interface UserType {
  readonly id?: string
  readonly userId?: string
  readonly name?: string
  readonly email?: string
  readonly avatar?: string
  readonly role?: string | null
}

interface AssignUserDialogProps {
  readonly taskId: string
  readonly currentAssignee?: string
  readonly onAssign: (taskId: string, userId: string) => Promise<void>
}

export function AssignUserDialog({ taskId, currentAssignee, onAssign }: AssignUserDialogProps) {
  // Obtener el projectId desde el contexto
  const { userProjects } = useProjects();
  const projectId = userProjects && userProjects.length > 0 ? userProjects[0].projectId : null;
  
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(currentAssignee ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
    // Reset selected user when dialog opens
    setSelectedUser(currentAssignee ?? null)
  }, [open, currentAssignee])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Verificar si tenemos un projectId válido
      if (!projectId) {
        throw new Error('No se ha seleccionado un proyecto');
      }
      
      // Llamada a la API para obtener usuarios
      const response = await fetch(`http://localhost:8080/projects/${projectId}/members`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transformar los datos recibidos al formato esperado
      const formattedUsers: UserType[] = data.map((user: any) => {
        // Extraer el ID de usuario desde el objeto recibido
        return {
          id: user.userId, // Usar userId como id
          name: user.name || `Usuario ${user.userId.slice(-4)}`, // Usar nombre o fallback
          email: user.email || '',
          avatar: user.avatar || null,
          role: user.role
        }
      });
      
      setUsers(formattedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('No se pudieron cargar los usuarios. Usando datos de respaldo.')
      
      // Datos de ejemplo en caso de fallo para asegurar que la UI funcione
      setUsers([
        { id: 'user_2wCDemERnBiP3fgOlBNPDwV3ncB', name: 'Ana García', email: 'ana@example.com', avatar: '/placeholder.svg' },
        { id: '2', name: 'Carlos López', email: 'carlos@example.com', avatar: '/placeholder.svg' },
        { id: '3', name: 'Elena Martínez', email: 'elena@example.com', avatar: '/placeholder.svg' },
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
        setError('No se pudo asignar el usuario. Inténtalo de nuevo.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Manejadores para accesibilidad de teclado
  const handleUserKeyDown = (e: React.KeyboardEvent, userId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedUser(userId);
    }
  }

  // ID único para el DialogDescription para conectarlo con aria-describedby
  const dialogDescriptionId = `assign-dialog-description-${taskId}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          <UserPlus className="h-3 w-3" />
          {currentAssignee ? "Reasignar" : "Asignar"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" aria-describedby={dialogDescriptionId}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">
            Asignar Usuario a la Tarea
          </DialogTitle>
          <DialogDescription id={dialogDescriptionId} className="text-sm text-gray-500">
            Selecciona un usuario para asignar a esta tarea.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6767]"></div>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No hay usuarios disponibles</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                      selectedUser === user.id
                        ? "bg-[#fff8f8] border border-[#ff6767]"
                        : "hover:bg-gray-100 border border-transparent"
                    }`}
                    onClick={() => setSelectedUser(user.id || '')}
                    onKeyDown={(e) => user.id && handleUserKeyDown(e, user.id)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedUser === user.id}
                  >
                    <div className="flex-shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || 'Usuario'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{user.name || `Usuario ${user.id?.slice(-4)}`}</h4>
                      <p className="text-sm text-gray-500">{user.email || (user.role && `Rol: ${user.role}`) || ''}</p>
                    </div>
                    {selectedUser === user.id && (
                      <Check className="h-5 w-5 text-[#ff6767]" />
                    )}
                  </div>
                ))
              )}
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