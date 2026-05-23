import { FileDown, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { PaperSetupState } from '@/lib/paper-builder'
import {
  exportOfficialPrintToPdf,
  PDF_EXPORT_UNAVAILABLE_MSG,
  pdfFilenameFromSetup,
  type PdfExportProgress,
} from '@/lib/paper-pdf-export'

type Variant = 'chrome' | 'inline' | 'primary'

type Props = {
  setup: PaperSetupState
  canExport: boolean
  documentRootRef: RefObject<HTMLElement | null>
  variant?: Variant
  autoStart?: boolean
  className?: string
}

export function ExportPdfButton({
  setup,
  canExport,
  documentRootRef,
  variant = 'chrome',
  autoStart = false,
  className = '',
}: Props) {
  const [busy, setBusy] = useState(false)
  const [statusLine, setStatusLine] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoRan = useRef(false)

  const runExport = useCallback(async () => {
    const root = documentRootRef.current
    if (!root || !canExport) return

    setBusy(true)
    setError(null)
    setStatusLine('Preparing examination PDF…')

    const onProgress = (p: PdfExportProgress) => {
      if (p.message) setStatusLine(p.message)
      if (p.phase === 'error' && p.message) setError(p.message)
    }

    try {
      await exportOfficialPrintToPdf(
        root,
        pdfFilenameFromSetup(setup),
        onProgress,
      )
      setStatusLine('PDF saved to your downloads.')
      window.setTimeout(() => setStatusLine(null), 4000)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'The examination PDF could not be generated. Try again from official preview.'
      setError(message)
      setStatusLine(null)
    } finally {
      setBusy(false)
    }
  }, [canExport, documentRootRef, setup])

  useEffect(() => {
    if (!autoStart || !canExport || autoRan.current) return
    autoRan.current = true
    const t = window.setTimeout(() => void runExport(), 400)
    return () => window.clearTimeout(t)
  }, [autoStart, canExport, runExport])

  const disabled = !canExport || busy
  const title = !canExport ? PDF_EXPORT_UNAVAILABLE_MSG : 'Download official examination PDF'

  const btnClass =
    variant === 'chrome'
      ? 'pc-btn is-sm pc-print-chrome-export'
      : variant === 'primary'
        ? 'pc-btn is-primary is-sm'
        : 'pc-btn is-sm'

  return (
    <div className={`pc-pdf-export-wrap${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={btnClass}
        disabled={disabled}
        title={title}
        aria-busy={busy}
        onClick={() => void runExport()}
      >
        {busy ? (
          <Loader2 size={12} strokeWidth={1.6} className="pc-spin" />
        ) : (
          <FileDown size={12} strokeWidth={1.6} />
        )}
        Export PDF
      </button>
      {busy && statusLine ? (
        <p className="pc-pdf-export-status" role="status">
          {statusLine}
        </p>
      ) : null}
      {!busy && statusLine ? (
        <p className="pc-pdf-export-status is-success" role="status">
          {statusLine}
        </p>
      ) : null}
      {error ? (
        <p className="pc-pdf-export-status is-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/** Disabled export control with institutional tooltip (draft / submitted). */
export function ExportPdfDisabledHint({ className = '' }: { className?: string }) {
  return (
    <span className={`pc-pdf-export-disabled${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="pc-btn is-sm"
        disabled
        title={PDF_EXPORT_UNAVAILABLE_MSG}
      >
        <FileDown size={12} strokeWidth={1.6} />
        Export PDF
      </button>
    </span>
  )
}
