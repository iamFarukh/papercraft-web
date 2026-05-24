import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
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
  return (
    <OfficialPrintDocument
      meta={meta}
      sections={sections}
      generalInstructions={generalInstructions}
      composition={composition}
      resolved={resolved}
      layout="embedded"
    />
  )
}
