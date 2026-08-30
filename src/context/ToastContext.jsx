import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

const ToastContext = createContext(null)

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const toneMap = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-brand-200 bg-brand-50 text-brand-900',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const notify = useCallback((message, type = 'info', duration = 4200) => {
    const id = crypto.randomUUID()
    setToasts((items) => [...items, { id, message, type }])
    window.setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,420px)] flex-col gap-3" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const Icon = iconMap[toast.type] || Info
          return (
            <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-soft ${toneMap[toast.type] || toneMap.info}`}>
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-sm font-medium leading-6">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100" aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
