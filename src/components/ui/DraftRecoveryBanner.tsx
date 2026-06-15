import { RotateCcw, X } from 'lucide-react'

type Props = {
  savedLabel: string
  onRecover: () => void
  onDismiss: () => void
}

export function DraftRecoveryBanner({ savedLabel, onRecover, onDismiss }: Props) {
  return (
    <div className="pc-recovery-banner" role="status">
      <div className="pc-recovery-banner-main">
        <RotateCcw size={14} strokeWidth={1.6} aria-hidden />
        <p>
          <strong>Recover unsaved changes?</strong> A local draft from {savedLabel} is
          available on this device.
        </p>
      </div>
      <div className="pc-recovery-banner-actions">
        <button type="button" className="pc-btn is-sm is-primary" onClick={onRecover}>
          Recover draft
        </button>
        <button type="button" className="pc-btn is-sm" onClick={onDismiss}>
          Keep current
        </button>
        <button
          type="button"
          className="pc-icon-btn"
          aria-label="Dismiss recovery notice"
          onClick={onDismiss}
        >
          <X size={14} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}
