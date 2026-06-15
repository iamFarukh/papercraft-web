import {
  buildGlobalQuestionNumbers,
  computeSectionSummary,
  type PaperComposition,
  type PaperMeta,
  type PaperSectionDef,
} from '@/lib/paper-builder'
import { questionDisplayText, type PaperMedium } from '@/lib/paper-medium'
import { resolvePageHeader } from '@/lib/paper-print-header'
import type { ResolvedPaper, ResolvedSection } from '@/lib/paper-instance'
import type { PaperFormatConfig, PaperPresentation, PaperSpacingMode } from '@/types/paper-instance'
import type { QuestionRecord } from '@/types/question'

/** A4 content area at 72dpi (matches screen preview). */
export const PRINT_PAGE_WIDTH_PX = 595
export const PRINT_PAGE_HEIGHT_PX = 842

const BLOCK_GAP = 2
const MM_TO_PX = 3.7795275591
const FOOTER_RESERVE_PX = 40

/** Placement pass — break pages (slightly conservative). */
const PLACEMENT_FACTOR = 0.90
/** Render pass — never assign more than fits on screen (slightly optimistic). */
const RENDER_FACTOR = 0.90
/** Only pull blocks back when a page is clearly under-filled. */
const BALANCE_UNDERFILL_RATIO = 0.62

/** Reference school name size (pt) for scaling header block height estimates. */
const HEADER_STANDARD_SCHOOL_PT = 14
const FULL_HEADER_HEIGHT = 132
const COMPACT_HEADER_HEIGHT = 48

export type SectionPrintSummary = {
  questionCount: number
  totalMarks: number
  estimatedMinutes: number
}

export type QuestionBlockLayout = {
  marginTopMm: number
  marginBottomMm: number
  fontSizePt: number
}

export type PrintBlock =
  | { kind: 'instructions'; generalInstructions?: string; sectionCount: number }
  | {
      kind: 'section-head'
      section: PaperSectionDef
      summary: SectionPrintSummary
      displayTitle?: string
      marginTopMm?: number
      marginBottomMm?: number
      fontSizePt?: number
    }
  | {
      kind: 'section-instructions'
      section: PaperSectionDef
      displayText?: string
    }
    | {
      kind: 'question'
      section: PaperSectionDef
      question: QuestionRecord
      number: number
      showNumber?: boolean
      displayMarks?: number
      localInstructions?: string
      spacingMode?: PaperSpacingMode
      layout?: QuestionBlockLayout
      medium?: PaperMedium
    }

export type PrintPageModel = {
  pageIndex: number
  blocks: PrintBlock[]
  headerMode: 'full' | 'compact'
  continuedSection?: PaperSectionDef
}

