import {
  questionDisplayIsHindi,
  questionDisplayText,
  type PaperMedium,
} from '@/lib/paper-medium'
import type { QuestionRecord } from '@/types/question'

type Props = {
  question: QuestionRecord
  medium: PaperMedium
}

export function PrintQuestionBody({ question, medium }: Props) {
  const text = questionDisplayText(question, medium)
  const isHindi = questionDisplayIsHindi(medium)
  const isMcq = question.typeRaw === 'mcq' || question.type === 'MCQ'

  const options =
    medium === 'hindi' && question.mcqOptionsHi
      ? question.mcqOptionsHi
      : question.mcqOptions

  const optionsHi = medium === 'bilingual' ? question.mcqOptionsHi : undefined

  return (
    <div className={isHindi ? 'pc-print-is-hindi' : undefined}>
      {medium === 'bilingual' && question.bodyText?.trim() && question.hindi?.trim() ? (
        <>
          <p className="pc-print-question-text pc-serif">{question.bodyText.trim()}</p>
          <p className="pc-print-question-text pc-print-question-text--hi pc-serif">
            {question.hindi.trim()}
          </p>
        </>
      ) : (
        <p className="pc-print-question-text pc-serif">{text}</p>
      )}

      {isMcq && options ? (
        <div className="pc-print-mcq-grid">
          {(['a', 'b', 'c', 'd'] as const).map((key) => {
            const label = options[key]
            if (!label?.trim()) return null
            const hi = optionsHi?.[key]?.trim()
            return (
              <div key={key} className="pc-print-mcq-opt">
                <span className="pc-print-mcq-key">({key})</span>{' '}
                <span>{label}</span>
                {medium === 'bilingual' && hi ? (
                  <span className="pc-print-mcq-opt-hi pc-print-is-hindi"> / {hi}</span>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
