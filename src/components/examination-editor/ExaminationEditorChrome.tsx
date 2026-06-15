import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  FileText,
  History,
  PanelLeft,
  Pencil,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { SaveStatusMorph } from '@/components/motion/SaveStatusMorph'
import { PAPER_STATUS_CHIP } from '@/lib/paper-status-ui'
import type { PaperStatus } from '@/types/paper'
import type { EditorSaveStatus } from '@/hooks/useExaminationEditorSession'

export type EditorSurfaceMode = 'edit' | 'preview'

type Props = {
  title: string
  saveStatus: EditorSaveStatus
  saveHint: string
  paperStatus: PaperStatus
  surfaceMode: EditorSurfaceMode
  readOnly?: boolean
  isDirty: boolean
  shellNavOpen: boolean
  onToggleShellNav: () => void
  onBack: () => void
  onSave: () => void
  onSurfaceModeChange: (mode: EditorSurfaceMode) => void
  onOpenFullPreview: () => void
  exportSlot?: ReactNode
}

export function ExaminationEditorChrome({
  title,
  saveStatus,
  saveHint,
  paperStatus,
  surfaceMode,
  readOnly,
  isDirty,
  shellNavOpen,
  onToggleShellNav,
  onBack,
  onSave,
  onSurfaceModeChange,
  onOpenFullPreview,
  exportSlot,
}: Props) {
  const tag = PAPER_STATUS_CHIP[paperStatus] ?? PAPER_STATUS_CHIP.draft
  const savedOk = saveStatus === 'saved' && !isDirty

  return (
    <header className="pc-ee-chrome">
      <button
        type="button"
        className={`pc-ee-shell-toggle${shellNavOpen ? ' is-active' : ''}`}
        title={shellNavOpen ? 'Hide app navigation' : 'Show app navigation'}
        aria-pressed={shellNavOpen}
        onClick={onToggleShellNav}
      >
        <PanelLeft size={14} strokeWidth={1.6} />
      </button>

      <button type="button" className="pc-btn is-sm is-ghost pc-ee-back-compose" onClick={onBack}>
        <ArrowLeft size={12} strokeWidth={1.6} />
        Back to compose
      </button>

      <span className="pc-ee-chrome-divider" aria-hidden />

      <span className="pc-ee-chrome-file-icon" aria-hidden>
        <FileText size={13} strokeWidth={1.6} />
      </span>

      <div className="pc-ee-chrome-title-block">
        <div className="pc-ee-chrome-title-row">
          <h1 className="pc-ee-chrome-title pc-serif">{title}</h1>
          <span className={`pc-tag ${tag.className}`}>{tag.label}</span>
        </div>
        <div className="pc-ee-chrome-save-row">
          {!readOnly && savedOk && !isDirty ? (
            <Check size={9} strokeWidth={2} className="pc-ee-chrome-check" aria-hidden />
          ) : null}
          <SaveStatusMorph saveStatus={saveStatus} saveHint={saveHint} />
        </div>
      </div>

      <div className="pc-ee-surface-switch" role="tablist" aria-label="Editor surface">
        <button
          type="button"
          role="tab"
          aria-selected={surfaceMode === 'edit'}
          className={`pc-ee-surface-btn${surfaceMode === 'edit' ? ' is-active' : ''}`}
          onClick={() => onSurfaceModeChange('edit')}
        >
          <Pencil size={11} strokeWidth={1.6} />
          Edit surface
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={surfaceMode === 'preview'}
          className={`pc-ee-surface-btn${surfaceMode === 'preview' ? ' is-active' : ''}`}
          onClick={() => onSurfaceModeChange('preview')}
        >
          <Eye size={11} strokeWidth={1.6} />
          Preview surface
        </button>
      </div>

      <div className="pc-ee-chrome-actions">
        <button
          type="button"
          className="pc-btn is-sm"
          disabled
          title="Version history — coming soon"
        >
          <History size={12} strokeWidth={1.6} />
          History
        </button>
        {exportSlot}
        <button type="button" className="pc-btn is-sm" onClick={onOpenFullPreview}>
          <Eye size={12} strokeWidth={1.6} />
          Full preview
          <ArrowRight size={11} strokeWidth={1.6} />
        </button>
        {!readOnly ? (
          <button
            type="button"
            className={`pc-btn is-sm is-primary pc-ee-save-btn${isDirty ? ' is-dirty' : ''}`}
            disabled={saveStatus === 'saving'}
            title={
              isDirty
                ? 'Save formatting and layout for print'
                : 'All changes saved to this examination'
            }
            onClick={onSave}
          >
            {saveStatus === 'saving' ? 'Saving…' : isDirty ? 'Save changes' : 'Saved'}
          </button>
        ) : null}
      </div>
    </header>
  )
}
