import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

export interface ModalProps {
  /** Whether the modal is mounted + visible. */
  open: boolean
  /** Fired on Esc, backdrop click, or the close affordance. */
  onClose: () => void
  /** Heading shown in the modal header. */
  title?: React.ReactNode
  /** Supporting copy under the title. */
  description?: React.ReactNode
  /** Body content. */
  children?: React.ReactNode
  /** Footer content — typically the action buttons. */
  footer?: React.ReactNode
  /** Disable closing on backdrop click (Esc still works unless you also handle it). */
  disableBackdropClose?: boolean
  /** Accessible label when no visible `title` is provided. */
  'aria-label'?: string
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * EQ canonical modal dialog.
 *
 * Floating UI — one of the few places a shadow is allowed. Handles the full
 * a11y contract: portal to `document.body`, backdrop, Esc-to-close, focus trap,
 * and focus restoration to the previously-focused element on unmount.
 *
 * For a title + body + Cancel/Confirm pattern, prefer `ConfirmDialog`.
 *
 * All styling references `--eq-*` custom properties from `@eq-solutions/tokens`.
 *
 * @example
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Close out SLD-04?"
 *   description="This marks the defect resolved."
 *   footer={<>
 *     <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
 *     <Button onClick={confirm}>Close out</Button>
 *   </>}
 * />
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  disableBackdropClose = false,
  ['aria-label']: ariaLabel,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<Element | null>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return

    restoreRef.current = document.activeElement
    const dialog = dialogRef.current
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? dialog)?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (nodes.length === 0) {
        e.preventDefault()
        return
      }
      const firstNode = nodes[0]
      const lastNode = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault()
        lastNode.focus()
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault()
        firstNode.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = prevOverflow
      if (restoreRef.current instanceof HTMLElement) restoreRef.current.focus()
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="eq-modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !disableBackdropClose) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="eq-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title == null ? ariaLabel : undefined}
        aria-labelledby={title != null ? titleId : undefined}
        aria-describedby={description != null ? descId : undefined}
        tabIndex={-1}
      >
        {(title != null || description != null) && (
          <div className="eq-modal__head">
            {title != null && (
              <h3 id={titleId} className="eq-modal__title">
                {title}
              </h3>
            )}
            {description != null && (
              <p id={descId} className="eq-modal__desc">
                {description}
              </p>
            )}
          </div>
        )}
        {children != null && <div className="eq-modal__body">{children}</div>}
        {footer != null && <div className="eq-modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

Modal.displayName = 'Modal'
