import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import { configToCssVars } from '@/lib/paper-format-config'
import { printSettingsClassName, type ResolvedPaper } from '@/lib/paper-instance'
import { resolveHeaderFields, resolvePageHeader } from '@/lib/paper-print-header'
import {
  buildPrintBlocksFromResolved,
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
  type PrintBlock,
} from '@/lib/paper-print-layout'
import {
  measureChromeHeights,
  measurePrintBlockHeights,
  measureProbeBodyBudgets,
  type MeasuredBodyBudgets,
  type MeasuredChromeHeights,
} from '@/lib/paper-print-measure'
import { PrintBlockContent } from './PrintBlockContent'
import { PrintPageFooter } from './PrintPageFooter'
import { PrintPageHeader } from './PrintPageHeader'

export type PrintMeasureResult = {
  blockHeights: number[]
  bodyBudgets: MeasuredBodyBudgets | null
  chrome: MeasuredChromeHeights | null
}

type Props = {
  resolved: ResolvedPaper
  blocks: PrintBlock[]
  onMeasured: (result: PrintMeasureResult) => void
}

/**
 * Hidden print renderer — measures final output heights (not editable chrome).
 * Same components + CSS as official preview / PDF.
 */
export function PrintMeasureSurface({ resolved, blocks, onMeasured }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const printClass = printSettingsClassName(resolved.printSettings)
  const formatVars = configToCssVars(resolved.formatConfig)
  const headerFields = resolveHeaderFields(resolved.presentation)
  const continuedHeader = resolvePageHeader(
    { pageIndex: 1, blocks: [], headerMode: 'compact' },
    resolved.presentation,
    resolved.formatConfig,
  )

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || blocks.length === 0) return

    let cancelled = false
    let attempts = 0
    const MAX_ATTEMPTS = 8

    const run = () => {
      if (cancelled || !rootRef.current) return
      const blockHeights = measurePrintBlockHeights(rootRef.current)
      // The measure column may not have committed all blocks yet (fonts, async
      // layout). Retry a bounded number of frames before giving up so we never
      // silently stay on the estimated layout.
      if (blockHeights.length !== blocks.length) {
        attempts += 1
        if (attempts < MAX_ATTEMPTS) {
          requestAnimationFrame(run)
        } else if (import.meta.env?.DEV) {
          console.warn(
            `[PrintMeasureSurface] measured ${blockHeights.length} blocks, expected ${blocks.length}; keeping estimated layout.`,
          )
        }
        return
      }
      onMeasured({
        blockHeights,
        bodyBudgets: measureProbeBodyBudgets(rootRef.current),
        chrome: measureChromeHeights(rootRef.current),
      })
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })

    // Web fonts (Newsreader / Devanagari) change line wrapping after the first
    // measure — re-measure once they settle so pagination stays exact.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (!cancelled) {
          attempts = 0
          requestAnimationFrame(run)
        }
      })
    }

    return () => {
      cancelled = true
    }
  }, [blocks, onMeasured, resolved.formatConfig, resolved.printSettings, resolved.presentation])

  return (
    <div
      ref={rootRef}
      className={`pc-print-measure-root${printClass ? ` ${printClass}` : ''}`}
      aria-hidden
    >
      {/* Probe pages — same grid chrome as official preview for body height budget */}
      <article
        className="pc-print-page pc-print-measure-probe"
        data-measure-probe="full"
        style={
          {
            ...formatVars,
            '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
            '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
          } as CSSProperties
        }
      >
        <PrintPageHeader meta={resolved.meta} mode="full" fields={headerFields} />
        <div className="pc-print-page-body" data-measure-body-probe />
        <PrintPageFooter meta={resolved.meta} pageNumber={1} pageCount={2} />
      </article>

      <article
        className="pc-print-page pc-print-measure-probe"
        data-measure-probe="continued"
        style={
          {
            ...formatVars,
            '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
            '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
          } as CSSProperties
        }
      >
        {continuedHeader.show ? (
          <PrintPageHeader
            meta={resolved.meta}
            mode={continuedHeader.mode}
            fields={headerFields}
          />
        ) : null}
        <div className="pc-print-page-body" data-measure-body-probe />
        <PrintPageFooter meta={resolved.meta} pageNumber={2} pageCount={2} />
      </article>

      <div
        className="pc-print-measure-column pc-print-doc"
        style={
          {
            ...formatVars,
            '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
          } as CSSProperties
        }
      >
        {blocks.map((block, index) => (
          <div key={`${block.kind}-${index}`} className="pc-print-measure-block" data-measure-block>
            <PrintBlockContent
              block={block}
              medium={resolved.meta.medium}
              marksDisplay={resolved.printSettings.marksDisplay}
            />
          </div>
        ))}
        {/* In-body chrome probes — pagination reserves these real heights. */}
        <p className="pc-print-continued-banner" data-measure-chrome="banner">
          Continued · Section A
          <span className="pc-print-continued-banner-sub"> · Sample</span>
        </p>
        <p className="pc-print-end-mark pc-serif" data-measure-chrome="endmark">
          — end of paper · all the best —
        </p>
      </div>
    </div>
  )
}

/** Build blocks list for measurement (shared entry). */
export function blocksForMeasure(resolved: ResolvedPaper): PrintBlock[] {
  return buildPrintBlocksFromResolved(resolved)
}
