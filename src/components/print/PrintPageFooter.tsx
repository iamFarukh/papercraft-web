import type { PaperMeta } from '@/lib/paper-builder'
import { PRINT_CHROME_LABELS } from '@/lib/paper-medium'
import { printFooterLabel } from '@/lib/paper-print-layout'

type Props = {
  meta: PaperMeta
  pageNumber: number
  pageCount: number
}

export function PrintPageFooter({ meta, pageNumber, pageCount }: Props) {
  return (
    <footer className="pc-print-footer">
      <span className="pc-print-footer-left">{printFooterLabel(meta)}</span>
      <span className="pc-print-footer-right">
        {PRINT_CHROME_LABELS.page}{' '}
        <span className="pc-num">{pageNumber}</span> {PRINT_CHROME_LABELS.of}{' '}
        <span className="pc-num">{pageCount}</span>
      </span>
    </footer>
  )
}
