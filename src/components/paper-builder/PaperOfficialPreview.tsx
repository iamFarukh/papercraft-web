import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import type { PaperComposition, PaperMeta, PaperSectionDef } from '@/lib/paper-builder'

type Props = {
  meta: PaperMeta
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
}

/** Paginated official examination document (embedded screen view). */
export function PaperOfficialPreview({
  meta,
  sections,
  generalInstructions,
  composition,
}: Props) {
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
