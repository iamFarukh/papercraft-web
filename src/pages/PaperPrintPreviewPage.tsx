import { Loader2 } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { OfficialPrintDocument } from '@/components/print/OfficialPrintDocument'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { PrintPreviewShell } from '@/components/print/PrintPreviewShell'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import { sectionsForSetup, toolbarTitleFromSetup } from '@/lib/paper-builder'
import { resolvePaper } from '@/lib/paper-instance'
import {
  EXPORT_UNAVAILABLE_MSG,
  parseExportFormatFromQuery,
} from '@/lib/paper-export-formats'
import { usePaperPrintData } from '@/hooks/usePaperPrintData'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import type { PrintPageModel } from '@/lib/paper-print-layout'
import type { PaperComposition, PaperSectionDef, PaperSetupState } from '@/lib/paper-builder'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { PaperPrintPreviewLocationState } from '@/types/paper-print-preview'

type PreviewDocumentProps = {
  resolved: ResolvedPaper
  setup: PaperSetupState
  sections: PaperSectionDef[]
  composition: PaperComposition
  snapshotPages?: PrintPageModel[]
}

function PaperPrintPreviewDocument({
  resolved,
  setup,
  sections,
  composition,
  snapshotPages,
}: PreviewDocumentProps) {
  const { pages: measuredPages, blocks, onPrintMeasured } = useMeasuredPrintLayout(resolved)
  const pages = snapshotPages ?? measuredPages

  return (
    <>
      {!snapshotPages ? (
        <PrintMeasureSurface resolved={resolved} blocks={blocks} onMeasured={onPrintMeasured} />
      ) : null}
      <OfficialPrintDocument
        meta={resolved.meta}
        sections={sections}
        generalInstructions={setup.generalInstructions}
        composition={composition}
        resolved={resolved}
        pages={pages}
        layout="preview"
      />
    </>
  )
}

export function PaperPrintPreviewPage() {
  const { paperId } = useParams<{ paperId: string }>()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const documentRootRef = useRef<HTMLDivElement>(null)
  const from = searchParams.get('from')
  const autoExportFormat = parseExportFormatFromQuery(searchParams.get('export'))
  const printSnapshot = (location.state as PaperPrintPreviewLocationState | null)?.printSnapshot
  const { phase: remotePhase, data: remoteData } = usePaperPrintData(
    printSnapshot ? undefined : paperId,
  )
  const school = useSchoolBranding()

  const sessionData = useMemo(() => {
    if (!printSnapshot || !paperId) return null
    const sections = sectionsForSetup(printSnapshot.setup)
    const resolved = resolvePaper(
      printSnapshot.setup,
      sections,
      printSnapshot.composition,
      printSnapshot.instanceLayer,
      school,
    )
    return {
      setup: printSnapshot.setup,
      composition: printSnapshot.composition,
      resolved,
      sections,
      status: remoteData?.status ?? ('draft' as const),
    }
  }, [printSnapshot, paperId, remoteData?.status, school])

  const phase = printSnapshot ? 'ready' : remotePhase
  const data = sessionData ?? remoteData

  const handleExit = () => {
    if (from === 'editor' && paperId) {
      navigate(`/app/builder/${paperId}/editor`, {
        state: printSnapshot
          ? {
              setup: printSnapshot.setup,
              composition: printSnapshot.composition,
              instanceLayer: printSnapshot.instanceLayer,
            }
          : undefined,
      })
      return
    }
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
    ? 'Official examination preview. Export as PDF or Word, or print for distribution.'
    : `Screen preview only. ${EXPORT_UNAVAILABLE_MSG}`

  return (
    <PrintPreviewShell
      title={title}
      subtitle={subtitle}
      onExit={handleExit}
      setup={data.setup}
      resolved={data.resolved}
      canExport={isApproved}
      documentRootRef={documentRootRef}
      autoExportFormat={isApproved ? autoExportFormat : null}
    >
      {printSnapshot ? (
        <p className="pc-print-preview-session-tip">
          Live preview from the examination editor — matches your current formatting. Save in the
          editor to persist before sharing or printing.
        </p>
      ) : null}
      <PaperPrintPreviewDocument
        resolved={data.resolved}
        setup={data.setup}
        sections={data.sections}
        composition={data.composition}
        snapshotPages={printSnapshot?.pages}
      />
    </PrintPreviewShell>
  )
}
