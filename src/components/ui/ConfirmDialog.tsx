import { motion, useReducedMotion } from 'framer-motion'
import { modalPop, overlayFade } from '@/lib/motion/variants'
import type { ReactNode } from 'react'

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const reduced = useReducedMotion()

  if (!open) return null

  return (
    <motion.div
      className="pc-confirm-overlay"
      variants={overlayFade}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pc-confirm-title"
    >
      <button
        type="button"
        className="pc-confirm-backdrop"
        aria-label="Cancel"
        onClick={onCancel}
      />
      <motion.div
        className="pc-confirm-panel"
        variants={modalPop}
        initial={reduced ? false : 'hidden'}
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="pc-confirm-title" className="pc-confirm-title">
          {title}
        </h2>
        <div className="pc-confirm-desc">{description}</div>
        <div className="pc-confirm-actions">
          <button
            type="button"
            className="pc-btn is-sm"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              tone === 'danger'
                ? 'pc-btn is-sm is-primary is-danger-fill'
                : 'pc-btn is-sm is-primary'
            }
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
