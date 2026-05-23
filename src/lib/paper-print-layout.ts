import {
  buildGlobalQuestionNumbers,
  computeSectionSummary,
  type PaperComposition,
  type PaperMeta,
  type PaperSectionDef,
} from '@/lib/paper-builder'
import type { QuestionRecord } from '@/types/question'

/** A4 content area at 72dpi (matches screen preview). */
export const PRINT_PAGE_WIDTH_PX = 595
export const PRINT_PAGE_HEIGHT_PX = 842

const PAGE_PAD_TOP = 44
const PAGE_PAD_BOTTOM = 48
const FOOTER_HEIGHT = 34
const FULL_HEADER_HEIGHT = 198
const COMPACT_HEADER_HEIGHT = 54

export const PRINT_BODY_HEIGHT_PAGE1 =
  PRINT_PAGE_HEIGHT_PX - PAGE_PAD_TOP - PAGE_PAD_BOTTOM - FOOTER_HEIGHT - FULL_HEADER_HEIGHT

export const PRINT_BODY_HEIGHT_CONTINUED =
  PRINT_PAGE_HEIGHT_PX - PAGE_PAD_TOP - PAGE_PAD_BOTTOM - FOOTER_HEIGHT - COMPACT_HEADER_HEIGHT

export type PrintBlock =
  | { kind: 'instructions'; generalInstructions?: string; sectionCount: number }
  | { kind: 'section-head'; section: PaperSectionDef; summary: ReturnType<typeof computeSectionSummary> }
  | { kind: 'section-instructions'; section: PaperSectionDef }
  | { kind: 'question'; section: PaperSectionDef; question: QuestionRecord; number: number }

export type PrintPageModel = {
  pageIndex: number
  blocks: PrintBlock[]
  headerMode: 'full' | 'compact'
}

function estimateInstructionsHeight(generalInstructions: string | undefined, sectionCount: number): number {
  const text = generalInstructions?.trim()
  if (text) return 58 + Math.ceil(text.length / 88) * 15
  return 68 + (sectionCount > 2 ? 12 : 0)
}

function estimateSectionHeadHeight(): number {
  return 46
}

function estimateSectionInstructionsHeight(text: string): number {
  return 30 + Math.ceil(text.length / 72) * 14
}

function estimateQuestionHeight(question: QuestionRecord): number {
  const bodyLines = Math.max(1, Math.ceil(question.bodyText.length / 68))
  return 44 + bodyLines * 17
}

function estimateBlockHeight(block: PrintBlock): number {
  switch (block.kind) {
    case 'instructions':
      return estimateInstructionsHeight(block.generalInstructions, block.sectionCount)
    case 'section-head':
      return estimateSectionHeadHeight()
    case 'section-instructions':
      return estimateSectionInstructionsHeight(block.section.instructions)
    case 'question':
      return estimateQuestionHeight(block.question)
    default:
      return 48
  }
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
      })
    })
  }

  return blocks
}

export function paginatePrintBlocks(blocks: PrintBlock[]): PrintPageModel[] {
  if (blocks.length === 0) {
    return [
      {
        pageIndex: 0,
        blocks: [],
        headerMode: 'full',
      },
    ]
  }

  const pages: PrintPageModel[] = []
  let pageBlocks: PrintBlock[] = []
  let remaining = PRINT_BODY_HEIGHT_PAGE1
  let pageIndex = 0

  const flush = () => {
    pages.push({
      pageIndex,
      blocks: pageBlocks,
      headerMode: pageIndex === 0 ? 'full' : 'compact',
    })
    pageIndex += 1
    pageBlocks = []
    remaining = PRINT_BODY_HEIGHT_CONTINUED
  }

  for (const block of blocks) {
    const height = estimateBlockHeight(block)
    const minRemaining = pageBlocks.length === 0 ? height : height + 4

    if (minRemaining > remaining && pageBlocks.length > 0) {
      flush()
    }

    if (height > remaining && pageBlocks.length === 0) {
      pageBlocks.push(block)
      flush()
      continue
    }

    pageBlocks.push(block)
    remaining -= height
  }

  if (pageBlocks.length > 0 || pages.length === 0) {
    pages.push({
      pageIndex,
      blocks: pageBlocks,
      headerMode: pageIndex === 0 ? 'full' : 'compact',
    })
  }

  return pages
}

export function buildPrintPages(
  sections: PaperSectionDef[],
  composition: PaperComposition,
  generalInstructions?: string,
): PrintPageModel[] {
  const blocks = buildPrintBlocks(sections, composition, generalInstructions)
  return paginatePrintBlocks(blocks)
}

export function printFooterLabel(meta: PaperMeta): string {
  const parts = [meta.subject, meta.classLabel]
  if (meta.examType) parts.push(meta.examType)
  return parts.join(' · ')
}
