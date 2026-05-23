import { Plus, RefreshCw } from 'lucide-react'
import { DifficultyPips } from '@/components/repository/DifficultyPips'
import { shortQuestionId } from '@/lib/paper-builder'
import type { QuestionRecord } from '@/types/question'

type Props = {
  question: QuestionRecord
  used: boolean
  compatible?: boolean
  replaceMode?: boolean
  onAdd: () => void
}

export function BuilderMiniQuestionCard({
  question,
  used,
  compatible,
  replaceMode,
  onAdd,
}: Props) {
  const showReplace = replaceMode && compatible && !used

  return (
    <article
      className={[
        'pc-pb-mini-card',
        used ? 'is-used' : '',
        compatible ? 'is-compatible' : '',
        showReplace ? 'is-replace-pick' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pc-pb-mini-card-head">
        <span className="pc-pb-mini-card-id">{shortQuestionId(question.id)}</span>
        <span className="pc-tag is-outline" style={{ height: 17, fontSize: 9.5, padding: '0 5px' }}>
          {question.chapter}
        </span>
        {compatible ? (
          <span className="pc-tag is-primary" style={{ height: 17, fontSize: 9.5 }}>
            match
          </span>
        ) : null}
        <span className="pc-pb-mini-card-marks">
          <span className="pc-num" style={{ color: 'var(--pc-ink-2)', fontWeight: 500 }}>
            {question.marks}
          </span>
          <span style={{ color: 'var(--pc-ink-4)' }}>m</span>
        </span>
      </div>
      <p className="pc-pb-mini-card-body">{question.bodyText}</p>
      <div className="pc-pb-mini-card-foot">
        <span className="pc-pb-mini-card-type">{question.type}</span>
        <DifficultyPips level={question.difficulty} />
        <span className="pc-pb-mini-card-time">~{question.estimatedMinutes}m</span>
        {showReplace ? (
          <button
            type="button"
            className="pc-pb-mini-add is-replace"
            aria-label="Use as replacement"
            onClick={onAdd}
          >
            <RefreshCw size={11} strokeWidth={2} />
          </button>
        ) : used ? (
          <span className="pc-tag is-success" style={{ height: 17, fontSize: 9.5 }}>
            added
          </span>
        ) : (
          <button
            type="button"
            className="pc-pb-mini-add"
            aria-label="Add to paper"
            onClick={onAdd}
          >
            <Plus size={11} strokeWidth={2} />
          </button>
        )}
      </div>
    </article>
  )
}
