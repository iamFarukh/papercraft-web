import { ChevronDown, FileDown, FileText, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { paperPrintPreviewPath } from '@/config/nav-routes'
import {
  EXPORT_UNAVAILABLE_MSG,
  exportFormatLabel,
  PAPER_EXPORT_FORMATS,
  type ExportProgress,
  type PaperExportFormat,
} from '@/lib/paper-export-formats'
import { runPaperExport } from '@/lib/paper-export'
import type { PaperSetupState } from '@/lib/paper-builder'
import type { ResolvedPaper } from '@/lib/paper-instance'

type Variant = 'chrome' | 'inline' | 'primary' | 'sm'

type BaseProps = {
  canExport: boolean
  variant?: Variant
  className?: string
}

type DirectProps = BaseProps & {
  mode: 'direct'
  setup: PaperSetupState
  documentRootRef: RefObject<HTMLElement | null>
  resolved: ResolvedPaper
  autoStartFormat?: PaperExportFormat | null
}

type NavigateProps = BaseProps & {
  mode: 'navigate'
  paperId: string
  from?: 'builder' | 'library' | 'approval' | 'editor'
}

type Props = DirectProps | NavigateProps

function formatIcon(format: PaperExportFormat) {
  return format === 'docx' ? (
    <FileText size={12} strokeWidth={1.6} />
  ) : (
    <FileDown size={12} strokeWidth={1.6} />
  )
}

export function PaperExportMenu(props: Props) {
  const { canExport, variant = 'sm', className = '' } = props
  const menuId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [busyFormat, setBusyFormat] = useState<PaperExportFormat | null>(null)
  const [statusLine, setStatusLine] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const autoRan = useRef(false)

  const btnClass =
    variant === 'chrome'
      ? 'pc-btn is-sm pc-print-chrome-export'
      : variant === 'primary'
        ? 'pc-btn is-primary is-sm'
        : 'pc-btn is-sm'

  const runDirectExport = useCallback(
    async (format: PaperExportFormat) => {
      if (props.mode !== 'direct' || !canExport) return
      const root = props.documentRootRef.current
      if (!root) return

      setOpen(false)
      setBusyFormat(format)
      setError(null)
      setStatusLine(`Preparing ${exportFormatLabel(format)}…`)

      const onProgress = (p: ExportProgress) => {
        if (p.message) setStatusLine(p.message)
        if (p.phase === 'error' && p.message) setError(p.message)
      }

      try {
        await runPaperExport(format, {
          setup: props.setup,
          resolved: props.resolved,
          documentRoot: root,
          onProgress,
        })
        setStatusLine(`${exportFormatLabel(format)} saved to your downloads.`)
        window.setTimeout(() => setStatusLine(null), 4000)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `The ${exportFormatLabel(format)} file could not be generated.`
        setError(message)
        setStatusLine(null)
      } finally {
        setBusyFormat(null)
      }
    },
    [canExport, props],
  )

  useEffect(() => {
    if (props.mode !== 'direct' || !props.autoStartFormat || !canExport || autoRan.current) {
      return
    }
    autoRan.current = true
    const t = window.setTimeout(
      () => void runDirectExport(props.autoStartFormat!),
      400,
    )
    return () => window.clearTimeout(t)
  }, [canExport, props, runDirectExport])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!canExport) {
    return (
      <span
        className={`pc-paper-export-wrap is-disabled${className ? ` ${className}` : ''}`}
        title={EXPORT_UNAVAILABLE_MSG}
      >
        <button type="button" className={btnClass} disabled>
          <FileDown size={12} strokeWidth={1.6} />
          Export
        </button>
      </span>
    )
  }

  const busy = busyFormat != null

  return (
    <div
      ref={wrapRef}
      className={`pc-paper-export-wrap${className ? ` ${className}` : ''}`}
    >
      <div className="pc-paper-export-trigger">
        <button
          type="button"
          className={`${btnClass} pc-paper-export-main`}
          disabled={busy}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((v) => !v)}
        >
          {busy ? (
            <Loader2 size={12} strokeWidth={1.6} className="pc-spin" />
          ) : (
            <FileDown size={12} strokeWidth={1.6} />
          )}
          Export
          <ChevronDown size={11} strokeWidth={1.6} aria-hidden />
        </button>
        {open ? (
          <ul id={menuId} className="pc-paper-export-menu" role="menu">
            {PAPER_EXPORT_FORMATS.map((fmt) => (
              <li key={fmt.id} role="none">
                {props.mode === 'direct' ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="pc-paper-export-item"
                    disabled={busy}
                    title={fmt.hint}
                    onClick={() => void runDirectExport(fmt.id)}
                  >
                    {formatIcon(fmt.id)}
                    <span className="pc-paper-export-item-label">{fmt.label}</span>
                  </button>
                ) : (
                  <Link
                    role="menuitem"
                    className="pc-paper-export-item"
                    title={fmt.hint}
                    to={`${paperPrintPreviewPath(props.paperId, props.from)}&export=${fmt.id}`}
                    onClick={() => setOpen(false)}
                  >
                    {formatIcon(fmt.id)}
                    <span className="pc-paper-export-item-label">{fmt.label}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {busy && statusLine ? (
        <p className="pc-paper-export-status" role="status">
          {statusLine}
        </p>
      ) : null}
      {!busy && statusLine ? (
        <p className="pc-paper-export-status is-success" role="status">
          {statusLine}
        </p>
      ) : null}
      {error ? (
        <p className="pc-paper-export-status is-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
