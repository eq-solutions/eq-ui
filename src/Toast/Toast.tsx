import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

export type ToastTone = 'ok' | 'warn' | 'err' | 'info'

export interface ToastOptions {
  /** Bold first line. */
  title: React.ReactNode
  /** Optional second-line detail. */
  message?: React.ReactNode
  /** Colour + default icon. Defaults to `'ok'`. */
  tone?: ToastTone
  /**
   * Auto-dismiss delay in ms. Defaults to `4000`.
   * Pass `0` to make the toast persist until dismissed.
   */
  duration?: number
  /** Override the leading icon. */
  icon?: React.ReactNode
}

interface ToastRecord extends ToastOptions {
  id: number
}

interface ToastContextValue {
  /** Push a toast onto the stack. Returns its id (for manual dismissal). */
  toast: (opts: ToastOptions) => number
  /** Dismiss a toast by id. */
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/**
 * Access the toast API. Must be rendered under a `<ToastProvider>`.
 *
 * @example
 * const { toast } = useToast()
 * toast({ tone: 'ok', title: 'Saved', message: 'Work order WO-2231 updated.' })
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>')
  return ctx
}

const DEFAULT_ICONS: Record<ToastTone, React.ReactNode> = {
  ok: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  err: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="m15 9-6 6m0-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5m0-8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
}

/**
 * EQ canonical toast host.
 *
 * Wrap the app once near the root, then call `useToast().toast(…)` anywhere.
 * Toasts auto-dismiss (default 4s), stack bottom-right, and are announced via
 * an `aria-live` region. Floating UI — shadow is permitted here.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const seq = useRef(0)
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (opts: ToastOptions) => {
      const id = ++seq.current
      setToasts((prev) => [...prev, { ...opts, id }])
      const duration = opts.duration ?? 4000
      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration)
        )
      }
      return id
    },
    [dismiss]
  )

  useEffect(() => {
    const map = timers.current
    return () => {
      map.forEach((t) => clearTimeout(t))
      map.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="eq-toast__region" role="region" aria-live="polite" aria-label="Notifications">
            {toasts.map((t) => {
              const tone = t.tone ?? 'ok'
              return (
                <div key={t.id} className={`eq-toast eq-toast--${tone}`} role="status">
                  <span className="eq-toast__icon" aria-hidden="true">
                    {t.icon ?? DEFAULT_ICONS[tone]}
                  </span>
                  <div className="eq-toast__content">
                    <div className="eq-toast__title">{t.title}</div>
                    {t.message != null && (
                      <div className="eq-toast__message">{t.message}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="eq-toast__close"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  )
}

ToastProvider.displayName = 'ToastProvider'
