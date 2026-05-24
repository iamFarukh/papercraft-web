import { Download, Lock } from 'lucide-react'

type Props = {
  onOpenPrintPreview: () => void
}

export function ExaminationEditorReadOnlyNotice({ onOpenPrintPreview }: Props) {
  return (
    <div className="pc-ee-readonly-notice">
      <div className="pc-ee-readonly-banner">
        <Lock size={13} strokeWidth={1.6} aria-hidden />
        <span>Locked · paper approved</span>
      </div>
      <p className="pc-ee-readonly-copy">
        All formatting controls are read-only. Export as PDF or Word from the print preview.
      </p>
      <button type="button" className="pc-btn is-sm pc-ee-readonly-cta" onClick={onOpenPrintPreview}>
        <Download size={11} strokeWidth={1.6} />
        Open print preview
      </button>
    </div>
  )
}