export type PaginateContext = {
  bodyHeightPage1: number
  bodyHeightContinued: number
  /** Per-page body budget when header repeat mode differs by page index. */
  bodyHeightForPage: (pageIndex: number) => number
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function headerHeightForPreset(formatConfig: PaperFormatConfig, mode: 'full' | 'compact'): number {
  const base = mode === 'full' ? FULL_HEADER_HEIGHT : COMPACT_HEADER_HEIGHT
  const scale = formatConfig.header.schoolName / HEADER_STANDARD_SCHOOL_PT
  return Math.round(base * clamp(scale, 0.72, 1.35))
}

export function bodyBudgetForPageIndex(
  pageIndex: number,
  presentation: PaperPresentation,
  formatConfig: PaperFormatConfig,
): number {
  const padTop = formatConfig.pageMargins.top * MM_TO_PX
  const padBottom = formatConfig.pageMargins.bottom * MM_TO_PX
  let body = PRINT_PAGE_HEIGHT_PX - padTop - padBottom - FOOTER_RESERVE_PX

  const header = resolvePageHeader(
    {
      pageIndex,
      blocks: [],
      headerMode: pageIndex === 0 ? 'full' : 'compact',
    },
    presentation,
    formatConfig,
  )
  if (header.show) {
    body -= headerHeightForPreset(
      formatConfig,
      header.mode === 'full' ? 'full' : 'compact',
    )
  }
  return Math.floor(body)
}

export function computePaginateContext(
  presentation: PaperPresentation,
  formatConfig: PaperFormatConfig,
): PaginateContext {
  const bodyHeightPage1 = bodyBudgetForPageIndex(0, presentation, formatConfig)
  const bodyHeightContinued = bodyBudgetForPageIndex(1, presentation, formatConfig)
  return {
    bodyHeightPage1,
    bodyHeightContinued,
    bodyHeightForPage: (pageIndex) => bodyBudgetForPageIndex(pageIndex, presentation, formatConfig),
  }
}

/** @deprecated use computePaginateContext */
export const PRINT_BODY_HEIGHT_PAGE1 = 520
/** @deprecated use computePaginateContext */
export const PRINT_BODY_HEIGHT_CONTINUED = 600

function estimateLinesForText(text: string): number {
  return text.split('\n').reduce((acc, line) => {
    const lineLen = line.trim().length
    if (lineLen === 0) return acc + 1
    const hasDevanagari = /[\u0900-\u097F]/.test(line)
    const charsPerLine = hasDevanagari ? 50 : 72
    return acc + Math.max(1, Math.ceil(lineLen / charsPerLine))
  }, 0)
}

function estimateInstructionsHeight(
  generalInstructions: string | undefined,
  sectionCount: number,
): number {
  const text = generalInstructions?.trim()
  if (text) {
    const lines = estimateLinesForText(text)
    return 28 + lines * 17
  }
  return 56 + (sectionCount > 2 ? 6 : 0)
}

function estimateSectionHeadHeight(block: Extract<PrintBlock, { kind: 'section-head' }>): number {
  const top = (block.marginTopMm ?? 6) * MM_TO_PX
  const bottom = (block.marginBottomMm ?? 2) * MM_TO_PX
  return 26 + top + bottom
}

function estimateSectionInstructionsHeight(text: string): number {
  const lines = estimateLinesForText(text)
  return 4 + lines * 14
}

function estimateQuestionHeight(block: Extract<PrintBlock, { kind: 'question' }>): number {
  const { question, localInstructions, layout, medium = 'english' } = block
  const text = questionDisplayText(question, medium)
  const fontPt = layout?.fontSizePt ?? 10
  const linePx = Math.max(14, fontPt * 1.28 * (96 / 72))

  const bodyLines = estimateLinesForText(text)

  let h = 8 + bodyLines * linePx * 1.12

  const isMcq = question.typeRaw === 'mcq' || question.type === 'MCQ'
  if (isMcq) {
    const options =
      medium === 'hindi' && question.mcqOptionsHi
        ? question.mcqOptionsHi
        : question.mcqOptions
    if (options) {
      const count = (['a', 'b', 'c', 'd'] as const).filter((k) => options[k]?.trim()).length
      const rows = Math.ceil(count / 2)
      h += 4 + rows * (linePx * 0.95)
    }
  }

  if (localInstructions?.trim()) {
    h += 8 + estimateLinesForText(localInstructions) * 12
  }

  const marginTop = (layout?.marginTopMm ?? 2) * MM_TO_PX
  const marginBottom = (layout?.marginBottomMm ?? 0) * MM_TO_PX
  h += marginTop + marginBottom

  return Math.max(30, Math.ceil(h))
}

function estimateBlockHeightRaw(block: PrintBlock): number {
  switch (block.kind) {
    case 'instructions':
      return estimateInstructionsHeight(block.generalInstructions, block.sectionCount)
    case 'section-head':
      return estimateSectionHeadHeight(block)
    case 'section-instructions':
      return estimateSectionInstructionsHeight(
        block.displayText ?? block.section.instructions,
      )
    case 'question':
      return estimateQuestionHeight(block)
    default:
      return 40
  }
}

function estimatePlacementHeight(block: PrintBlock): number {
  return Math.max(10, Math.ceil(estimateBlockHeightRaw(block) * PLACEMENT_FACTOR))
}

function estimateRenderHeight(block: PrintBlock): number {
  return Math.max(10, Math.ceil(estimateBlockHeightRaw(block) * RENDER_FACTOR))
}

/** @deprecated use estimatePlacementHeight internally */
export function estimateBlockHeight(block: PrintBlock): number {
  return estimatePlacementHeight(block)
}

function pageBlocksHeight(
  blocks: PrintBlock[],
  heightFn: (b: PrintBlock) => number = estimatePlacementHeight,
): number {
  return blocks.reduce((sum, block, index) => {
    const gap = index > 0 ? BLOCK_GAP : 0
    return sum + gap + heightFn(block)
  }, 0)
}

/** Section head + instructions only (first question may continue on next page). */
function sectionIntroPrefixHeight(queue: PrintBlock[]): number {
  if (queue[0]?.kind !== 'section-head') return 0

  const sectionId = queue[0].section.id
  let total = 0
  let count = 0

  for (const block of queue) {
    if (block.kind === 'section-head' && block.section.id === sectionId) {
      total += estimatePlacementHeight(block) + (count > 0 ? BLOCK_GAP : 0)
      count += 1
    } else if (block.kind === 'section-instructions' && block.section.id === sectionId) {
      total += estimatePlacementHeight(block) + BLOCK_GAP
      count += 1
    } else {
      break
    }
  }

  return total
}

/** Head + instructions + first question — prefer keeping together when starting a section. */
function sectionIntroPackHeight(queue: PrintBlock[]): number {
  if (queue[0]?.kind !== 'section-head') return 0

  const sectionId = queue[0].section.id
  let total = 0
  let count = 0

  for (const block of queue) {
    if (block.kind === 'section-head' && block.section.id === sectionId) {
      total += estimatePlacementHeight(block) + (count > 0 ? BLOCK_GAP : 0)
      count += 1
    } else if (block.kind === 'section-instructions' && block.section.id === sectionId) {
      total += estimatePlacementHeight(block) + BLOCK_GAP
      count += 1
    } else if (block.kind === 'question' && block.section.id === sectionId) {
      total += estimatePlacementHeight(block) + BLOCK_GAP
      break
    } else {
      break
    }
  }

  return total
}

function isSectionIntroOnly(blocks: PrintBlock[]): boolean {
  if (blocks.length === 0) return false
  return blocks.every((b) => b.kind === 'section-head' || b.kind === 'section-instructions')
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

/** Split any page whose render-total exceeds the physical body budget. */
function enforcePageBudgets(
  pages: PrintPageModel[],
  ctx: PaginateContext,
): PrintPageModel[] {
  const flat = pages.flatMap((p) => p.blocks)
  if (flat.length === 0) return pages

  const split: PrintBlock[][] = []
  let current: PrintBlock[] = []
  let used = 0
  let pageIndex = 0

  for (let i = 0; i < flat.length; i++) {
    const block = flat[i]!
    const budget = ctx.bodyHeightForPage(pageIndex)
    const h = estimateRenderHeight(block)
    const gap = current.length > 0 ? BLOCK_GAP : 0

    if (block.kind === 'section-head' && current.length > 0) {
      const tail = flat.slice(i)
      const prefixH = sectionIntroPrefixHeight(tail)
      const packH = sectionIntroPackHeight(tail)
      const minStart = prefixH > 0 ? prefixH : packH
      if (minStart > 0 && used + BLOCK_GAP + minStart > budget) {
        split.push(current)
        pageIndex += 1
        current = []
        used = 0
      }
    }

    if (current.length > 0 && used + gap + h > budget) {
      split.push(current)
      pageIndex += 1
      current = [block]
      used = h
    } else {
      if (current.length > 0) used += gap
      current.push(block)
      used += h
    }
  }

  if (current.length > 0) split.push(current)

  const models: PrintPageModel[] = split.map((blocks, index) => ({
    pageIndex: index,
    blocks,
    headerMode: index === 0 ? 'full' : 'compact',
    continuedSection: undefined,
  }))

  return recomputeContinuedSections(models)
}

/**
 * Pull a few blocks from page N+1 only when page N is under-filled (render heights).
 */
function balancePages(pages: PrintPageModel[], ctx: PaginateContext): PrintPageModel[] {
  if (pages.length < 2) return pages

  const out = pages.map((p) => ({ ...p, blocks: [...p.blocks] }))

  for (let i = 0; i < out.length - 1; i++) {
    const budget = ctx.bodyHeightForPage(i)
    const page = out[i]!
    const next = out[i + 1]!

    while (next.blocks.length > 0) {
      const used = pageBlocksHeight(page.blocks, estimateRenderHeight)
      if (used >= budget * BALANCE_UNDERFILL_RATIO) break

      const block = next.blocks[0]!
      const gap = page.blocks.length > 0 ? BLOCK_GAP : 0
      const needed = estimateRenderHeight(block) + gap
      if (used + needed > budget) break

      page.blocks.push(next.blocks.shift()!)
    }

    if (
      page.blocks.length > 0 &&
      isSectionIntroOnly(page.blocks) &&
      next.blocks.length > 0
    ) {
      while (page.blocks.length > 0) {
        next.blocks.unshift(page.blocks.pop()!)
      }
    }
  }

  const nonEmpty = out.filter((p) => p.blocks.length > 0)
  return nonEmpty
}

export function paginatePrintBlocks(
  blocks: PrintBlock[],
  ctx: PaginateContext,
): PrintPageModel[] {
  if (blocks.length === 0) {
    return [{ pageIndex: 0, blocks: [], headerMode: 'full' }]
  }

  const pages: PrintPageModel[] = []
  let pageBlocks: PrintBlock[] = []
  let pageIndex = 0
  let remaining = ctx.bodyHeightForPage(0)
  let continuedOnThisPage: PaperSectionDef | undefined
  let continuedOnNextPage: PaperSectionDef | undefined
  const queue = [...blocks]

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
    remaining = ctx.bodyHeightForPage(pageIndex)
  }

  while (queue.length > 0) {
    const block = queue[0]!
    let placed = false

    while (!placed) {
      const height = estimatePlacementHeight(block)
      const gap = pageBlocks.length > 0 ? BLOCK_GAP : 0
      const needed = height + gap

      // Start a section if head + instructions fit; first question may break to next page.
      if (block.kind === 'section-head' && pageBlocks.length > 0) {
        const prefixH = sectionIntroPrefixHeight(queue)
        const packH = sectionIntroPackHeight(queue)
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
        remaining -= height
        queue.shift()
        flush()
        break
      }

      pageBlocks.push(block)
      remaining -= needed
      queue.shift()
      placed = true
    }
  }

  if (pageBlocks.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex,
      blocks: pageBlocks,
      headerMode: pageIndex === 0 ? 'full' : 'compact',
      continuedSection: continuedOnThisPage,
    })
  }

  const balanced = balancePages(pages, ctx)
  const enforced = enforcePageBudgets(balanced, ctx)
  return enforced.map((page, index) => ({ ...page, pageIndex: index }))
}

