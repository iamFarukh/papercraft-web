import { ChevronDown, EyeOff, MoreHorizontal } from 'lucide-react'
import { useRef, useState } from 'react'
import { PrintQuestionBody } from '@/components/print/PrintQuestionBody'
import { isMissingQuestion } from '@/lib/missing-question'
import type { ResolvedQuestion } from '@/lib/paper-instance'
import type { PaperMedium } from '@/lib/paper-medium'
import { formatQuestionMarks } from '@/lib/paper-format-marks'
import type { PaperMarksDisplay } from '@/types/paper-instance'
import type { PaperSectionId } from '@/lib/paper-builder'
import { EditorialChip } from './EditorialChip'
import { EditorPopover } from './EditorPopover'
import { FormatFloatingToolbar } from './FormatFloatingToolbar'
import { InlineMarksEditor } from './InlineMarksEditor'

type Props = {
  rq: ResolvedQuestion
  sectionId: PaperSectionId
  medium: PaperMedium
  selected: boolean
  advancedMode?: boolean
  readOnly?: boolean
  questionGapMm: number
  indentMm: number
  defaultQuestionGap: number
  hasSpacingOverride: boolean
  localInstructions?: string
  marksDisplay: PaperMarksDisplay
  formatStyle?: Record<string, string>
  hasFormatOverride?: boolean
  onSelect: () => void
  onMarksChange: (marks: number | undefined) => void
  showNumber: boolean
  onNumberChange: (num: number | undefined) => void
  onHideNumber: (hide: boolean) => void
  onSpacingCycle: () => void
  onMarginTopDelta: (deltaMm: number) => void
  onIndentDelta: (deltaMm: number) => void
  onLocalInstructions: (text: string) => void
  onHide: () => void
}

export function EditablePrintQuestion({
  rq,
  medium,
  selected,
  advancedMode,
  readOnly,
  questionGapMm,
  indentMm,
  defaultQuestionGap,
  hasSpacingOverride,
  localInstructions,
  marksDisplay,
  formatStyle,
  hasFormatOverride,
  onSelect,
  onMarksChange,
  showNumber,
  onNumberChange,
  onHideNumber,
  onSpacingCycle,
  onMarginTopDelta,
  onIndentDelta,
  onLocalInstructions,
  onHide,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingNumber, setEditingNumber] = useState(false)
  const menuAnchorRef = useRef<HTMLDivElement>(null)
  const missing = isMissingQuestion(rq.question)
  const marksLabel = formatQuestionMarks(rq.effectiveMarks, marksDisplay)
  const spacingLabel = (() => {
    if (!hasSpacingOverride) return 'Normal'
    if (questionGapMm < defaultQuestionGap * 0.75) return 'Compact'
    if (questionGapMm > defaultQuestionGap * 1.25) return 'Spacious'
    return 'Custom'
  })()
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
                title="Edit question number"
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
        </div>

        <div className="pc-ed-question-marks-col">
          {marksLabel ? (
            <span className="pc-print-question-marks pc-serif pc-num pc-ed-marks-print">
              {marksLabel}
            </span>
          ) : null}
        </div>

        {showEditChrome ? (
          <>
            {advancedMode ? (
              <FormatFloatingToolbar
                marginTopMm={questionGapMm}
                indentMm={indentMm}
                onMarginTopChange={onMarginTopDelta}
                onIndentChange={onIndentDelta}
                onMore={() => setMenuOpen((v) => !v)}
              />
            ) : null}
            <div className="pc-ed-question-inline-bar">
              <InlineMarksEditor
                value={rq.effectiveMarks}
                repositoryMarks={rq.repositoryMarks}
                disabled={readOnly}
                onChange={onMarksChange}
              />
              <EditorialChip title="Spacing for this question only" onClick={onSpacingCycle}>
                {spacingLabel}
                <ChevronDown size={9} strokeWidth={1.6} />
              </EditorialChip>
              <EditorialChip
                title="Question numbering"
                onClick={() => {
                  if (!showNumber) onHideNumber(false)
                  else onNumberChange(undefined)
                }}
              >
                {showNumber ? 'Auto #' : 'Hidden #'}
                <ChevronDown size={9} strokeWidth={1.6} />
              </EditorialChip>
              <div className="pc-ed-menu-wrap" ref={menuAnchorRef}>
                <EditorialChip title="More" onClick={() => setMenuOpen((v) => !v)}>
                  <MoreHorizontal size={12} strokeWidth={1.6} />
                </EditorialChip>
                <EditorPopover
                  open={menuOpen}
                  anchorRef={menuAnchorRef}
                  onClose={() => setMenuOpen(false)}
                  className="pc-ed-popover-portal--menu"
                  align="end"
                >
                  <button type="button" onClick={() => { onHide(); setMenuOpen(false) }}>
                    <EyeOff size={12} /> Hide on paper
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNumberChange(undefined)
                      onHideNumber(false)
                      setMenuOpen(false)
                    }}
                  >
                    Auto numbering
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onHideNumber(!showNumber)
                      setMenuOpen(false)
                    }}
                  >
                    {showNumber ? 'Hide numbering' : 'Show numbering'}
                  </button>
                </EditorPopover>
              </div>
            </div>
            <textarea
              className="pc-ed-local-note-input pc-ed-question-local-field"
              rows={1}
              placeholder="Local instruction (optional) — e.g. Attempt any three."
              value={localInstructions ?? ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => onLocalInstructions(e.target.value)}
            />
          </>
        ) : null}
      </article>
    </div>
  )
}
