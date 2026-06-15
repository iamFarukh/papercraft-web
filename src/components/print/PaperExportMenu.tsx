import { ChevronDown, FileDown, FileText, KeyRound, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { paperPrintPreviewPath } from '@/config/nav-routes'
import {
  EXPORT_UNAVAILABLE_MSG,
  exportFormatLabel,
  PAPER_EXPORT_FORMATS,
  type ExportProgress,
  type PaperExportFormat,
  type PaperExportKind,
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
  autoStartKind?: PaperExportKind
}

type NavigateProps = BaseProps & {
  mode: 'navigate'
  paperId: string
  from?: 'builder' | 'library' | 'approval' | 'editor'
}

type Props = DirectProps | NavigateProps

type ExportAction = { format: PaperExportFormat; kind: PaperExportKind }

const EXPORT_GROUPS: { kind: PaperExportKind; label: string }[] = [
  { kind: 'paper', label: 'Question paper' },
  { kind: 'answer-key', label: 'Answer key' },
]

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
  const [busyAction, setBusyAction] = useState<ExportAction | null>(null)
  const [lastFailed, setLastFailed] = useState<ExportAction | null>(null)
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
    async (format: PaperExportFormat, kind: PaperExportKind) => {
      if (props.mode !== 'direct' || !canExport) return
      const root = props.documentRootRef.current
      if (!root) return

      const action: ExportAction = { format, kind }
      const noun = kind === 'answer-key' ? 'answer key' : exportFormatLabel(format)
      setOpen(false)
      setBusyAction(action)
      setError(null)
      setLastFailed(null)
      setStatusLine(`Preparing ${noun}…`)

      const onProgress = (p: ExportProgress) => {
        if (p.message) setStatusLine(p.message)
        if (p.phase === 'error' && p.message) setError(p.message)
      }

      try {
        await runPaperExport(format, {
          setup: props.setup,
          resolved: props.resolved,
          documentRoot: root,
          kind,
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
        setLastFailed(action)
        setStatusLine(null)
      } finally {
        setBusyAction(null)
      }
    },
    [canExport, props],
  )

  useEffect(() => {
    if (props.mode !== 'direct' || !props.autoStartFormat || !canExport || autoRan.current) {
      return
    }
    autoRan.current = true
    const fmt = props.autoStartFormat
    const kind = props.autoStartKind ?? 'paper'
    const t = window.setTimeout(() => void runDirectExport(fmt, kind), 400)
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

  const busy = busyAction != null

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
          <div id={menuId} className="pc-paper-export-menu" role="menu">
            {EXPORT_GROUPS.map((group) => (
              <div key={group.kind} className="pc-paper-export-group" role="none">
                <span className="pc-paper-export-group-label" aria-hidden>
                  {group.kind === 'answer-key' ? (
                    <KeyRound size={11} strokeWidth={1.6} />
                  ) : null}
                  {group.label}
                </span>
                {PAPER_EXPORT_FORMATS.map((fmt) =>
                  props.mode === 'direct' ? (
                    <button
                      key={`${group.kind}:${fmt.id}`}
                      type="button"
                      role="menuitem"
                      className="pc-paper-export-item"
                      disabled={busy}
                      title={fmt.hint}
                      onClick={() => void runDirectExport(fmt.id, group.kind)}
                    >
                      {formatIcon(fmt.id)}
                      <span className="pc-paper-export-item-label">{fmt.label}</span>
                    </button>
                  ) : (
                    <Link
                      key={`${group.kind}:${fmt.id}`}
                      role="menuitem"
                      className="pc-paper-export-item"
                      title={fmt.hint}
                      to={`${paperPrintPreviewPath(props.paperId, props.from)}&export=${fmt.id}${group.kind === 'answer-key' ? '&kind=answer-key' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      {formatIcon(fmt.id)}
                      <span className="pc-paper-export-item-label">{fmt.label}</span>
                    </Link>
                  ),
                )}
              </div>
            ))}
          </div>
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
        <div className="pc-paper-export-status is-error" role="alert">
          <p>{error}</p>
          {props.mode === 'direct' && lastFailed ? (
            <button
              type="button"
              className="pc-btn is-sm"
              onClick={() => void runDirectExport(lastFailed.format, lastFailed.kind)}
            >
              Retry export
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
