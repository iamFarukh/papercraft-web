import { Eye, Pencil } from 'lucide-react'
import type { EditorSurfaceMode } from './ExaminationEditorChrome'

type Props = {
  pageCount: number
  activePage: number
  onPageSelect: (pageIndex: number) => void
  onSurfaceModeChange: (mode: EditorSurfaceMode) => void
}

export function ExaminationEditorPreviewSidePanel({
  pageCount,
  activePage,
  onPageSelect,
  onSurfaceModeChange,
}: Props) {
  return (
    <div className="pc-ee-preview-side pc-scroll">
      <div className="pc-ee-preview-side-card">
        <div className="pc-ee-preview-side-card-head">
          <Eye size={14} strokeWidth={1.6} aria-hidden />
          <span className="pc-ee-preview-side-title pc-serif">Preview surface</span>
        </div>
        <p className="pc-ee-preview-side-copy">
          You&apos;re viewing the paper as it will print. Selection outlines, inline controls,
          and override markers are hidden. Switch back to the Edit surface to make changes.
        </p>
        <button
          type="button"
          className="pc-btn is-sm pc-ee-preview-side-cta"
          onClick={() => onSurfaceModeChange('edit')}
        >
          <Pencil size={11} strokeWidth={1.6} />
          Switch to Edit surface
        </button>
      </div>

      {pageCount > 0 ? (
        <div className="pc-ee-page-nav">
          <span className="pc-ee-page-nav-label">Page navigation</span>
          <div className="pc-ee-page-nav-grid" role="list">
            {Array.from({ length: pageCount }, (_, i) => (
              <button
                key={i}
                type="button"
                role="listitem"
                className={`pc-ee-page-nav-btn${activePage === i ? ' is-active' : ''}`}
                onClick={() => onPageSelect(i)}
              >
                <span className="pc-ee-page-nav-thumb" aria-hidden />
                <span>Page {i + 1}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