export function buildPrintBlocks(
  sections: PaperSectionDef[],
  composition: PaperComposition,
  generalInstructions?: string,
): PrintBlock[] {
  const blocks: PrintBlock[] = [
    {
      kind: 'instructions',
      generalInstructions,
      sectionCount: sections.length,
    },
  ]

  const questionNumbers = buildGlobalQuestionNumbers(composition, sections)

  for (const section of sections) {
    const items = composition[section.id]
    const summary = computeSectionSummary(items)
    blocks.push({ kind: 'section-head', section, summary })
    blocks.push({ kind: 'section-instructions', section })

    items.forEach((question, idx) => {
      blocks.push({
        kind: 'question',
        section,
        question,
        number: questionNumbers.get(question.id) ?? idx + 1,
        medium: 'english',
      })
    })
  }

  return blocks
}

export function buildPrintPages(
  sections: PaperSectionDef[],
  composition: PaperComposition,
  generalInstructions?: string,
): PrintPageModel[] {
  const ctx: PaginateContext = {
    bodyHeightPage1: PRINT_BODY_HEIGHT_PAGE1,
    bodyHeightContinued: PRINT_BODY_HEIGHT_CONTINUED,
    bodyHeightForPage: (i) => (i === 0 ? PRINT_BODY_HEIGHT_PAGE1 : PRINT_BODY_HEIGHT_CONTINUED),
  }
  return paginatePrintBlocks(buildPrintBlocks(sections, composition, generalInstructions), ctx)
}

