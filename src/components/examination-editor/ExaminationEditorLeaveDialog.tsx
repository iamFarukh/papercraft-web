import { Info } from 'lucide-react'

type Props = {
  open: boolean
  onStay: () => void
  onDiscard: () => void
  onSaveAndLeave: () => void
  saving?: boolean
}

export function ExaminationEditorLeaveDialog({
  open,
  onStay,
  onDiscard,
  onSaveAndLeave,
  saving,
}: Props) {
  if (!open) return null

  return (
    <div className="pc-ee-leave-overlay" role="presentation" onClick={onStay}>
      <div
        className="pc-ee-leave-dialog"
        role="alertdialog"
        aria-labelledby="ee-leave-title"
        aria-describedby="ee-leave-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pc-ee-leave-body">
          <span className="pc-ee-leave-icon" aria-hidden>
            <Info size={15} strokeWidth={1.6} />
          </span>
          <div>
            <h2 id="ee-leave-title" className="pc-ee-leave-title pc-serif">
              Unsaved changes
            </h2>
            <p id="ee-leave-desc" className="pc-ee-leave-desc">
              You have unsaved formatting changes. Leave anyway?
            </p>
          </div>
        </div>
        <div className="pc-ee-leave-actions">
          <button type="button" className="pc-btn" onClick={onStay}>
            Stay on page
          </button>
          <button type="button" className="pc-btn is-primary pc-ee-leave-discard" onClick={onDiscard}>
            Leave without saving
          </button>
          <button
            type="button"
            className="pc-btn is-primary pc-ee-leave-save"
            disabled={saving}
            onClick={onSaveAndLeave}
          >
            {saving ? 'Saving…' : 'Save and leave'}
          </button>
        </div>
      </div>
    </div>
  )
}
