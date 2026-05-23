import { AlertTriangle, X } from 'lucide-react'
import { motion } from 'framer-motion'

type DeleteConfirmDialogProps = {
  open: boolean
  count: number
  usageWarning?: boolean
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
}

export function DeleteConfirmDialog({
  open,
  count,
  usageWarning = false,
  onCancel,
  onConfirm,
  busy = false,
}: DeleteConfirmDialogProps) {
  if (!open) return null

  return (
    <motion.div
      className="pc-repo-sheet-overlay pc-repo-confirm-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pc-delete-confirm-title"
    >
      <button
        type="button"
        className="pc-repo-drawer-backdrop"
        aria-label="Cancel"
        onClick={onCancel}
      />
      <motion.div
        className="pc-repo-confirm"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="pc-repo-confirm-close"
          aria-label="Close"
          onClick={onCancel}
        >
          <X size={16} strokeWidth={1.6} />
        </button>
        <div className="pc-repo-confirm-icon">
          <AlertTriangle size={22} strokeWidth={1.6} />
        </div>
        <h2 id="pc-delete-confirm-title">
          Move {count} question{count === 1 ? '' : 's'} to trash?
        </h2>
        <p>
          Questions stay recoverable for <strong>12 hours</strong> (admin only). After
          that they are permanently removed.
        </p>
        {usageWarning && (
          <p className="pc-repo-confirm-warn">
            Some selected questions were used in papers. They will be hidden from the
            repository but remain in past papers.
          </p>
        )}
        <div className="pc-repo-confirm-actions">
          <button type="button" className="pc-btn is-sm" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="pc-btn is-sm is-danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Moving…' : 'Move to trash'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
