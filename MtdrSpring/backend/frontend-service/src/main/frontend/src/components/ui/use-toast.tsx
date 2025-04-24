// src/components/ui/use-toast.tsx
import { useState, createContext, useContext, useMemo } from "react"

interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
  duration?: number
}

type ToasterToast = Toast & {
  open: boolean
}

const ToastContext = createContext<{
  toasts: ToasterToast[]
  addToast: (toast: Toast) => void
  dismissToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  dismissToast: () => {},
})

export function ToastProvider({ children }: { readonly children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToasterToast[]>([])

  const addToast = (toast: Toast) => {
    const id = toast.id ?? crypto.randomUUID()
    const duration = toast.duration ?? 5000

    setToasts((prev) => [...prev, { ...toast, id, open: true }])

    setTimeout(() => {
      dismissToast(id)
    }, duration)
  }

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    )

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 300) // Wait for animation before removing
  }

  // Use useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ toasts, addToast, dismissToast }),
    [toasts]
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  
  const toast = (props: Toast) => {
    context.addToast(props)
  }
  
  return { toast, toasts: context.toasts, dismiss: context.dismissToast }
}

export const toast = (props: Toast) => {
  // If used outside provider (like during SSR), just log it
  if (typeof window === "undefined") {
    console.log("Toast (server):", props)
    return
  }

  // Create an event to communicate with the ToastProvider
  const event = new CustomEvent("toast", { detail: props })
  window.dispatchEvent(event)
}

// Add listener in the provider
if (typeof window !== "undefined") {
  window.addEventListener("toast", ((e: CustomEvent<Toast>) => {
    const { detail } = e
    toast(detail)
  }) as EventListener)
}
