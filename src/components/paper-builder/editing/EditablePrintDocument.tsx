import { type CSSProperties, type ReactNode } from 'react'
import {
  PRINT_PAGE_HEIGHT_PX,
  PRINT_PAGE_WIDTH_PX,
  type PrintBlock,
  type PrintPageModel,
} from '@/lib/paper-print-layout'
import { usePrintLayoutOptional } from '@/context/PrintLayoutContext'
import {
  configToCssVars,
  questionFormatToStyle,
  sectionFormatToStyle,
} from '@/lib/paper-format-config'
import { resolveHeaderFields, resolvePageHeader } from '@/lib/paper-print-header'
import { printSettingsClassName, type ResolvedPaper } from '@/lib/paper-instance'
import { PrintBlockContent } from '@/components/print/PrintBlockContent'
import { PrintPageBreakRibbon } from '@/components/print/PrintPageBreakRibbon'
import { PrintPageFooter } from '@/components/print/PrintPageFooter'
import { PrintPageHeader } from '@/components/print/PrintPageHeader'
import type { EditSelection, PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperSectionId } from '@/lib/paper-builder'
import { patchQuestionInstance, patchSectionInstance } from './instance-patch'
import {
  EditablePrintSectionHead,
  EditablePrintSectionInstructions,
} from './inline/EditablePrintSectionHead'
import { EditablePrintQuestion } from './inline/EditablePrintQuestion'

type Props = {
  resolved: ResolvedPaper
  selection: EditSelection
  instanceLayer: PaperInstanceLayer
  /** Measured print pages (preview renderer). Falls back to context. */
  pages?: PrintPageModel[]
  readOnly?: boolean
  /** Hides editing overlays for clean preview surface. */
  cleanSurface?: boolean
  onSelect: (sel: EditSelection) => void
  onInstanceChange: (next: PaperInstanceLayer) => void
}

function resolvedSectionSummary(section: ResolvedPaper['sections'][0]) {
  return {
    questionCount: section.questions.length,
    totalMarks: section.questions.reduce((s, q) => s + q.effectiveMarks, 0),
    estimatedMinutes: section.questions.reduce(
      (s, q) => s + (q.question.estimatedMinutes || 0),
      0,
    ),
  }
}

