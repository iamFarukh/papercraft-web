import { isMissingQuestion } from '@/lib/missing-question'
import { getPrintLabels, type PaperMedium } from '@/lib/paper-medium'
import type { PrintBlock } from '@/lib/paper-print-layout'
import { PrintQuestionBody } from './PrintQuestionBody'

type Props = {
  block: PrintBlock
  medium: PaperMedium
}

export function PrintBlockContent({ block, medium }: Props) {
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
      const namePart = block.section.name.split(' · ')[0]
      return (
        <div className="pc-print-section-head">
          <h3 className={`pc-print-section-title pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
            {labels.section} {block.section.letter} <em>· {namePart}</em>
          </h3>
          <span className="pc-print-section-marks">
            <span className="pc-num">{block.summary.questionCount}</span> ×{' '}
            <span className="pc-num">{block.section.marksEach}</span> ={' '}
            <span className="pc-num">{block.summary.totalMarks}</span> {labels.marksUnit}
          </span>
        </div>
      )
    }

    case 'section-instructions':
      return (
        <p
          className={`pc-print-section-instructions${isHindi ? ' pc-print-is-hindi' : ''}`}
        >
          {block.section.instructions}
        </p>
      )

    case 'question': {
      const missing = isMissingQuestion(block.question)
      return (
        <article className={`pc-print-question${missing ? ' is-missing' : ''}`}>
          <span className="pc-print-question-num pc-serif pc-num">{block.number}.</span>
          <div className="pc-print-question-body">
            <PrintQuestionBody question={block.question} medium={medium} />
          </div>
          <span className="pc-print-question-marks pc-serif pc-num">
            [{block.question.marks}]
          </span>
        </article>
      )
    }

    default:
      return null
  }
}
