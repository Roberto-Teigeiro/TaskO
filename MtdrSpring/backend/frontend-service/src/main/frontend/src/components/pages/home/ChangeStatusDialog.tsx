// @/components/pages/home/ChangeStatusDialog.tsx
// @/components/pages/home/ChangeStatusDialog.tsx
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
import { CircleDot, Check } from "lucide-react";
import {
  BackendStatus,
  FrontendStatus,
  getBackendStatus,
} from "@/components/Task-item";

interface ChangeStatusDialogProps {
  readonly taskId: string;
  readonly currentStatus: FrontendStatus;
  readonly onStatusChange: (
    taskId: string,
    status: BackendStatus,
  ) => Promise<void>;
}

export function ChangeStatusDialog({
  taskId,
  currentStatus,
  onStatusChange,
}: ChangeStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] =
    useState<FrontendStatus>(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = [
    { value: "Not Started", label: "No iniciada", color: "text-[#ff6b6b]" },
    { value: "In Progress", label: "En progreso", color: "text-[#4169E1]" },
    { value: "Completed", label: "Completada", color: "text-[#32CD32]" },
  ] as const;

  const handleSubmit = async () => {
    if (selectedStatus === currentStatus) {
      setOpen(false);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Convertir el estado al formato del backend
      const backendStatus = getBackendStatus(selectedStatus);
      await onStatusChange(taskId, backendStatus);
      setOpen(false);
    } catch (error) {
      console.error("Error changing status:", error);
      setError("No se pudo cambiar el estado de la tarea. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejador para accesibilidad de teclado
  const handleStatusKeyDown = (
    e: React.KeyboardEvent,
    statusValue: FrontendStatus,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedStatus(statusValue);
    }
  };

  // ID único para el DialogDescription para conectarlo con aria-describedby
  const dialogDescriptionId = `status-dialog-description-${taskId}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          Cambiar Estado
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[400px]"
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b-2 border-[#ff6767] pb-1">
            Cambiar Estado de la Tarea
          </DialogTitle>
          <DialogDescription
            id={dialogDescriptionId}
            className="text-sm text-gray-500"
          >
            Selecciona el nuevo estado para esta tarea.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-md text-sm mt-4">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-2">
          {statusOptions.map((status) => (
            <div
              key={status.value}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                selectedStatus === status.value
                  ? "bg-[#fff8f8] border border-[#ff6767]"
                  : "hover:bg-gray-100 border border-transparent"
              }`}
              onClick={() => setSelectedStatus(status.value as FrontendStatus)}
              onKeyDown={(e) =>
                handleStatusKeyDown(e, status.value as FrontendStatus)
              }
              tabIndex={0}
              role="button"
              aria-pressed={selectedStatus === status.value}
            >
              <CircleDot className={`h-5 w-5 ${status.color}`} />
              <div className="flex-1">
                <h4 className={`font-medium ${status.color}`}>
                  {status.label}
                </h4>
              </div>
              {selectedStatus === status.value && (
                <Check className="h-5 w-5 text-[#ff6767]" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-[#ff6767] hover:bg-[#ff5252] text-white"
            onClick={handleSubmit}
            disabled={selectedStatus === currentStatus || isSubmitting}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Estado"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
