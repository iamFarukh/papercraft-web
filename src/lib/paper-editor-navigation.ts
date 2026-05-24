import { buildPrintPagesFromResolved, type PrintPageModel } from '@/lib/paper-print-layout'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { EditSelection } from '@/types/paper-instance'

export function pageIndexForSelection(
  resolved: ResolvedPaper,
  selection: EditSelection,
  pages?: PrintPageModel[],
): number | null {
  if (selection.kind === 'paper') return null

  const pageList = pages ?? buildPrintPagesFromResolved(resolved)

  if (selection.kind === 'question') {
    return findPageForQuestion(pageList, selection.questionId)
  }

  return findPageForSection(pageList, selection.sectionId)
}

function findPageForQuestion(pages: PrintPageModel[], questionId: string): number | null {
  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.kind === 'question' && block.question.id === questionId) {
        return page.pageIndex
      }
    }
  }
  return null
}

function findPageForSection(pages: PrintPageModel[], sectionId: string): number | null {
  for (const page of pages) {
    for (const block of page.blocks) {
      if (
        (block.kind === 'section-head' || block.kind === 'section-instructions') &&
        block.section.id === sectionId
      ) {
        return page.pageIndex
      }
    }
  }
  return null
}

export function scrollRootToPage(root: HTMLElement | null, pageIndex: number) {
  if (!root) return
  root
    .querySelector(`[data-print-page="${pageIndex}"]`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollRootToSelection(root: HTMLElement | null, selection: EditSelection) {
  if (!root || selection.kind === 'paper') return
  let selector = ''
  if (selection.kind === 'question') {
    selector = `[data-question-id="${selection.questionId}"]`
  } else if (selection.kind === 'section') {
    selector = `[data-section-id="${selection.sectionId}"]`
  }
  if (!selector) return
  root.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}
