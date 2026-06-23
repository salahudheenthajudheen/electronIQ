import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface ToastData {
  id: string
  message: string
  xp?: number
  type?: "xp" | "info" | "error"
}

let toastListeners: ((toast: ToastData) => void)[] = []

export function addToast(toast: Omit<ToastData, "id">) {
  const id = Math.random().toString(36).substring(7)
  toastListeners.forEach(fn => fn({ ...toast, id }))
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const listener = (toast: ToastData) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 3000)
    }
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(fn => fn !== listener)
    }
  }, [])

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      addToast({ message: e.detail.message, xp: e.detail.xp, type: "xp" })
    }
    window.addEventListener('xp-toast', handler as EventListener)
    return () => window.removeEventListener('xp-toast', handler as EventListener)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="flex items-center gap-3 rounded-lg border border-accent/30 bg-surface px-4 py-3 shadow-lg"
          >
            {toast.xp && (
              <span className="text-accent font-bold text-sm">+{toast.xp} XP</span>
            )}
            <span className="text-text-primary text-sm">{toast.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
