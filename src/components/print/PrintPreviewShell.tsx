import { Eye, Printer, X } from 'lucide-react'
import { useCallback, useEffect, type ReactNode, type RefObject } from 'react'
import type { PaperSetupState } from '@/lib/paper-builder'
import { ExportPdfButton, ExportPdfDisabledHint } from '@/components/print/ExportPdfButton'

type Props = {
  title: string
  subtitle?: string
  onExit: () => void
  children: ReactNode
  setup?: PaperSetupState
  canExportPdf?: boolean
  documentRootRef?: RefObject<HTMLElement | null>
  autoExportPdf?: boolean
}

export function PrintPreviewShell({
  title,
  subtitle,
  onExit,
  children,
  setup,
  canExportPdf = false,
  documentRootRef,
  autoExportPdf = false,
}: Props) {
  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('pc-print-active')
    const previousTitle = document.title
    document.title = title

    return () => {
      document.documentElement.classList.remove('pc-print-active')
      document.title = previousTitle
    }
  }, [title])

  return (
    <div className="pc-print-preview-root">
      <header className="pc-print-chrome">
        <Eye size={14} strokeWidth={1.6} className="pc-print-chrome-icon" />
        <div className="pc-print-chrome-text">
          <span className="pc-print-chrome-title">Print preview</span>
          <span className="pc-print-chrome-sub">
            {subtitle ?? 'This is how the examination paper will print.'}
          </span>
        </div>
        <span className="pc-print-chrome-paper pc-serif">{title}</span>
        <div className="pc-print-chrome-actions">
          {setup && documentRootRef && canExportPdf ? (
            <ExportPdfButton
              setup={setup}
              canExport
              documentRootRef={documentRootRef}
              variant="chrome"
              autoStart={autoExportPdf}
            />
          ) : setup ? (
            <ExportPdfDisabledHint />
          ) : null}
          <button type="button" className="pc-btn is-sm pc-print-chrome-print" onClick={handlePrint}>
            <Printer size={12} strokeWidth={1.6} />
            Print
          </button>
          <button type="button" className="pc-btn is-sm pc-print-chrome-exit" onClick={onExit}>
            <X size={12} strokeWidth={1.6} />
            Exit preview
          </button>
        </div>
      </header>
      <p className="pc-print-preview-tip">
        {canExportPdf ? (
          <>
            <strong>Official export:</strong> Use <strong>Export PDF</strong> for the
            examination document file. For paper copies, use <strong>Print</strong> and turn off{' '}
            <strong>Headers and footers</strong> in the dialog.
          </>
        ) : (
          <>
            <strong>Preview only.</strong> PDF export unlocks after approval. To print a draft,
            use <strong>Print</strong> and disable browser headers and footers.
          </>
        )}
      </p>
      <div className="pc-print-preview-viewport pc-scroll" ref={documentRootRef}>
        {children}
      </div>
    </div>
  )
}
