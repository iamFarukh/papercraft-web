import { useState } from 'react'
import { PrintQuestionBody } from '@/components/print/PrintQuestionBody'
import { isMissingQuestion } from '@/lib/missing-question'
import type { ResolvedQuestion } from '@/lib/paper-instance'
import type { PaperMedium } from '@/lib/paper-medium'
import { formatQuestionMarks } from '@/lib/paper-format-marks'
import type { PaperMarksDisplay } from '@/types/paper-instance'

type Props = {
  rq: ResolvedQuestion
  medium: PaperMedium
  selected: boolean
  readOnly?: boolean
  localInstructions?: string
  marksDisplay: PaperMarksDisplay
  formatStyle?: Record<string, string>
  hasFormatOverride?: boolean
  showNumber: boolean
  onSelect: () => void
  onNumberChange: (num: number | undefined) => void
  onLocalInstructions: (text: string) => void
}

/**
 * A question on the editable paper. Direct text editing (number, local note)
 * happens here; all formatting lives in the top formatting toolbar, which acts
 * on the selected block — so the paper itself stays clean and legible.
 */
export function EditablePrintQuestion({
  rq,
  medium,
  selected,
  readOnly,
  localInstructions,
  marksDisplay,
  formatStyle,
  hasFormatOverride,
  showNumber,
  onSelect,
  onNumberChange,
  onLocalInstructions,
}: Props) {
  const [editingNumber, setEditingNumber] = useState(false)
  const missing = isMissingQuestion(rq.question)
  const marksLabel = formatQuestionMarks(rq.effectiveMarks, marksDisplay)
  const showEditChrome = selected && !readOnly

  return (
    <div className={`pc-ed-question-wrap${showEditChrome ? ' is-editing' : ''}`}>
      <article
        className={`pc-print-question pc-ed-block pc-ed-question${missing ? ' is-missing' : ''}${selected ? ' is-selected' : ''}${hasFormatOverride ? ' has-format-override' : ''}`}
        style={formatStyle as React.CSSProperties}
        data-ed-kind="question"
        data-question-id={rq.question.id}
        onClick={(e) => {
          e.stopPropagation()
          onSelect()
        }}
      >
        <div className="pc-ed-question-num-cell">
          {hasFormatOverride ? (
            <span className="pc-ed-override-dot" title="Format override" aria-hidden />
          ) : null}
          {showNumber ? (
            editingNumber && !readOnly ? (
              <input
                type="number"
                className="pc-ed-num-input pc-serif pc-num"
                min={1}
                autoFocus
                defaultValue={rq.displayNumber}
                onClick={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  const v = Number(e.target.value)
                  onNumberChange(Number.isFinite(v) && v > 0 ? v : undefined)
                  setEditingNumber(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') setEditingNumber(false)
                }}
              />
            ) : (
              <button
                type="button"
                className="pc-print-question-num pc-serif pc-num pc-ed-num-btn"
                title="Click to edit the question number"
                disabled={readOnly}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!readOnly) setEditingNumber(true)
                }}
              >
                {rq.displayNumber}.
              </button>
            )
          ) : (
            <span className="pc-ed-num-hidden pc-serif" title="Numbering hidden">
              —
            </span>
          )}
        </div>

        <div className="pc-print-question-body">
          <PrintQuestionBody question={rq.question} medium={medium} />
          {localInstructions?.trim() && !showEditChrome ? (
            <p className="pc-print-question-local-note">{localInstructions.trim()}</p>
          ) : null}
          {showEditChrome ? (
            <textarea
              className="pc-ed-local-note-input pc-ed-question-local-field"
              rows={1}
              placeholder="Add a note under this question (optional) — e.g. Attempt any three."
              value={localInstructions ?? ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onLocalInstructions(e.target.value)}
            />
          ) : null}
        </div>

        <div className="pc-ed-question-marks-col">
          {marksLabel ? (
            <span className="pc-print-question-marks pc-serif pc-num pc-ed-marks-print">
              {marksLabel}
            </span>
          ) : null}
        </div>
      </article>
    </div>
  )
}
