import type { PaperSectionDef } from '@/lib/paper-builder'
import type { PaginateContext, PrintBlock, PrintPageModel } from '@/lib/paper-print-layout'

const BLOCK_GAP = 0
/** Fallbacks when the chrome probes are unavailable (kept close to real render). */
const CONTINUED_BANNER_HEIGHT = 28
const END_MARK_HEIGHT = 54
/** Rounding slack for sub-pixel drift between measure column and page body. */
const ROUNDING_BUFFER = 4

export type MeasuredBodyBudgets = {
  page1: number
  continued: number
}

/** Heights of page chrome rendered inside the body (not part of the block list). */
export type MeasuredChromeHeights = {
  continuedBanner: number
  endMark: number
}

export type MeasuredPrintLayout = {
  pages: PrintPageModel[]
  blockHeights: number[]
  source: 'measured' | 'estimated'
}

/** Measure each `.pc-print-measure-block` in document order (print renderer only). */
export function measurePrintBlockHeights(root: HTMLElement): number[] {
  const nodes = root.querySelectorAll<HTMLElement>('[data-measure-block]')
  return Array.from(nodes).map((el) => {
    const style = window.getComputedStyle(el)
    const mt = parseFloat(style.marginTop) || 0
    const mb = parseFloat(style.marginBottom) || 0
    const rect = el.getBoundingClientRect()
    return Math.ceil(rect.height + mt + mb)
  })
}

/** Read `.pc-print-page-body` height from hidden probe pages (matches real preview chrome). */
export function measureProbeBodyBudgets(root: HTMLElement): MeasuredBodyBudgets | null {
  const read = (probe: string): number | null => {
    const page = root.querySelector<HTMLElement>(`[data-measure-probe="${probe}"]`)
    const body = page?.querySelector<HTMLElement>('[data-measure-body-probe]')
    if (!body) return null
    const h = body.clientHeight
    return h > 80 ? Math.floor(h) : null
  }
  const page1 = read('full')
  const continued = read('continued')
  if (page1 == null || continued == null) return null
  return { page1, continued }
}

/** Measure in-body chrome (continued banner, end-of-paper mark) from the probes. */
export function measureChromeHeights(root: HTMLElement): MeasuredChromeHeights | null {
  const read = (kind: string): number | null => {
    const el = root.querySelector<HTMLElement>(`[data-measure-chrome="${kind}"]`)
    if (!el) return null
    const style = window.getComputedStyle(el)
    const mt = parseFloat(style.marginTop) || 0
    const mb = parseFloat(style.marginBottom) || 0
    const h = Math.ceil(el.getBoundingClientRect().height + mt + mb)
    return h > 0 ? h : null
  }
  const continuedBanner = read('banner')
  const endMark = read('endmark')
  if (continuedBanner == null || endMark == null) return null
  return { continuedBanner, endMark }
}

function bodyBudget(
  pageIndex: number,
  ctx: PaginateContext,
  continued: boolean,
  probe?: MeasuredBodyBudgets,
  chrome?: MeasuredChromeHeights,
): number {
  const base =
    probe != null
      ? pageIndex === 0
        ? probe.page1
        : probe.continued
      : ctx.bodyHeightForPage(pageIndex)
  let budget = base - ROUNDING_BUFFER
  if (continued) budget -= chrome?.continuedBanner ?? CONTINUED_BANNER_HEIGHT
  return Math.max(120, budget)
}

function measuredSectionIntroPrefixHeight(
  blocks: PrintBlock[],
  heights: number[],
  startIdx: number,
): number {
  const head = blocks[startIdx]
  if (head?.kind !== 'section-head') return 0

  const sectionId = head.section.id
  let total = 0

  for (let i = startIdx; i < blocks.length; i++) {
    const block = blocks[i]!
    const h = heights[i] ?? 32

    if (block.kind === 'section-head' && block.section.id === sectionId) {
      total += h + (total > 0 ? BLOCK_GAP : 0)
    } else if (block.kind === 'section-instructions' && block.section.id === sectionId) {
      total += h + BLOCK_GAP
    } else {
      break
    }
  }

  return total
}

