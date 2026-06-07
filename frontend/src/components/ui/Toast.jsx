import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

let _addToast = () => {}
export const toast = {
  success: (msg) => _addToast({ type: 'success', message: msg }),
  error: (msg) => _addToast({ type: 'error', message: msg }),
  warning: (msg) => _addToast({ type: 'warning', message: msg }),
  info: (msg) => _addToast({ type: 'info', message: msg }),
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const addToast = useCallback(({ type, message }) => {
    const id = ++nextId.current
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  useEffect(() => { _addToast = addToast }, [addToast])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  if (typeof document === 'undefined') return null
  return createPortal(
    <div className="toast-container">
      {toasts.map(({ id, type, message }) => {
        const Icon = icons[type] || Info
        return (
          <div key={id} className={`toast toast-${type}`}>
            <Icon size={16} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{message}</span>
            <button
              onClick={() => remove(id)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
