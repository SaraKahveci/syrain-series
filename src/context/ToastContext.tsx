import { createContext, useContext, useState, useCallback } from 'react'
import Toast, { ToastMessage, ToastType } from '../components/Toast'

type ToastContextType = {
  showToast: (text: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((text: string, type: ToastType = 'success') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => removeToast(id), 3000)
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)