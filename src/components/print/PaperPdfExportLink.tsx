import { FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paperPrintPreviewPath } from '@/config/nav-routes'
import { PDF_EXPORT_UNAVAILABLE_MSG } from '@/lib/paper-pdf-export'

type Props = {
  paperId: string
  canExport: boolean
  from?: 'builder' | 'library' | 'approval'
  className?: string
  /** When true, opens preview and starts PDF download automatically */
  startExport?: boolean
}

export function PaperPdfExportLink({
  paperId,
  canExport,
  from = 'library',
  className = '',
  startExport = true,
}: Props) {
  if (!canExport) {
    return (
      <span
        className={`pc-pdf-export-disabled${className ? ` ${className}` : ''}`}
        title={PDF_EXPORT_UNAVAILABLE_MSG}
      >
        <button type="button" className="pc-btn is-sm" disabled>
          <FileDown size={12} strokeWidth={1.6} />
          Export PDF
        </button>
      </span>
    )
  }

  const href = `${paperPrintPreviewPath(paperId, from)}${startExport ? '&export=1' : ''}`

  return (
    <Link to={href} className={`pc-btn is-sm${className ? ` ${className}` : ''}`}>
      <FileDown size={12} strokeWidth={1.6} />
      Export PDF
    </Link>
  )
}