function measuredSectionIntroPackHeight(
  blocks: PrintBlock[],
  heights: number[],
  startIdx: number,
): number {
  const head = blocks[startIdx]
  if (head?.kind !== 'section-head') return 0

  const sectionId = head.section.id
  let total = 0

  for (let i = startIdx; i < blocks.length; i++) {
    const block = blocks[i]!
    const h = heights[i] ?? 32

    if (block.kind === 'section-head' && block.section.id === sectionId) {
      total += h + (total > 0 ? BLOCK_GAP : 0)
    } else if (block.kind === 'section-instructions' && block.section.id === sectionId) {
      total += h + BLOCK_GAP
    } else if (block.kind === 'question' && block.section.id === sectionId) {
      total += h + BLOCK_GAP
      break
    } else {
      break
    }
  }

  return total
}

function recomputeContinuedSections(pages: PrintPageModel[]): PrintPageModel[] {
  return pages.map((page, index) => {
    if (index === 0) {
      return { ...page, continuedSection: undefined }
    }
    const prev = pages[index - 1]
    const first = page.blocks[0]
    const lastPrev = prev?.blocks[prev.blocks.length - 1]
    if (
      first?.kind === 'question' &&
      lastPrev?.kind === 'question' &&
      lastPrev.section.id === first.section.id
    ) {
      return { ...page, continuedSection: first.section }
    }
    return { ...page, continuedSection: undefined }
  })
}

/**
 * Paginate using DOM-measured block heights from the print preview renderer.
 * This is the source of truth for editor + official preview alignment.
 */
export function paginateMeasuredBlocks(
  blocks: PrintBlock[],
  blockHeights: number[],
  ctx: PaginateContext,
  probeBudgets?: MeasuredBodyBudgets,
  chrome?: MeasuredChromeHeights,
): PrintPageModel[] {
  if (blocks.length === 0) {
    return [{ pageIndex: 0, blocks: [], headerMode: 'full' }]
  }

  if (blockHeights.length !== blocks.length) {
    return [{ pageIndex: 0, blocks: [], headerMode: 'full' }]
  }

  const endMarkHeight = chrome?.endMark ?? END_MARK_HEIGHT

  const pages: PrintPageModel[] = []
  let pageBlocks: PrintBlock[] = []
  let pageIndex = 0
  let blockIndex = 0
  let continuedOnThisPage: PaperSectionDef | undefined
  let continuedOnNextPage: PaperSectionDef | undefined

  let remaining = bodyBudget(0, ctx, false, probeBudgets, chrome)

  const flush = () => {
    pages.push({
      pageIndex,
      blocks: pageBlocks,
      headerMode: pageIndex === 0 ? 'full' : 'compact',
      continuedSection: continuedOnThisPage,
    })
    continuedOnThisPage = continuedOnNextPage
    continuedOnNextPage = undefined
    pageIndex += 1
    pageBlocks = []
    remaining = bodyBudget(pageIndex, ctx, !!continuedOnThisPage, probeBudgets, chrome)
  }

  while (blockIndex < blocks.length) {
    const block = blocks[blockIndex]!
    const isLastBlock = blockIndex === blocks.length - 1
    const height = blockHeights[blockIndex]!
    const gap = pageBlocks.length > 0 ? BLOCK_GAP : 0
    // The final page also renders the end-of-paper mark inside the body —
    // reserve room for it so the last question is never pushed into overflow.
    const needed = height + gap + (isLastBlock ? endMarkHeight : 0)

    if (block.kind === 'section-head' && pageBlocks.length > 0) {
      const prefixH = measuredSectionIntroPrefixHeight(blocks, blockHeights, blockIndex)
      const packH = measuredSectionIntroPackHeight(blocks, blockHeights, blockIndex)
      const minStart = prefixH > 0 ? prefixH : packH
      if (minStart > 0 && minStart + BLOCK_GAP > remaining) {
        flush()
        continue
      }
    }

    if (pageBlocks.length > 0 && needed > remaining) {
      if (block.kind === 'question') {
        continuedOnNextPage = block.section
      }
      flush()
      continue
    }

    if (pageBlocks.length === 0 && height > remaining) {
      pageBlocks.push(block)
      blockIndex += 1
      remaining -= height
      flush()
      continue
    }

    pageBlocks.push(block)
    blockIndex += 1
    remaining -= needed
  }

  if (pageBlocks.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex,
      blocks: pageBlocks,
      headerMode: pageIndex === 0 ? 'full' : 'compact',
      continuedSection: continuedOnThisPage,
    })
  }

  return recomputeContinuedSections(pages).map((page, index) => ({
    ...page,
    pageIndex: index,
  }))
}
