import { Loader2 } from 'lucide-react'
import { useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import { PrintPreviewShell } from '@/components/print/PrintPreviewShell'
import { toolbarTitleFromSetup } from '@/lib/paper-builder'
import { PDF_EXPORT_UNAVAILABLE_MSG } from '@/lib/paper-pdf-export'
import { usePaperPrintData } from '@/hooks/usePaperPrintData'

export function PaperPrintPreviewPage() {
  const { paperId } = useParams<{ paperId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const documentRootRef = useRef<HTMLDivElement>(null)
  const from = searchParams.get('from')
  const autoExport = searchParams.get('export') === '1'
  const { phase, data } = usePaperPrintData(paperId)

  const handleExit = () => {
    if (from === 'builder' && paperId) {
      navigate(`/app/builder/${paperId}`)
      return
    }
    if (from === 'approval' && paperId) {
      navigate(`/app/approvals/${paperId}`)
      return
    }
    navigate('/app/papers')
  }

  if (phase === 'loading') {
    return (
      <div className="pc-print-preview-root pc-print-preview-root--loading">
        <div className="pc-pb-load-state">
          <Loader2 size={22} className="pc-spin" />
          <p className="pc-pb-load-muted" style={{ marginTop: 12, color: '#9aa3b0' }}>
            Preparing official preview…
          </p>
        </div>
      </div>
    )
  }

  if (phase === 'error' || !data) {
    return (
      <div className="pc-print-preview-root pc-print-preview-root--loading">
        <div className="pc-pb-load-state is-error">
          <p className="pc-pb-load-title pc-serif">Paper not available</p>
          <p className="pc-pb-load-muted">This paper could not be loaded for preview.</p>
          <Link to="/app/papers" className="pc-btn">
            Paper library
          </Link>
        </div>
      </div>
    )
  }

  const title = toolbarTitleFromSetup(data.setup)
  const isApproved = data.status === 'approved'
  const subtitle = isApproved
    ? 'Official examination preview. Export PDF or print for distribution.'
    : `Screen preview only. ${PDF_EXPORT_UNAVAILABLE_MSG}`

  return (
    <PrintPreviewShell
      title={title}
      subtitle={subtitle}
      onExit={handleExit}
      setup={data.setup}
      canExportPdf={isApproved}
      documentRootRef={documentRootRef}
      autoExportPdf={autoExport && isApproved}
    >
      <OfficialPrintDocument
        meta={data.meta}
        sections={data.sections}
        generalInstructions={data.setup.generalInstructions}
        composition={data.composition}
        layout="preview"
      />
    </PrintPreviewShell>
  )
}
