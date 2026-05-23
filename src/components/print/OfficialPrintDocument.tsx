import { useMemo } from 'react'
import {
  buildPrintPages,
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
  type PrintPageModel,
} from '@/lib/paper-print-layout'
import type { PaperComposition, PaperMeta, PaperSectionDef } from '@/lib/paper-builder'
import { PrintBlockContent } from './PrintBlockContent'
import { PrintPageFooter } from './PrintPageFooter'
import { PrintPageHeader } from './PrintPageHeader'

export type OfficialPrintLayout = 'preview' | 'embedded'

type Props = {
  meta: PaperMeta
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
  layout?: OfficialPrintLayout
  className?: string
}

export function OfficialPrintDocument({
  meta,
  sections,
  generalInstructions,
  composition,
  layout = 'preview',
  className = '',
}: Props) {
  const pages = useMemo(
    () => buildPrintPages(sections, composition, generalInstructions),
    [sections, composition, generalInstructions],
  )

  const pageCount = pages.length

  return (
    <div
      className={`pc-print-doc pc-print-doc--${layout}${className ? ` ${className}` : ''}`}
      style={
        {
          '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
          '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
        } as Record<string, string>
      }
    >
      {pages.map((page) => (
        <PrintPage
          key={page.pageIndex}
          page={page}
          meta={meta}
          pageCount={pageCount}
        />
      ))}
    </div>
  )
}

function PrintPage({
  page,
  meta,
  pageCount,
}: {
  page: PrintPageModel
  meta: PaperMeta
  pageCount: number
}) {
  const pageNumber = page.pageIndex + 1

  return (
    <article className="pc-print-page" aria-label={`Page ${pageNumber} of ${pageCount}`}>
      <PrintPageHeader meta={meta} mode={page.headerMode} />
      <div className="pc-print-page-body">
        {page.blocks.map((block, i) => (
          <div
            key={`${page.pageIndex}-${block.kind}-${i}`}
            className="pc-print-block"
            data-print-kind={block.kind}
          >
            <PrintBlockContent block={block} medium={meta.medium} />
          </div>
        ))}
      </div>
      <PrintPageFooter meta={meta} pageNumber={pageNumber} pageCount={pageCount} />
    </article>
  )
}