function resolvedSectionSummary(section: ResolvedSection): SectionPrintSummary {
  return {
    questionCount: section.questions.length,
    totalMarks: section.questions.reduce((s, q) => s + q.effectiveMarks, 0),
    estimatedMinutes: section.questions.reduce(
      (s, q) => s + (q.question.estimatedMinutes || 0),
      0,
    ),
  }
}

export function buildPrintBlocksFromResolved(resolved: ResolvedPaper): PrintBlock[] {
  const medium = resolved.meta.medium

  const blocks: PrintBlock[] = [
    {
      kind: 'instructions',
      generalInstructions: resolved.setup.generalInstructions,
      sectionCount: resolved.sections.length,
    },
  ]

  for (const section of resolved.sections) {
    const sectionFmt = section.sectionFormat
    const summary = resolvedSectionSummary(section)
    const sectionDef: PaperSectionDef = section

    blocks.push({
      kind: 'section-head',
      section: sectionDef,
      summary,
      displayTitle: section.effectiveTitle,
      marginTopMm: sectionFmt.spacingAbove,
      marginBottomMm: sectionFmt.spacingAfterHeader,
      fontSizePt: sectionFmt.fontSize,
    })
    blocks.push({
      kind: 'section-instructions',
      section: sectionDef,
      displayText: section.effectiveInstructions,
    })

    for (const rq of section.questions) {
      const qFmt = rq.questionFormat
      blocks.push({
        kind: 'question',
        section: sectionDef,
        question: rq.question,
        number: rq.displayNumber,
        showNumber: rq.showNumber,
        displayMarks: rq.effectiveMarks,
        localInstructions: rq.localInstructions,
        spacingMode: rq.spacingMode,
        medium,
        layout: {
          marginTopMm: qFmt.marginTop,
          marginBottomMm: qFmt.marginBottom,
          fontSizePt: qFmt.fontSize,
        },
      })
    }
  }

  return blocks
}

export function buildPrintPagesFromResolved(resolved: ResolvedPaper): PrintPageModel[] {
  const ctx = computePaginateContext(resolved.presentation, resolved.formatConfig)
  return paginatePrintBlocks(buildPrintBlocksFromResolved(resolved), ctx)
}

export function printFooterLabel(meta: PaperMeta): string {
  const parts = [meta.subject, meta.classLabel]
  if (meta.examType) parts.push(meta.examType)
  return parts.join(' · ')
}
