import { useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import {
  buildPrintPages,
  buildPrintPagesFromResolved,
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
  type PrintBlock,
} from '@/lib/paper-print-layout'
import { printSettingsClassName, type ResolvedPaper } from '@/lib/paper-instance'
import { PrintBlockContent } from '@/components/print/PrintBlockContent'
import { PrintPageBreakRibbon } from '@/components/print/PrintPageBreakRibbon'
import { PrintPageFooter } from '@/components/print/PrintPageFooter'
import { PrintPageHeader } from '@/components/print/PrintPageHeader'
import { SectionSwitcher } from '@/components/paper-builder/SectionSwitcher'
import { PaperQuestionBlock } from '@/components/paper-builder/PaperQuestionBlock'
import {
  flattenPaperQuestions,
  type PaperComposition,
  type PaperMeta,
  type PaperSectionDef,
  type PaperSectionId,
  type ReplaceTarget,
} from '@/lib/paper-builder'
import type { PaperMedium } from '@/lib/paper-medium'
import type { PaperMarksDisplay } from '@/types/paper-instance'
import type { QuestionRecord } from '@/types/question'

type Props = {
  meta: PaperMeta
  resolved?: ResolvedPaper
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
  activeSection: PaperSectionId
  replaceTarget: ReplaceTarget | null
  lastInsertedId: string | null
  onSelectSection: (id: PaperSectionId) => void
  onRemove: (sectionId: PaperSectionId, questionId: string) => void
  onReplace: (sectionId: PaperSectionId, question: QuestionRecord) => void
  onMove: (sectionId: PaperSectionId, questionId: string, direction: 'up' | 'down') => void
  onFocusRepository?: () => void
  readOnly?: boolean
  paperMedium?: PaperMedium
}

export function PaperBuilderPaginatedCanvas({
  meta,
  resolved,
  sections,
  generalInstructions,
  composition,
  activeSection,
  replaceTarget,
  lastInsertedId,
  onSelectSection,
  onRemove,
  onReplace,
  onMove,
  onFocusRepository,
  readOnly = false,
  paperMedium = 'english',
}: Props) {
  const pages = useMemo(
    () =>
      resolved
        ? buildPrintPagesFromResolved(resolved)
        : buildPrintPages(sections, composition, generalInstructions),
    [resolved, sections, composition, generalInstructions],
  )
  const displayMeta = resolved?.meta ?? meta
  const printClass = resolved ? printSettingsClassName(resolved.printSettings) : ''
  const marksDisplay = resolved?.printSettings.marksDisplay ?? 'bracket'
  const pageCount = pages.length
  const isEmpty = flattenPaperQuestions(composition, sections).length === 0

  return (
    <main
      className={`pc-pb-canvas-wrap pc-dots pc-pb-canvas-wrap--paginated${readOnly ? ' is-read-only' : ''}`}
    >
      {!readOnly ? (
        <div className="pc-pb-canvas-toolbar">
          <SectionSwitcher
            sections={sections}
            composition={composition}
            activeSection={activeSection}
            onSelect={onSelectSection}
          />
          <p className="pc-pb-canvas-toolbar-hint">
            New questions from the repository go into the highlighted section. Click a
            section heading on the paper to switch.
          </p>
        </div>
      ) : null}

      {isEmpty ? (
        <div className="pc-pb-empty-cta">
          <Sparkles size={18} strokeWidth={1.6} className="pc-pb-empty-cta-icon" />
          <h4 className="pc-pb-empty-cta-title">Compose your examination paper</h4>
          <p className="pc-pb-empty-cta-copy">
            Pick a section above, then add questions from the repository on the left.
          </p>
        </div>
      ) : (
        <div
          className={`pc-print-doc pc-print-doc--builder${printClass ? ` ${printClass}` : ''}`}
          style={
            {
              '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
              '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
            } as Record<string, string>
          }
        >
          {pages.map((page, index) => (
            <div key={page.pageIndex} className="pc-print-page-stack">
              {index > 0 ? (
                <PrintPageBreakRibbon pageNumber={index + 1} pageCount={pageCount} />
              ) : null}
              <article
                className="pc-print-page"
                aria-label={`Page ${page.pageIndex + 1} of ${pageCount}`}
              >
                <PrintPageHeader meta={displayMeta} mode={page.headerMode} />
                <div className="pc-print-page-body">
                  {page.continuedSection ? (
                    <p className="pc-print-continued-banner">
                      Continued · Section {page.continuedSection.letter}
                      <span className="pc-print-continued-banner-sub">
                        {' '}
                        · {page.continuedSection.name.split(' · ')[0]}
                      </span>
                    </p>
                  ) : null}
                  {page.blocks.map((block, blockIndex) => (
                    <BuilderPrintBlock
                      key={`${page.pageIndex}-${block.kind}-${blockIndex}`}
                      block={block}
                      medium={displayMeta.medium}
                      composition={composition}
                      activeSection={activeSection}
                      replaceTarget={replaceTarget}
                      lastInsertedId={lastInsertedId}
                      readOnly={readOnly}
                      paperMedium={paperMedium}
                      onSelectSection={onSelectSection}
                      onRemove={onRemove}
                      onReplace={onReplace}
                      onMove={onMove}
                      marksDisplay={marksDisplay}
                    />
                  ))}
                  {page.pageIndex === pageCount - 1 ? (
                    <p className="pc-print-end-mark pc-serif">— end of paper · all the best —</p>
                  ) : null}
                </div>
                <PrintPageFooter
                  meta={displayMeta}
                  pageNumber={page.pageIndex + 1}
                  pageCount={pageCount}
                />
              </article>
            </div>
          ))}
        </div>
      )}

      {isEmpty && !readOnly ? (
        <button type="button" className="pc-btn is-sm" onClick={onFocusRepository}>
          Focus repository
        </button>
      ) : null}
    </main>
  )
}

function BuilderPrintBlock({
  block,
  medium,
  composition,
  activeSection,
  replaceTarget,
  lastInsertedId,
  readOnly,
  paperMedium,
  onSelectSection,
  onRemove,
  onReplace,
  onMove,
  marksDisplay,
}: {
  block: PrintBlock
  medium: PaperMeta['medium']
  composition: PaperComposition
  activeSection: PaperSectionId
  replaceTarget: ReplaceTarget | null
  lastInsertedId: string | null
  readOnly: boolean
  paperMedium: PaperMedium
  marksDisplay: PaperMarksDisplay
  onSelectSection: (id: PaperSectionId) => void
  onRemove: (sectionId: PaperSectionId, questionId: string) => void
  onReplace: (sectionId: PaperSectionId, question: QuestionRecord) => void
  onMove: (sectionId: PaperSectionId, questionId: string, direction: 'up' | 'down') => void
}) {
  if (block.kind === 'question') {
    const sectionId = block.section.id
    const items = composition[sectionId]
    const idx = items.findIndex((q) => q.id === block.question.id)
    return (
      <div className="pc-pb-print-question-wrap">
        <PaperQuestionBlock
          question={block.question}
          number={block.number}
          isNew={block.question.id === lastInsertedId}
          isReplacing={
            replaceTarget?.sectionId === sectionId &&
            replaceTarget.questionId === block.question.id
          }
          canMoveUp={idx > 0}
          canMoveDown={idx >= 0 && idx < items.length - 1}
          readOnly={readOnly}
          paperMedium={paperMedium}
          onRemove={() => onRemove(sectionId, block.question.id)}
          onReplace={() => onReplace(sectionId, block.question)}
          onMoveUp={() => onMove(sectionId, block.question.id, 'up')}
          onMoveDown={() => onMove(sectionId, block.question.id, 'down')}
        />
      </div>
    )
  }

  if (block.kind === 'section-head') {
    const isActive = activeSection === block.section.id
    return (
      <div
        className={`pc-print-block pc-pb-section-head-wrap${!readOnly && isActive ? ' is-active' : ''}`}
        data-print-kind={block.kind}
      >
        <button
          type="button"
          className="pc-pb-section-head-hit"
          disabled={readOnly}
          onClick={() => onSelectSection(block.section.id)}
          title={`Add questions to Section ${block.section.letter}`}
        >
          <PrintBlockContent block={block} medium={medium} marksDisplay={marksDisplay} />
          {!readOnly && isActive ? (
            <span className="pc-pb-section-active-pill">Active</span>
          ) : null}
        </button>
      </div>
    )
  }

  return (
    <div className="pc-print-block" data-print-kind={block.kind}>
      <PrintBlockContent block={block} medium={medium} marksDisplay={marksDisplay} />
    </div>
  )
}