export function EditablePrintDocument({
  resolved,
  selection,
  instanceLayer,
  pages: pagesProp,
  readOnly,
  cleanSurface,
  onSelect,
  onInstanceChange,
}: Props) {
  const layoutCtx = usePrintLayoutOptional()
  const pages = pagesProp ?? layoutCtx?.pages ?? []
  const printClass = printSettingsClassName(resolved.printSettings)
  const formatVars = configToCssVars(resolved.formatConfig)
  const presentation = resolved.presentation
  const pageCount = pages.length

  function isQuestionSelected(sectionId: PaperSectionId, questionId: string) {
    return (
      selection.kind === 'question' &&
      selection.sectionId === sectionId &&
      selection.questionId === questionId
    )
  }

  function isSectionSelected(sectionId: PaperSectionId) {
    return selection.kind === 'section' && selection.sectionId === sectionId
  }

  function renderBlock(block: PrintBlock, pageIndex: number, blockIndex: number) {
    const key = `${pageIndex}-${block.kind}-${blockIndex}`

    if (block.kind === 'question') {
      const rq = resolved.sections
        .find((s) => s.id === block.section.id)
        ?.questions.find((q) => q.question.id === block.question.id)
      if (!rq) return null
      const qInst = instanceLayer.questions?.[rq.question.id] ?? {}
      const qFormat = rq.questionFormat
      return (
        <EditablePrintQuestion
          key={key}
          rq={rq}
          medium={resolved.meta.medium}
          selected={isQuestionSelected(block.section.id, rq.question.id)}
          readOnly={readOnly}
          localInstructions={qInst.localInstructions ?? rq.localInstructions}
          marksDisplay={resolved.printSettings.marksDisplay}
          formatStyle={questionFormatToStyle(qFormat)}
          hasFormatOverride={qFormat.hasOverrides}
          showNumber={rq.showNumber}
          onSelect={() =>
            onSelect({
              kind: 'question',
              sectionId: block.section.id,
              questionId: rq.question.id,
            })
          }
          onNumberChange={(num) =>
            onInstanceChange(
              patchQuestionInstance(instanceLayer, rq.question.id, {
                customNumber: num,
              }),
            )
          }
          onLocalInstructions={(text) =>
            onInstanceChange(
              patchQuestionInstance(instanceLayer, rq.question.id, {
                localInstructions: text.trim() || undefined,
              }),
            )
          }
        />
      )
    }

    if (block.kind === 'section-head') {
      const section = resolved.sections.find((s) => s.id === block.section.id)
      if (!section) return null
      const summary = resolvedSectionSummary(section)
      return (
        <EditablePrintSectionHead
          key={key}
          section={section}
          summary={summary}
          medium={resolved.meta.medium}
          selected={isSectionSelected(section.id)}
          formatStyle={sectionFormatToStyle(section.sectionFormat)}
          hasFormatOverride={section.sectionFormat.hasOverrides}
          readOnly={readOnly}
          onSelect={() => onSelect({ kind: 'section', sectionId: section.id })}
          onTitleChange={(title) =>
            onInstanceChange(
              patchSectionInstance(instanceLayer, section.id, { title }),
            )
          }
        />
      )
    }

    if (block.kind === 'section-instructions') {
      const section = resolved.sections.find((s) => s.id === block.section.id)
      if (!section) return null
      return (
        <EditablePrintSectionInstructions
          key={key}
          section={section}
          medium={resolved.meta.medium}
          selected={isSectionSelected(section.id)}
          readOnly={readOnly}
          onSelect={() => onSelect({ kind: 'section', sectionId: section.id })}
          onInstructionsChange={(text) =>
            onInstanceChange(
              patchSectionInstance(instanceLayer, section.id, { instructions: text }),
            )
          }
        />
      )
    }

    return (
      <div
        key={key}
        className="pc-print-block"
        data-print-kind={block.kind}
        onClick={() => onSelect({ kind: 'paper' })}
      >
        <PrintBlockContent block={block} medium={resolved.meta.medium} marksDisplay={resolved.printSettings.marksDisplay} />
      </div>
    )
  }

  return (
    <div
      className={`pc-print-doc pc-print-doc--edit pc-ed-doc${cleanSurface ? ' pc-ed-doc--clean' : ''}${printClass ? ` ${printClass}` : ''}`}
      onClick={() => onSelect({ kind: 'paper' })}
      style={
        {
          ...formatVars,
          '--pc-print-page-w': `${PRINT_PAGE_WIDTH_PX}px`,
          '--pc-print-page-h': `${PRINT_PAGE_HEIGHT_PX}px`,
        } as CSSProperties
      }
    >
      {pages.map((page, index) => (
        <EditablePage
          key={page.pageIndex}
          page={page}
          index={index}
          pageCount={pageCount}
          meta={resolved.meta}
          resolved={resolved}
          showFooter={presentation.showFooter !== false}
          renderBlock={renderBlock}
        />
      ))}
    </div>
  )
}

function EditablePage({
  page,
  index,
  pageCount,
  meta,
  resolved,
  showFooter,
  renderBlock,
}: {
  page: PrintPageModel
  index: number
  pageCount: number
  meta: ResolvedPaper['meta']
  resolved: ResolvedPaper
  showFooter: boolean
  renderBlock: (block: PrintBlock, pageIndex: number, blockIndex: number) => ReactNode
}) {
  const pageNumber = page.pageIndex + 1
  const continuedName = page.continuedSection?.name.split(' · ')[0]
  const headerRender = resolvePageHeader(page, resolved.presentation, resolved.formatConfig)
  const headerFields = resolveHeaderFields(resolved.presentation)

  return (
    <div className="pc-print-page-stack" onClick={(e) => e.stopPropagation()}>
      {index > 0 ? (
        <PrintPageBreakRibbon pageNumber={index + 1} pageCount={pageCount} />
      ) : null}
      <article
        className="pc-print-page"
        data-print-page={page.pageIndex}
        aria-label={`Page ${pageNumber} of ${pageCount}`}
      >
        {headerRender.show ? (
          <PrintPageHeader meta={meta} mode={headerRender.mode} fields={headerFields} />
        ) : null}
        <div className="pc-print-page-body">
          {page.continuedSection ? (
            <p className="pc-print-continued-banner">
              Continued · Section {page.continuedSection.letter}
              {continuedName ? (
                <span className="pc-print-continued-banner-sub"> · {continuedName}</span>
              ) : null}
            </p>
          ) : null}
          {page.blocks.map((block, i) => renderBlock(block, page.pageIndex, i))}
          {page.pageIndex === pageCount - 1 ? (
            <p className="pc-print-end-mark pc-serif">— end of paper · all the best —</p>
          ) : null}
        </div>
        {showFooter ? (
          <PrintPageFooter meta={meta} pageNumber={pageNumber} pageCount={pageCount} />
        ) : null}
      </article>
    </div>
  )
}
