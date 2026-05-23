import { Plus, Sparkles } from 'lucide-react'
import {
  buildGlobalQuestionNumbers,
  computeSectionSummary,
  flattenPaperQuestions,
  type PaperComposition,
  type PaperMeta,
  type PaperSectionDef,
  type PaperSectionId,
  type ReplaceTarget,
} from '@/lib/paper-builder'
import type { PaperMedium } from '@/lib/paper-medium'
import type { QuestionRecord } from '@/types/question'
import { PaperQuestionBlock } from './PaperQuestionBlock'

type Props = {
  meta: PaperMeta
  sections: PaperSectionDef[]
  generalInstructions?: string
  composition: PaperComposition
  activeSection: PaperSectionId
  replaceTarget: ReplaceTarget | null
  lastInsertedId: string | null
  onSelectSection: (id: PaperSectionId) => void
  onRemove: (sectionId: PaperSectionId, questionId: string) => void
  onReplace: (sectionId: PaperSectionId, question: QuestionRecord) => void
  onMove: (sectionId: PaperSectionId, questionId: string, direction: 'up' | 'down') => void
  onFocusRepository?: () => void
  readOnly?: boolean
  /** Print-style review: no builder chrome, metadata, or empty-state CTAs */
  officialPreview?: boolean
  paperMedium?: PaperMedium
}

export function PaperCompositionCanvas({
  meta,
  sections,
  generalInstructions,
  composition,
  activeSection,
  replaceTarget,
  lastInsertedId,
  onSelectSection,
  onRemove,
  onReplace,
  onMove,
  onFocusRepository,
  readOnly = false,
  officialPreview = false,
  paperMedium = 'english',
}: Props) {
  const preview = officialPreview || readOnly
  const flat = flattenPaperQuestions(composition, sections)
  const isEmpty = flat.length === 0
  const questionNumbers = buildGlobalQuestionNumbers(composition, sections)

  return (
    <main
      className={`pc-pb-canvas-wrap pc-dots${readOnly ? ' is-read-only' : ''}${officialPreview ? ' is-official-preview' : ''}`}
    >
      <div className="pc-paper pc-pb-canvas-sheet">
        <header className="pc-pb-paper-header">
          <div className="pc-pb-school-mark" aria-hidden>
            <svg viewBox="0 0 40 40" width="36" height="36">
              <path
                d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z"
                fill="none"
                stroke="#15161A"
                strokeWidth="1.2"
              />
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fontFamily="Newsreader, serif"
                fontSize="13"
                fontStyle="italic"
                fill="#15161A"
              >
                S
              </text>
            </svg>
          </div>
          <div className="pc-pb-school-name">{meta.schoolName}</div>
          <div className="pc-pb-school-tag">{meta.schoolTagline}</div>
          <div className="pc-pb-exam-title-row">
            <span className="pc-pb-exam-title-rule" />
            <span className="pc-pb-exam-title">{meta.title}</span>
            <span className="pc-pb-exam-title-rule" />
          </div>
          <div className="pc-pb-exam-meta">
            <span>
              <strong>Class</strong> {meta.classLabel}
            </span>
            <span>
              <strong>Subject</strong> {meta.subject}
            </span>
            <span>
              <strong>Time</strong> {meta.durationLabel}
            </span>
            <span>
              <strong>Max marks</strong> {meta.totalMarks}
            </span>
          </div>
        </header>

        <div className="pc-pb-instructions">
          <div className="pc-pb-instructions-title">General Instructions</div>
          {generalInstructions?.trim() ? (
            <p className="pc-pb-instructions-custom">{generalInstructions.trim()}</p>
          ) : (
            <ol>
              <li>All questions are compulsory. The paper consists of {sections.length} section(s).</li>
              <li>Use of calculators is not permitted unless stated otherwise.</li>
            </ol>
          )}
        </div>

        {sections.map((section) => {
          const items = composition[section.id]
          const summary = computeSectionSummary(items)
          const isActive = activeSection === section.id

          return (
            <section
              key={section.id}
              className={`pc-pb-section${!preview && isActive ? ' is-active' : ''}`}
            >
              <div
                className="pc-pb-section-head"
                role={preview ? undefined : 'button'}
                tabIndex={preview ? undefined : 0}
                onClick={preview ? undefined : () => onSelectSection(section.id)}
                onKeyDown={
                  preview
                    ? undefined
                    : (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onSelectSection(section.id)
                        }
                      }
                }
              >
                <h3 className="pc-pb-section-title">
                  Section {section.letter}{' '}
                  <em>· {section.name.split(' · ')[0]}</em>
                  {!preview && isActive ? (
                    <span className="pc-pb-section-active-pill">Active</span>
                  ) : null}
                </h3>
                {!officialPreview ? (
                  <span className="pc-pb-section-meta">
                    <span className="pc-num">{summary.questionCount}</span> questions ·{' '}
                    <span className="pc-num">{summary.totalMarks}</span> marks
                  </span>
                ) : null}
              </div>

              <p className="pc-pb-section-instructions">{section.instructions}</p>

              {!officialPreview ? (
                <div className="pc-pb-section-summary">
                  <span>
                    <span className="pc-num">{summary.questionCount}</span> questions
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    <span className="pc-num">{summary.totalMarks}</span> marks
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    ~<span className="pc-num">{summary.estimatedMinutes}</span> min
                  </span>
                </div>
              ) : null}

              {items.length === 0 ? (
                <div className="pc-pb-section-empty">
                  <p className="pc-pb-section-empty-text">
                    {officialPreview
                      ? 'No questions in this section.'
                      : 'Add questions from the repository to begin composing this section.'}
                  </p>
                  {!officialPreview ? (
                    <p className="pc-pb-section-empty-hint">{section.emptyHint}</p>
                  ) : null}
                  {!preview && isActive ? (
                    <button
                      type="button"
                      className="pc-btn is-sm"
                      onClick={onFocusRepository}
                    >
                      <Plus size={11} strokeWidth={2} />
                      Add question
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="pc-pb-q-list">
                  {items.map((q, idx) => (
                    <PaperQuestionBlock
                      key={q.id}
                      question={q}
                      number={questionNumbers.get(q.id) ?? idx + 1}
                      isNew={q.id === lastInsertedId}
                      isReplacing={
                        replaceTarget?.sectionId === section.id &&
                        replaceTarget.questionId === q.id
                      }
                      canMoveUp={idx > 0}
                      canMoveDown={idx < items.length - 1}
                      onRemove={() => onRemove(section.id, q.id)}
                      onReplace={() => onReplace(section.id, q)}
                      readOnly={readOnly}
                      officialPreview={officialPreview}
                      paperMedium={paperMedium}
                      onMoveUp={() => onMove(section.id, q.id, 'up')}
                      onMoveDown={() => onMove(section.id, q.id, 'down')}
                    />
                  ))}
                </div>
              )}

              {!preview && isActive && items.length > 0 ? (
                <p className="pc-pb-section-add-hint">
                  New questions from the repository insert into Section {section.letter}.
                </p>
              ) : null}
            </section>
          )
        })}

        {isEmpty && !officialPreview ? (
          <div className="pc-pb-empty-cta">
            <Sparkles size={18} strokeWidth={1.6} className="pc-pb-empty-cta-icon" />
            <h4 className="pc-pb-empty-cta-title">Compose your examination paper</h4>
            <p className="pc-pb-empty-cta-copy">
              Select a section, then add questions from the repository on the left. Use
              Replace, Up, and Down on each question to refine the paper.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}
