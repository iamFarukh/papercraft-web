import { useMemo } from 'react'
import {
  buildPrintPages,
  buildPrintPagesFromResolved,
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
  type PrintBlock,
  type PrintPageModel,
} from '@/lib/paper-print-layout'
import { configToCssVars } from '@/lib/paper-format-config'
import { resolveHeaderFields, resolvePageHeader } from '@/lib/paper-print-header'
import { printSettingsClassName, type ResolvedPaper } from '@/lib/paper-instance'
import type { EditSelection, PaperMarksDisplay } from '@/types/paper-instance'
import { PrintBlockContent } from './PrintBlockContent'
import { PrintPageBreakRibbon } from './PrintPageBreakRibbon'
import { PrintPageFooter } from './PrintPageFooter'
import { PrintPageHeader } from './PrintPageHeader'

export type OfficialPrintLayout = 'preview' | 'embedded' | 'builder' | 'edit'

type Props = {
  meta: PaperMeta
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
  /** When set, formatting overrides and marks flow through print layout. */
  resolved?: ResolvedPaper
  /** Measured pages from print layout engine (preferred). */
  pages?: PrintPageModel[]
  layout?: OfficialPrintLayout
  className?: string
  /** Highlights block matching editor selection in live preview. */
  syncSelection?: EditSelection
  /** When set, render only this page (used for preview strip thumbnails). */
  onlyPageIndex?: number
}

export function OfficialPrintDocument({
  meta,
  sections,
  generalInstructions,
  composition,
  resolved,
  pages: pagesProp,
  layout = 'preview',
  className = '',
  syncSelection,
  onlyPageIndex,
}: Props) {
  const allPages = useMemo(
    () =>
      pagesProp ??
      (resolved != null
        ? buildPrintPagesFromResolved(resolved)
        : buildPrintPages(sections, composition, generalInstructions)),
    [pagesProp, resolved, sections, composition, generalInstructions],
  )

  const pages = useMemo(() => {
    if (onlyPageIndex == null) return allPages
    const page = allPages[onlyPageIndex]
    return page ? [page] : []
  }, [allPages, onlyPageIndex])

  const effectiveMeta = resolved?.meta ?? meta
  const presentation = resolved?.presentation
  const printClass = resolved
    ? printSettingsClassName(resolved.printSettings)
    : ''
  const marksDisplay = resolved?.printSettings.marksDisplay ?? 'bracket'

  /** Full document page count (not reduced when rendering a single-page thumbnail). */
  const totalPageCount = allPages.length

  const formatVars = resolved ? configToCssVars(resolved.formatConfig) : {}

  return (
    <div
      className={`pc-print-doc pc-print-doc--${layout}${printClass ? ` ${printClass}` : ''}${className ? ` ${className}` : ''}`}
      style={
        {
          ...formatVars,
          '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
          '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
        } as Record<string, string>
      }
    >
      {pages.map((page) => (
        <div key={page.pageIndex} className="pc-print-page-stack">
          {onlyPageIndex == null && page.pageIndex > 0 ? (
            <PrintPageBreakRibbon
              pageNumber={page.pageIndex + 1}
              pageCount={totalPageCount}
            />
          ) : null}
          <PrintPage
            page={page}
            meta={effectiveMeta}
            pageCount={totalPageCount}
            isLastPage={page.pageIndex === totalPageCount - 1}
            resolved={resolved}
            showFooter={presentation?.showFooter !== false}
            marksDisplay={marksDisplay}
            syncSelection={syncSelection}
          />
        </div>
      ))}
    </div>
  )
}

function PrintPage({
  page,
  meta,
  pageCount,
  isLastPage,
  resolved,
  showFooter,
  marksDisplay,
  syncSelection,
}: {
  page: PrintPageModel
  meta: PaperMeta
  pageCount: number
  isLastPage: boolean
  resolved?: ResolvedPaper
  showFooter: boolean
  marksDisplay: PaperMarksDisplay
  syncSelection?: EditSelection
}) {
  const pageNumber = page.pageIndex + 1
  const continuedName = page.continuedSection?.name.split(' · ')[0]
  const presentation = resolved?.presentation
  const formatConfig = resolved?.formatConfig
  const headerRender =
    presentation && formatConfig
      ? resolvePageHeader(page, presentation, formatConfig)
      : { show: page.pageIndex === 0, mode: page.headerMode }
  const headerFields = presentation ? resolveHeaderFields(presentation) : undefined

  return (
    <article
      className="pc-print-page"
      data-print-page={page.pageIndex}
      aria-label={`Page ${pageNumber} of ${pageCount}`}
    >
      {headerRender.show ? (
        <PrintPageHeader meta={meta} mode={headerRender.mode} fields={headerFields} />
      ) : null}
      <div className="pc-print-page-body">
        {page.continuedSection ? (
          <p className="pc-print-continued-banner">
            Continued · Section {page.continuedSection.letter}
            {continuedName ? (
              <>
                {' '}
                <span className="pc-print-continued-banner-sub">· {continuedName}</span>
              </>
            ) : null}
          </p>
        ) : null}
        {page.blocks.map((block, i) => {
          const active = isSyncActive(block, syncSelection)
          return (
          <div
            key={`${page.pageIndex}-${block.kind}-${i}`}
            className={`pc-print-block${active ? ' is-sync-active' : ''}`}
            data-print-kind={block.kind}
          >
            <PrintBlockContent
              block={block}
              medium={meta.medium}
              marksDisplay={marksDisplay}
            />
          </div>
        )})}
        {isLastPage ? (
          <p className="pc-print-end-mark pc-serif">— end of paper · all the best —</p>
        ) : null}
      </div>
      {showFooter ? (
        <PrintPageFooter meta={meta} pageNumber={pageNumber} pageCount={pageCount} />
      ) : null}
    </article>
  )
}

function isSyncActive(block: PrintBlock, sel?: EditSelection): boolean {
  if (!sel) return false
  if (sel.kind === 'question' && block.kind === 'question') {
    return block.question.id === sel.questionId
  }
  if (sel.kind === 'section') {
    return (
      (block.kind === 'section-head' || block.kind === 'section-instructions') &&
      block.section.id === sel.sectionId
    )
  }
  return false
}
