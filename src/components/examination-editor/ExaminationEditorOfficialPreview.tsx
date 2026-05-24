import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import type { PrintPageModel } from '@/lib/paper-print-layout'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { PaperComposition, PaperSectionDef } from '@/lib/paper-builder'
import type { PaperSetupState } from '@/lib/paper-builder'
import type { EditSelection } from '@/types/paper-instance'
import type { RefObject } from 'react'

type Props = {
  resolved: ResolvedPaper
  setup: PaperSetupState
  sections: PaperSectionDef[]
  composition: PaperComposition
  pages: PrintPageModel[]
  scrollRef?: RefObject<HTMLDivElement | null>
  syncSelection?: EditSelection
  activePage?: number
  onPageSelect?: (pageIndex: number) => void
}

export function ExaminationEditorOfficialPreview({
  resolved,
  setup,
  sections,
  composition,
  pages,
  scrollRef,
  syncSelection,
  activePage = 0,
  onPageSelect,
}: Props) {
  const pageCount = pages.length

  return (
    <aside className="pc-ee-strip" aria-label="Official print preview">
      <div className="pc-ee-strip-head">
        <div>
          <h2 className="pc-ee-strip-title">Official Preview</h2>
          <p className="pc-ee-strip-sub">Scroll-synced · read-only</p>
        </div>
      </div>

      <div className="pc-ee-strip-scroll pc-scroll" ref={scrollRef}>
        {pageCount === 0 ? (
          <p className="pc-ee-strip-empty">No pages yet.</p>
        ) : (
          pages.map((page) => (
            <button
              key={page.pageIndex}
              type="button"
              data-ee-page-thumb={page.pageIndex}
              className={`pc-ee-strip-thumb${activePage === page.pageIndex ? ' is-active' : ''}`}
              onClick={() => onPageSelect?.(page.pageIndex)}
              aria-label={`Go to page ${page.pageIndex + 1}`}
              aria-current={activePage === page.pageIndex ? 'true' : undefined}
            >
              <div className="pc-ee-strip-thumb-frame">
                <div className="pc-ee-strip-thumb-scale">
                  <OfficialPrintDocument
                    meta={resolved.meta}
                    sections={sections}
                    generalInstructions={setup.generalInstructions}
                    composition={composition}
                    resolved={resolved}
                    pages={pages}
                    layout="embedded"
                    className="pc-ee-official-doc pc-ee-official-doc--thumb"
                    onlyPageIndex={page.pageIndex}
                    syncSelection={syncSelection}
                  />
                </div>
              </div>
              <span className="pc-ee-strip-thumb-label pc-num">Page {page.pageIndex + 1}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
