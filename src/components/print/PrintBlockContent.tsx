import { isMissingQuestion } from '@/lib/missing-question'
import { formatQuestionMarks } from '@/lib/paper-format-marks'
import { getPrintLabels, PRINT_CHROME_LABELS, type PaperMedium } from '@/lib/paper-medium'
import type { PaperMarksDisplay } from '@/types/paper-instance'
import type { PrintBlock } from '@/lib/paper-print-layout'
import { printBlockStyle } from '@/lib/print-block-style'
import { PrintQuestionBody } from './PrintQuestionBody'

type Props = {
  block: PrintBlock
  medium: PaperMedium
  marksDisplay?: PaperMarksDisplay
}

export function PrintBlockContent({ block, medium, marksDisplay = 'bracket' }: Props) {
  const labels = getPrintLabels(medium)
  const isHindi = medium === 'hindi'

  switch (block.kind) {
    case 'instructions':
      return (
        <div className={`pc-print-instructions${isHindi ? ' pc-print-is-hindi' : ''}`}>
          <div className="pc-print-instructions-title pc-serif">
            {labels.generalInstructions}
          </div>
          {block.generalInstructions?.trim() ? (
            <p className="pc-print-instructions-body">{block.generalInstructions.trim()}</p>
          ) : (
            <ol>
              <li>
                {labels.compulsoryNote}{' '}
                <span className="pc-num">{block.sectionCount}</span>{' '}
                {medium === 'hindi' ? 'खंड हैं।' : 'section(s).'}
              </li>
              <li>{labels.calculatorNote}</li>
              <li>{labels.figuresNote}</li>
            </ol>
          )}
        </div>
      )

    case 'section-head': {
      const titleSource = block.displayTitle ?? block.section.name
      const namePart = titleSource.split(' · ')[0]
      return (
        <div
          className="pc-print-section-head"
          data-section-id={block.section.id}
          style={printBlockStyle(block)}
        >
          <h3 className={`pc-print-section-title pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
            {labels.section} {block.section.letter} <em>· {namePart}</em>
          </h3>
          <span className="pc-print-section-marks">
            <span className="pc-num">{block.summary.questionCount}</span> Q ·{' '}
            <span className="pc-num">{block.summary.totalMarks}</span> {PRINT_CHROME_LABELS.marksUnit}
          </span>
        </div>
      )
    }

    case 'section-instructions':
      return (
        <p
          className={`pc-print-section-instructions${isHindi ? ' pc-print-is-hindi' : ''}`}
        >
          {block.displayText ?? block.section.instructions}
        </p>
      )

    case 'question': {
      const missing = isMissingQuestion(block.question)
      const marks = block.displayMarks ?? block.question.marks
      const marksLabel = formatQuestionMarks(marks, marksDisplay)
      const spacingClass =
        block.spacingMode && block.spacingMode !== 'normal'
          ? ` pc-print-question--${block.spacingMode}`
          : ''
      return (
        <article
          className={`pc-print-question${missing ? ' is-missing' : ''}${spacingClass}`}
          data-question-id={block.question.id}
          style={printBlockStyle(block)}
        >
          {block.showNumber !== false ? (
            <span className="pc-print-question-num pc-serif pc-num">{block.number}.</span>
          ) : null}
          <div className="pc-print-question-body">
            <PrintQuestionBody question={block.question} medium={medium} />
            {block.localInstructions?.trim() ? (
              <p className="pc-print-question-local-note">{block.localInstructions.trim()}</p>
            ) : null}
          </div>
          {marksLabel ? (
            <span className="pc-print-question-marks pc-serif pc-num">{marksLabel}</span>
          ) : null}
        </article>
      )
    }

    default:
      return null
  }
}
