import type { PaperMeta } from '@/lib/paper-builder'
import { getPrintLabels } from '@/lib/paper-medium'
import { printFooterLabel } from '@/lib/paper-print-layout'

type Props = {
  meta: PaperMeta
  pageNumber: number
  pageCount: number
}

export function PrintPageFooter({ meta, pageNumber, pageCount }: Props) {
  const labels = getPrintLabels(meta.medium)

  return (
    <footer className="pc-print-footer">
      <span className="pc-print-footer-left">{printFooterLabel(meta)}</span>
      <span className={`pc-print-footer-right${meta.medium === 'hindi' ? ' pc-print-is-hindi' : ''}`}>
        {labels.page} <span className="pc-num">{pageNumber}</span> {labels.of}{' '}
        <span className="pc-num">{pageCount}</span>
      </span>
    </footer>
  )
}
