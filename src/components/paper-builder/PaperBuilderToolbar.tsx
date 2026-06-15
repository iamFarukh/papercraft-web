import {
  Check,
  Eye,
  FileText,
  ListChecks,
  Loader2,
  PenLine,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { SaveStatusMorph } from '@/components/motion/SaveStatusMorph'
import { PAPER_STATUS_CHIP } from '@/lib/paper-status-ui'
import type { SaveUiStatus } from '@/lib/save-confidence'
import type { PaperStatus } from '@/types/paper'

export type { SaveUiStatus }

type Props = {
  title: string
  blueprintLabel?: string
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
  exportSlot?: ReactNode
  onOpenEditor?: () => void
  canOpenEditor?: boolean
  onGenerateDraft?: () => void
  canGenerateDraft?: boolean
  generateDraftHint?: string
}

export function PaperBuilderToolbar({
  title,
  blueprintLabel,
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
  exportSlot,
  onOpenEditor,
  canOpenEditor = true,
  onGenerateDraft,
  canGenerateDraft = false,
  generateDraftHint,
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
          {blueprintLabel ? (
            <span className="pc-tag is-outline pc-pb-toolbar-bp" title="Active blueprint">
              {blueprintLabel}
            </span>
          ) : null}
          <span className={`pc-tag ${tag.className}`} style={{ height: 18, fontSize: 10 }}>
            {tag.label}
          </span>
        </div>
        <SaveStatusMorph saveStatus={saveStatus} saveHint={saveHint} />
      </div>

      <div className="pc-pb-toolbar-actions">
        {!readOnly && onGenerateDraft ? (
          <button
            type="button"
            className="pc-btn is-sm pc-pb-generate-entry"
            disabled={!canGenerateDraft}
            title={
              canGenerateDraft
                ? 'Generate a balanced draft from the active blueprint'
                : generateDraftHint ?? 'Select a blueprint to enable guided generation'
            }
            onClick={() => canGenerateDraft && onGenerateDraft()}
          >
            <ListChecks size={12} strokeWidth={1.6} />
            Generate draft
          </button>
        ) : null}
        {!readOnly && onOpenEditor ? (
          <button
            type="button"
            className="pc-btn is-sm pc-pb-editor-entry"
            disabled={!canOpenEditor}
            title={
              canOpenEditor
                ? 'Open the dedicated examination editor'
                : 'Save the paper before opening the examination editor'
            }
            onClick={() => canOpenEditor && onOpenEditor()}
          >
            <PenLine size={12} strokeWidth={1.6} />
            Examination editor
          </button>
        ) : null}
        <button type="button" className="pc-btn is-sm" onClick={onPreview}>
          <Eye size={12} strokeWidth={1.6} />
          Print preview
        </button>
        {exportSlot}
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
