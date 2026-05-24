import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ResolvedPaper } from '@/lib/paper-instance'
import {
  buildPrintBlocksFromResolved,
  buildPrintPagesFromResolved,
  computePaginateContext,
  type PrintBlock,
  type PrintPageModel,
} from '@/lib/paper-print-layout'
import {
  paginateMeasuredBlocks,
  type MeasuredBodyBudgets,
  type MeasuredPrintLayout,
} from '@/lib/paper-print-measure'
import type { PrintMeasureResult } from '@/components/print/PrintMeasureSurface'

export type UseMeasuredPrintLayoutResult = {
  blocks: PrintBlock[]
  pages: PrintPageModel[]
  pageCount: number
  layoutSource: 'measured' | 'estimated'
  isLayoutReady: boolean
  onPrintMeasured: (result: PrintMeasureResult) => void
}

/**
 * Print layout driven by the hidden preview renderer (DOM measurement).
 * Falls back to heuristic pagination until the first measure completes.
 */
export function useMeasuredPrintLayout(resolved: ResolvedPaper): UseMeasuredPrintLayoutResult {
  const blocks = useMemo(() => buildPrintBlocksFromResolved(resolved), [resolved])
  const ctx = useMemo(
    () => computePaginateContext(resolved.presentation, resolved.formatConfig),
    [resolved.presentation, resolved.formatConfig],
  )

  const [measuredHeights, setMeasuredHeights] = useState<number[] | null>(null)
  const [probeBudgets, setProbeBudgets] = useState<MeasuredBodyBudgets | null>(null)

  const measureKey = useMemo(
    () =>
      blocks
        .map((b) => {
          if (b.kind === 'question') return `q:${b.question.id}`
          if (b.kind === 'section-head' || b.kind === 'section-instructions') {
            return `s:${b.section.id}:${b.kind}`
          }
          return b.kind
        })
        .join('|'),
    [blocks],
  )

  useEffect(() => {
    setMeasuredHeights(null)
    setProbeBudgets(null)
  }, [measureKey, ctx.bodyHeightPage1, ctx.bodyHeightContinued])

  const layout: MeasuredPrintLayout = useMemo(() => {
    if (measuredHeights && measuredHeights.length === blocks.length) {
      return {
        pages: paginateMeasuredBlocks(blocks, measuredHeights, ctx, probeBudgets ?? undefined),
        blockHeights: measuredHeights,
        source: 'measured',
      }
    }
    return {
      pages: buildPrintPagesFromResolved(resolved),
      blockHeights: [],
      source: 'estimated',
    }
  }, [blocks, measuredHeights, probeBudgets, ctx, resolved])

  const onPrintMeasured = useCallback(
    (result: PrintMeasureResult) => {
      if (result.blockHeights.length !== blocks.length) return
      setMeasuredHeights((prev) => {
        if (
          prev &&
          prev.length === result.blockHeights.length &&
          prev.every((v, i) => v === result.blockHeights[i])
        ) {
          return prev
        }
        return result.blockHeights
      })
      setProbeBudgets((prev) => {
        const next = result.bodyBudgets
        if (!next) return prev
        if (prev && prev.page1 === next.page1 && prev.continued === next.continued) return prev
        return next
      })
    },
    [blocks.length],
  )

  return {
    blocks,
    pages: layout.pages,
    pageCount: layout.pages.length,
    layoutSource: layout.source,
    isLayoutReady: layout.source === 'measured',
    onPrintMeasured,
  }
}
