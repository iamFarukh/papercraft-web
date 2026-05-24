import { ChevronDown, ChevronUp, FileText, GripVertical, Layers } from 'lucide-react'
import { questionDisplayText } from '@/lib/paper-medium'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { EditSelection } from '@/types/paper-instance'
import type { PaperSectionId } from '@/lib/paper-builder'

type Props = {
  resolved: ResolvedPaper
  selection: EditSelection
  onSelect: (sel: EditSelection) => void
  onMoveSection: (sectionId: PaperSectionId, direction: 'up' | 'down') => void
  readOnly?: boolean
  /** Compact outline for the dedicated examination editor left column. */
  variant?: 'default' | 'embed'
}

export function PaperStructureNavigator({
  resolved,
  selection,
  onSelect,
  onMoveSection,
  readOnly,
  variant = 'default',
}: Props) {
  const sectionIds = resolved.sections.map((s) => s.id)

  return (
    <aside className={`pc-pe-nav pc-scroll${variant === 'embed' ? ' pc-pe-nav--embed' : ''}`}>
      <header className="pc-pe-nav-head">
        {variant === 'default' ? (
          <>
            <Layers size={14} strokeWidth={1.6} />
            <div className="pc-pe-nav-head-text">
              <h2 className="pc-pe-nav-title pc-serif">Outline</h2>
              <p className="pc-pe-nav-sub">
                <span className="pc-num">{resolved.stats.questionCount}</span> questions ·{' '}
                <span className="pc-num">{resolved.stats.totalMarks}</span> marks
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="pc-pe-nav-title">Outline</h2>
            <p className="pc-pe-nav-sub pc-pe-nav-sub--trailing">
              <span className="pc-num">{resolved.stats.questionCount}</span> Q ·{' '}
              <span className="pc-num">{resolved.stats.totalMarks}</span> m
            </p>
          </>
        )}
      </header>

      <button
        type="button"
        id="nav-paper"
        className={`pc-pe-nav-paper${selection.kind === 'paper' ? ' is-active' : ''}`}
        onClick={() => onSelect({ kind: 'paper' })}
      >
        <FileText size={14} strokeWidth={1.6} />
        <span>Examination</span>
      </button>

      <div className="pc-pe-nav-sections">
        {resolved.sections.map((section, si) => {
          const sectionActive =
            selection.kind === 'section' && selection.sectionId === section.id
          const hasSelectedChild =
            selection.kind === 'question' &&
            selection.sectionId === section.id

          return (
            <div
              key={section.id}
              className={`pc-pe-nav-section-group${hasSelectedChild ? ' has-child-active' : ''}`}
            >
              <div className={`pc-pe-nav-section${sectionActive ? ' is-active' : ''}`}>
                <span className="pc-pe-nav-grip" aria-hidden title="Reorder on paper">
                  <GripVertical size={12} strokeWidth={1.6} />
                </span>
                <button
                  type="button"
                  id={`nav-sec-${section.id}`}
                  className="pc-pe-nav-section-btn"
                  onClick={() => onSelect({ kind: 'section', sectionId: section.id })}
                >
                  <span className="pc-pe-nav-section-letter">Section {section.letter}</span>
                  <span className="pc-pe-nav-section-meta pc-num">
                    {section.questions.length}q ·{' '}
                    {section.questions.reduce((s, q) => s + q.effectiveMarks, 0)}m
                  </span>
                </button>
                {!readOnly ? (
                  <div className="pc-pe-nav-section-moves">
                    <button
                      type="button"
                      className="pc-pe-nav-move"
                      disabled={si === 0}
                      aria-label={`Move section ${section.letter} up`}
                      onClick={() => onMoveSection(section.id, 'up')}
                    >
                      <ChevronUp size={12} strokeWidth={1.6} />
                    </button>
                    <button
                      type="button"
                      className="pc-pe-nav-move"
                      disabled={si === sectionIds.length - 1}
                      aria-label={`Move section ${section.letter} down`}
                      onClick={() => onMoveSection(section.id, 'down')}
                    >
                      <ChevronDown size={12} strokeWidth={1.6} />
                    </button>
                  </div>
                ) : null}
              </div>

              <ul className="pc-pe-nav-questions">
                {section.questions.map((rq) => {
                  const active =
                    selection.kind === 'question' &&
                    selection.questionId === rq.question.id
                  return (
                    <li key={rq.question.id}>
                      <button
                        type="button"
                        id={`nav-q-${rq.question.id}`}
                        className={`pc-pe-nav-question${active ? ' is-active' : ''}`}
                        onClick={() =>
                          onSelect({
                            kind: 'question',
                            sectionId: section.id,
                            questionId: rq.question.id,
                          })
                        }
                      >
                        {rq.questionFormat.hasOverrides ? (
                          <span className="pc-pe-nav-fmt-dot" title="Format override" aria-hidden />
                        ) : null}
                        <span className="pc-num pc-pe-nav-q-num">Q{rq.displayNumber}</span>
                        <span
                          className={`pc-pe-nav-question-text${resolved.meta.medium === 'hindi' ? ' pc-print-is-hindi' : ''}`}
                        >
                          {(() => {
                            const label = questionDisplayText(rq.question, resolved.meta.medium)
                            return label.length > 42 ? `${label.slice(0, 42)}…` : label
                          })()}
                        </span>
                        <span className="pc-pe-nav-question-marks pc-num">
                          {rq.effectiveMarks}
                          {rq.effectiveMarks !== rq.repositoryMarks ? (
                            <span className="pc-pe-nav-override" title="Marks overridden">
                              ·
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
