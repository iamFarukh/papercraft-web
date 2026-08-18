import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { PaperComposition, PaperMeta, PaperSectionDef } from '@/lib/paper-builder'

type Props = {
  meta: PaperMeta
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
  resolved?: ResolvedPaper
}

/** Paginated official examination document (embedded screen view). */
export function PaperOfficialPreview({
  meta,
  sections,
  generalInstructions,
  composition,
  resolved,
}: Props) {
  // When the paper resolves, paginate from DOM-measured heights (source of truth) so
  // no question is clipped. The estimated fallback is only used before resolve.
  if (resolved) {
    return <MeasuredOfficialPreview resolved={resolved} />
  }

  return (
    <OfficialPrintDocument
      meta={meta}
      sections={sections}
      generalInstructions={generalInstructions}
      composition={composition}
      layout="embedded"
    />
  )
}

function MeasuredOfficialPreview({ resolved }: { resolved: ResolvedPaper }) {
  const { pages, blocks, onPrintMeasured } = useMeasuredPrintLayout(resolved)
  return (
    <>
      <PrintMeasureSurface resolved={resolved} blocks={blocks} onMeasured={onPrintMeasured} />
      <OfficialPrintDocument
        meta={resolved.meta}
        resolved={resolved}
        pages={pages}
        layout="embedded"
      />
    </>
  )
}
