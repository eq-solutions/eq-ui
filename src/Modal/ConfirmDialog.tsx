import React from 'react'
import { Modal } from './Modal'
import { Button } from '../Button/Button'

export interface ConfirmDialogProps {
  /** Whether the dialog is visible. */
  open: boolean
  /** Fired on Cancel, Esc, or backdrop click. */
  onClose: () => void
  /** Fired when the user confirms. */
  onConfirm: () => void
  /** Heading. */
  title: React.ReactNode
  /** Supporting copy explaining the consequence of confirming. */
  description?: React.ReactNode
  /** Confirm button label. Defaults to `'Confirm'`. */
  confirmLabel?: string
  /** Cancel button label. Defaults to `'Cancel'`. */
  cancelLabel?: string
  /** Render the confirm action in the danger style for destructive actions. */
  destructive?: boolean
  /** Disable + spin the confirm button while the action runs. */
  loading?: boolean
}

/**
 * EQ canonical confirm dialog — `Modal` pre-wired with Cancel / Confirm.
 *
 * Use for any "are you sure?" gate. Set `destructive` for actions that delete
 * or close something out (renders the confirm button red).
 *
 * @example
 * <ConfirmDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete this report?"
 *   description="This can't be undone."
 *   confirmLabel="Delete"
 *   destructive
 * />
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'
