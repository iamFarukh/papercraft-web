import {
  CLASS_LABELS,
  SUBJECT_LABELS,
  TYPE_LABELS,
} from '@/config/curriculum'
import { STATUS_META } from '@/lib/question-lifecycle'
import { paperFitLabel, type QuestionAuthorForm } from '@/lib/question-authoring'
import { DifficultyPips } from '@/components/repository/DifficultyPips'
import type { McqCorrectKey } from '@/types/question'

type AuthorPreviewPanelProps = {
  form: QuestionAuthorForm
}

const DIFF_NUM = { easy: 1, medium: 2, hard: 3 } as const

export function AuthorPreviewPanel({ form }: AuthorPreviewPanelProps) {
  const meta = STATUS_META[form.status]
  const { language } = form
  const showEn = language === 'english' || language === 'bilingual'
  const showHi = language === 'hindi' || language === 'bilingual'
  const diff = DIFF_NUM[form.difficulty]

  const stemEn =
    language === 'hindi' ? '' : form.questionText.trim()
  const stemHi = form.questionTextHi.trim()

  return (
    <aside className="pc-author-preview pc-scroll" aria-label="Preview and insights">
      <div className="pc-author-preview-card">
        <h3>Paper preview</h3>
        {language === 'hindi' ? (
          stemHi ? (
            <p className="pc-author-preview-q">{stemHi}</p>
          ) : (
            <p className="pc-author-preview-q" style={{ color: 'var(--pc-ink-4)' }}>
              Question text will appear here as you write…
            </p>
          )
        ) : language === 'english' ? (
          stemEn ? (
            <p className="pc-author-preview-q">{stemEn}</p>
          ) : (
            <p className="pc-author-preview-q" style={{ color: 'var(--pc-ink-4)' }}>
              Question text will appear here as you write…
            </p>
          )
        ) : stemEn || stemHi ? (
          <>
            {stemEn && <p className="pc-author-preview-q">{stemEn}</p>}
            {stemHi && <p className="pc-author-preview-hi">{stemHi}</p>}
          </>
        ) : (
          <p className="pc-author-preview-q" style={{ color: 'var(--pc-ink-4)' }}>
            Question text will appear here as you write…
          </p>
        )}

        {form.type === 'mcq' && (
          <div className="pc-author-preview-mcq">
            {(['a', 'b', 'c', 'd'] as McqCorrectKey[]).map((k) => {
              const en = showEn ? form.mcqOptions[k].trim() : ''
              const hi = showHi ? form.mcqOptionsHi[k].trim() : ''
              if (!en && !hi) return null
              return (
                <div
                  key={k}
                  className={
                    'pc-author-preview-mcq-opt' +
                    (form.mcqCorrect === k ? ' is-correct' : '')
                  }
                >
                  <span className="pc-author-preview-mcq-key">({k.toUpperCase()})</span>
                  <div>
                    {en && <div>{en}</div>}
                    {hi && (
                      <div className="pc-author-preview-hi" style={{ marginTop: en ? 2 : 0 }}>
                        {hi}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            fontSize: 11.5,
            color: 'var(--pc-ink-3)',
          }}
        >
          <span className="pc-tag is-ink">{TYPE_LABELS[form.type]}</span>
          <span className="pc-num">{form.marks} marks</span>
          <DifficultyPips level={diff} />
        </div>
      </div>

      <div className="pc-author-meta-label" style={{ marginBottom: 10 }}>
        Academic insights
      </div>

      <dl className="pc-author-insight">
        <dt>Metadata</dt>
        <dd>
          {CLASS_LABELS[form.classNumber]} ·{' '}
          {form.subjectName || SUBJECT_LABELS[form.subjectId] || '—'}
          <br />
          {form.chapterName || '—'} · {form.topicName || '—'}
        </dd>
      </dl>

      <dl className="pc-author-insight">
        <dt>Lifecycle</dt>
        <dd>
          <span className={`pc-tag ${meta.tone}`}>{meta.label}</span>
        </dd>
      </dl>

      <dl className="pc-author-insight">
        <dt>Estimated paper fit</dt>
        <dd>{paperFitLabel(form.marks, form.type)}</dd>
      </dl>

      <dl className="pc-author-insight">
        <dt>Readability</dt>
        <dd>
          {form.questionText.length > 280
            ? 'Long stem — consider splitting for younger classes'
            : form.questionText.length < 20
              ? 'Add more context for clarity'
              : 'Balanced length for examination use'}
        </dd>
      </dl>

      <dl className="pc-author-insight">
        <dt>Syllabus alignment</dt>
        <dd>
          Aligned to {form.chapterName || 'selected chapter'} ·{' '}
          {form.topicName?.trim() || '—'}
        </dd>
      </dl>
    </aside>
  )
}
