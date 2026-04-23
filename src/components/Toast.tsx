import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export type ToastMessage = {
  id: string
  text: string
  type: ToastType
}

type Props = {
  toasts: ToastMessage[]
  removeToast: (id: string) => void
}
export default function Toast({ toasts, removeToast }: Props)  {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => removeToast(t.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer transition-all text-sm font-medium text-white ${
            t.type === 'success' ? 'bg-green-600' :
            t.type === 'error' ? 'bg-red-600' :
            'bg-zinc-700'
          }`}
        >
          <span>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.text}
        </div>
      ))}
    </div>
  )
}