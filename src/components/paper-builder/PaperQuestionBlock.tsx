import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { builderBlockEnter } from '@/lib/motion'
import {
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { DifficultyPips } from '@/components/repository/DifficultyPips'
import {
  difficultySummary,
  formatMarksLabel,
  shortQuestionId,
  type PaperMedium,
} from '@/lib/paper-builder'
import { isMissingQuestion } from '@/lib/missing-question'
import { PrintQuestionBody } from '@/components/print/PrintQuestionBody'
import type { QuestionRecord } from '@/types/question'

type Props = {
  question: QuestionRecord
  number: number
  isNew?: boolean
  isReplacing?: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  readOnly?: boolean
  officialPreview?: boolean
  paperMedium?: PaperMedium
  onRemove: () => void
  onReplace: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

export function PaperQuestionBlock({
  question,
  number,
  isNew,
  isReplacing,
  canMoveUp,
  canMoveDown,
  readOnly = false,
  officialPreview = false,
  paperMedium = 'english',
  onRemove,
  onReplace,
  onMoveUp,
  onMoveDown,
}: Props) {
  const missing = isMissingQuestion(question)
  const ref = useRef<HTMLElement>(null)

  // Bring a freshly added/replaced question into view — the highlight is otherwise
  // easy to miss when the canvas is scrolled away from the insertion point.
  useEffect(() => {
    if (isNew && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isNew])

  return (
    <motion.article
      ref={ref}
      className={`pc-pb-q-block pc-motion-surface${isNew ? ' is-new' : ''}${isReplacing ? ' is-replacing' : ''}${missing ? ' is-missing' : ''}`}
      layout
      initial={isNew ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={builderBlockEnter}
    >
      <div className="pc-pb-q-block-main">
        <span className="pc-pb-q-block-num pc-serif pc-num">Q{number}.</span>
        <div className="pc-pb-q-block-content">
          <div className="pc-pb-q-block-body">
            <PrintQuestionBody question={question} medium={paperMedium} />
          </div>
          {missing ? (
            <p className="pc-pb-q-block-missing-note">
              Unavailable in the repository — replace or remove before submitting.
            </p>
          ) : null}
          {!officialPreview && !missing ? (
          <div className="pc-pb-q-block-meta">
            <span className="pc-mono pc-pb-q-block-meta-id">
              {shortQuestionId(question.id)}
            </span>
            <span className="pc-tag is-outline">{question.type}</span>
            <span className="pc-pb-q-block-meta-chap">{question.chapter}</span>
            {question.topic ? (
              <span className="pc-pb-q-block-meta-topic">{question.topic}</span>
            ) : null}
            <DifficultyPips level={question.difficulty} />
            <span className="pc-pb-q-block-meta-diff">{difficultySummary(question.difficulty)}</span>
            <span className="pc-pb-q-block-meta-time pc-num">~{question.estimatedMinutes} min</span>
          </div>
          ) : null}
        </div>
        <div className="pc-pb-q-block-marks">
          <span className="pc-pb-q-block-marks-val pc-num">{question.marks}</span>
          <span className="pc-pb-q-block-marks-label">
            {formatMarksLabel(question.marks)}
          </span>
        </div>
      </div>

      {!readOnly ? (
      <div className="pc-pb-q-block-actions">
        <button type="button" className="pc-pb-q-action" onClick={onRemove}>
          <Trash2 size={11} strokeWidth={1.6} />
          Remove
        </button>
        {!missing ? (
          <>
            <button type="button" className="pc-pb-q-action" onClick={onReplace}>
              <RefreshCw size={11} strokeWidth={1.6} />
              Replace
            </button>
            <button
              type="button"
              className="pc-pb-q-action"
              disabled={!canMoveUp}
              onClick={onMoveUp}
            >
              <ArrowUp size={11} strokeWidth={1.6} />
              Up
            </button>
            <button
              type="button"
              className="pc-pb-q-action"
              disabled={!canMoveDown}
              onClick={onMoveDown}
            >
              <ArrowDown size={11} strokeWidth={1.6} />
              Down
            </button>
          </>
        ) : (
          <button type="button" className="pc-pb-q-action" onClick={onReplace}>
            <RefreshCw size={11} strokeWidth={1.6} />
            Replace
          </button>
        )}
      </div>
      ) : null}
    </motion.article>
  )
}
