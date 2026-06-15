import { TYPE_LABELS } from '@/config/curriculum'
import { RichTextEditor } from '@/components/authoring/RichTextEditor'
import type { QuestionAuthorForm } from '@/lib/question-authoring'
import type { McqCorrectKey, QuestionLanguage } from '@/types/question'

type AuthorCanvasProps = {
  form: QuestionAuthorForm
  onChange: (patch: Partial<QuestionAuthorForm>) => void
}

const MCQ_KEYS: McqCorrectKey[] = ['a', 'b', 'c', 'd']

function mediumFlags(language: QuestionLanguage) {
  return {
    english: language === 'english',
    hindi: language === 'hindi',
    bilingual: language === 'bilingual',
  }
}

export function AuthorCanvas({ form, onChange }: AuthorCanvasProps) {
  const { english, hindi, bilingual } = mediumFlags(form.language)

  return (
    <main className="pc-author-canvas pc-scroll" aria-label="Question authoring">
      <div className="pc-author-canvas-inner">
        <h2 className="pc-author-section-title">Authoring canvas</h2>
        <p className="pc-author-section-hint">
          Fields match the language you chose — English only, Hindi only, or both
          for bilingual papers.
        </p>

        {(english || bilingual) && (
          <div className="pc-author-write">
            <label htmlFor="author-question">
              {bilingual ? 'Question text (English)' : 'Question text'}
            </label>
            <RichTextEditor
              id="author-question"
              ariaLabel={bilingual ? 'Question text (English)' : 'Question text'}
              value={form.questionText}
              onChange={(html) => onChange({ questionText: html })}
            />
          </div>
        )}

        {(hindi || bilingual) && (
          <div className="pc-author-write">
            <label htmlFor="author-question-hi">
              {bilingual ? 'Question text (Hindi)' : 'Question text (Hindi medium)'}
            </label>
            <RichTextEditor
              id="author-question-hi"
              hindi
              ariaLabel={bilingual ? 'Question text (Hindi)' : 'Question text (Hindi medium)'}
              value={form.questionTextHi}
              onChange={(html) => onChange({ questionTextHi: html })}
            />
          </div>
        )}

        {form.type === 'mcq' && (
          <div className="pc-author-write">
            <label>Multiple choice options</label>
            <div className="pc-author-mcq-list">
              {MCQ_KEYS.map((key) => (
                <div key={key} className="pc-author-mcq-row">
                  <span className="pc-author-mcq-letter">{key.toUpperCase()}</span>
                  <div className="pc-author-mcq-fields">
                    {(english || bilingual) && (
                      <input
                        type="text"
                        className="pc-author-mcq-input"
                        value={form.mcqOptions[key]}
                        placeholder={
                          bilingual
                            ? `Option ${key.toUpperCase()} (English)`
                            : `Option ${key.toUpperCase()}`
                        }
                        onChange={(e) =>
                          onChange({
                            mcqOptions: {
                              ...form.mcqOptions,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                    {(hindi || bilingual) && (
                      <input
                        type="text"
                        className="pc-author-mcq-input is-hindi"
                        value={form.mcqOptionsHi[key]}
                        placeholder={
                          bilingual
                            ? `विकल्प ${key.toUpperCase()} (हिंदी)`
                            : `विकल्प ${key.toUpperCase()}`
                        }
                        onChange={(e) =>
                          onChange({
                            mcqOptionsHi: {
                              ...form.mcqOptionsHi,
                              [key]: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="pc-author-mcq-correct">
              <span>Correct answer</span>
              <select
                value={form.mcqCorrect}
                onChange={(e) =>
                  onChange({ mcqCorrect: e.target.value as McqCorrectKey })
                }
              >
                {MCQ_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {form.type === 'true_false' && (
          <div className="pc-author-write">
            <label>Correct response</label>
            <div className="pc-author-tf">
              <button
                type="button"
                className={
                  form.trueFalseAnswer === 'true' ? 'is-active' : undefined
                }
                onClick={() => onChange({ trueFalseAnswer: 'true' })}
              >
                {hindi && !english ? 'सही' : 'True'}
              </button>
              <button
                type="button"
                className={
                  form.trueFalseAnswer === 'false' ? 'is-active' : undefined
                }
                onClick={() => onChange({ trueFalseAnswer: 'false' })}
              >
                {hindi && !english ? 'गलत' : 'False'}
              </button>
            </div>
          </div>
        )}

        {(form.type === 'short' ||
          form.type === 'long' ||
          form.type === 'fill_blank') && (
          <>
            {(english || bilingual) && (
              <div className="pc-author-write">
                <label htmlFor="author-answer">
                  {form.type === 'fill_blank'
                    ? 'Accepted answer (English)'
                    : 'Model answer (English)'}
                </label>
                <RichTextEditor
                  id="author-answer"
                  compact
                  ariaLabel={
                    form.type === 'fill_blank'
                      ? 'Accepted answer (English)'
                      : 'Model answer (English)'
                  }
                  value={form.answer}
                  onChange={(html) => onChange({ answer: html })}
                />
              </div>
            )}
            {(hindi || bilingual) && (
              <div className="pc-author-write">
                <label htmlFor="author-answer-hi">
                  {form.type === 'fill_blank'
                    ? 'Accepted answer (Hindi)'
                    : 'Model answer (Hindi)'}
                </label>
                <RichTextEditor
                  id="author-answer-hi"
                  compact
                  hindi
                  ariaLabel={
                    form.type === 'fill_blank'
                      ? 'Accepted answer (Hindi)'
                      : 'Model answer (Hindi)'
                  }
                  value={form.answerHi}
                  onChange={(html) => onChange({ answerHi: html })}
                />
              </div>
            )}
          </>
        )}

        <div className="pc-author-write">
          <label htmlFor="author-solution">
            {bilingual ? 'Solution / marking notes (English)' : 'Solution / marking notes'}
          </label>
          <RichTextEditor
            id="author-solution"
            compact
            ariaLabel={
              bilingual ? 'Solution / marking notes (English)' : 'Solution / marking notes'
            }
            value={form.solution}
            onChange={(html) => onChange({ solution: html })}
          />
        </div>

        {bilingual && (
          <div className="pc-author-write">
            <label htmlFor="author-solution-hi">Solution / marking notes (Hindi)</label>
            <RichTextEditor
              id="author-solution-hi"
              compact
              hindi
              ariaLabel="Solution / marking notes (Hindi)"
              value={form.solutionHi}
              onChange={(html) => onChange({ solutionHi: html })}
            />
          </div>
        )}

        <p className="pc-author-section-hint" style={{ marginTop: 8 }}>
          Type · {TYPE_LABELS[form.type] ?? form.type} · {form.marks} mark
          {form.marks === 1 ? '' : 's'} ·{' '}
          {form.language === 'english'
            ? 'English medium'
            : form.language === 'hindi'
              ? 'Hindi medium'
              : 'Bilingual'}
        </p>
      </div>
    </main>
  )
}
