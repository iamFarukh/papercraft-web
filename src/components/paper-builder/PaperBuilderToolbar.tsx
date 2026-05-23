import {
  Check,
  Eye,
  FileDown,
  FileText,
  Loader2,
  Settings,
} from 'lucide-react'
import { SaveStatusMorph } from '@/components/motion/SaveStatusMorph'
import { PDF_EXPORT_UNAVAILABLE_MSG } from '@/lib/paper-pdf-export'
import { PAPER_STATUS_CHIP } from '@/lib/paper-status-ui'
import type { PaperStatus } from '@/types/paper'

export type SaveUiStatus = 'saved' | 'saving' | 'unsaved' | 'error'

type Props = {
  title: string
  saveStatus: SaveUiStatus
  saveHint: string
  paperStatus?: PaperStatus
  readOnly?: boolean
  saveDisabled?: boolean
  submitDisabled?: boolean
  submitting?: boolean
  onSaveDraft: () => void
  onPreview: () => void
  onSubmit: () => void
  onExport: () => void
  onSettings: () => void
}

export function PaperBuilderToolbar({
  title,
  saveStatus,
  saveHint,
  paperStatus = 'draft',
  readOnly = false,
  saveDisabled,
  submitDisabled,
  submitting,
  onSaveDraft,
  onPreview,
  onSubmit,
  onExport,
  onSettings,
}: Props) {
  const tag = PAPER_STATUS_CHIP[paperStatus] ?? PAPER_STATUS_CHIP.draft

  return (
    <header className="pc-pb-toolbar">
      <span className="pc-pb-toolbar-icon" aria-hidden>
        <FileText size={14} strokeWidth={1.6} />
      </span>
      <div className="pc-pb-toolbar-title">
        <div className="pc-pb-toolbar-title-row">
          <span className="pc-pb-toolbar-name">{title}</span>
          <span className={`pc-tag ${tag.className}`} style={{ height: 18, fontSize: 10 }}>
            {tag.label}
          </span>
        </div>
        <SaveStatusMorph saveStatus={saveStatus} saveHint={saveHint} />
      </div>

      <div className="pc-pb-toolbar-actions">
        <button type="button" className="pc-btn is-sm" onClick={onSettings}>
          <Settings size={12} strokeWidth={1.6} />
          Paper settings
        </button>
        <button type="button" className="pc-btn is-sm" onClick={onPreview}>
          <Eye size={12} strokeWidth={1.6} />
          Print preview
        </button>
        <button
          type="button"
          className="pc-btn is-sm"
          disabled={paperStatus !== 'approved'}
          title={
            paperStatus === 'approved'
              ? 'Download official examination PDF'
              : PDF_EXPORT_UNAVAILABLE_MSG
          }
          onClick={onExport}
        >
          <FileDown size={12} strokeWidth={1.6} />
          Export PDF
        </button>
        {!readOnly ? (
          <>
            <span className="pc-pb-toolbar-divider" aria-hidden />
            <button
              type="button"
              className="pc-btn is-sm"
              disabled={saveDisabled || saveStatus === 'saving'}
              onClick={onSaveDraft}
            >
              {saveStatus === 'saving' ? (
                <Loader2 size={12} strokeWidth={1.6} className="pc-spin" />
              ) : (
                <Check size={12} strokeWidth={1.6} />
              )}
              Save draft
            </button>
            <button
              type="button"
              className="pc-btn is-primary is-sm"
              disabled={submitDisabled || submitting || saveStatus === 'saving'}
              onClick={onSubmit}
            >
              {submitting ? (
                <Loader2 size={12} strokeWidth={1.6} className="pc-spin" />
              ) : null}
              Submit for approval
            </button>
          </>
        ) : null}
      </div>
    </header>
  )
}
