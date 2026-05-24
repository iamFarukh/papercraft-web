import { Search, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BuilderMiniQuestionCard } from './BuilderMiniQuestionCard'
import { SectionSwitcher } from './SectionSwitcher'
import {
  difficultySummary,
  isCompatibleReplacement,
  questionNumberInPaper,
  type PaperComposition,
  type PaperSectionDef,
  type PaperSectionId,
  type ReplaceTarget,
} from '@/lib/paper-builder'
import type { ScoredQuestion } from '@/lib/paper-generation-engine'
import type { PaperMedium } from '@/lib/paper-medium'
import type { QuestionRecord } from '@/types/question'

export type BuilderQuickFilters = {
  classLabel: string | null
  subject: string | null
  chapter: string | null
  marksBand: 'any' | '1' | '3' | '5'
  difficultyBand: 'any' | 'easy' | 'med-hard'
}

type Props = {
  query: string
  onQueryChange: (q: string) => void
  filters: BuilderQuickFilters
  onToggleClass: (label: string) => void
  onToggleSubject: (label: string) => void
  onToggleChapter: (chapter: string) => void
  onToggleMarks: (band: BuilderQuickFilters['marksBand']) => void
  onToggleDifficulty: (band: BuilderQuickFilters['difficultyBand']) => void
  classOptions: string[]
  subjectOptions: string[]
  chapterOptions: string[]
  questions: QuestionRecord[]
  usedIds: Set<string>
  loading: boolean
  activeSection: PaperSectionId
  sections: PaperSectionDef[]
  composition: PaperComposition
  onSelectSection: (id: PaperSectionId) => void
  replaceTarget: ReplaceTarget | null
  onCancelReplace: () => void
  onAdd: (question: QuestionRecord) => void
  onReplaceWith: (question: QuestionRecord) => void
  replacementSuggestions?: ScoredQuestion[]
  onApplySuggestion?: (question: QuestionRecord) => void
  contextLabel?: string
  compositionForNumbering?: PaperComposition
  sectionsForNumbering?: PaperSectionDef[]
  readOnly?: boolean
  paperMedium?: PaperMedium
}

function QuickFilter({
  label,
  value,
  count,
  active,
  onClick,
}: {
  label?: string
  value: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`pc-pb-quick-filter${active ? ' is-active' : ''}`}
      onClick={onClick}
    >
      {label ? <span className="pc-pb-quick-filter-key">{label}</span> : null}
      {value}
      {count != null ? (
        <span className="pc-pb-quick-filter-count pc-num">· {count}</span>
      ) : null}
    </button>
  )
}

export function BuilderRepoBrowser({
  query,
  onQueryChange,
  filters,
  onToggleClass,
  onToggleSubject,
  onToggleChapter,
  onToggleMarks,
  onToggleDifficulty,
  classOptions,
  subjectOptions,
  chapterOptions,
  questions,
  usedIds,
  loading,
  activeSection,
  sections,
  composition,
  onSelectSection,
  replaceTarget,
  onCancelReplace,
  onAdd,
  onReplaceWith,
  replacementSuggestions = [],
  onApplySuggestion,
  contextLabel,
  compositionForNumbering,
  sectionsForNumbering,
  readOnly = false,
  paperMedium = 'english',
}: Props) {
  const listRef = useRef<HTMLDivElement>(null)
  const activeSectionDef = sections.find((s) => s.id === activeSection)

  const replaceNum =
    replaceTarget && compositionForNumbering && sectionsForNumbering
      ? questionNumberInPaper(
          compositionForNumbering,
          replaceTarget.sectionId,
          replaceTarget.questionId,
          sectionsForNumbering,
        )
      : 0

  useEffect(() => {
    if (replaceTarget) listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [replaceTarget])

  if (readOnly) {
    return (
      <aside className="pc-pb-browser is-locked">
        <div className="pc-pb-browser-locked">
          <span className="pc-pb-browser-label">Repository</span>
          <p className="pc-pb-browser-locked-title pc-serif">Composition locked</p>
          <p className="pc-pb-browser-locked-copy">
            This paper has been submitted. Question changes are disabled while it awaits
            approval.
          </p>
          <Link to="/app/repository" className="pc-pb-browser-open">
            Browse repository
          </Link>
        </div>
      </aside>
    )
  }

  return (
    <aside className={`pc-pb-browser${replaceTarget ? ' is-replace-mode' : ''}`}>
      <div className="pc-pb-browser-head">
        <div className="pc-pb-browser-head-row">
          <span className="pc-pb-browser-label">Repository</span>
          <Link to="/app/repository" className="pc-pb-browser-open">
            Open
          </Link>
        </div>
        {contextLabel ? (
          <p className="pc-pb-browser-context">{contextLabel}</p>
        ) : null}

        {replaceTarget ? (
          <div className="pc-pb-replace-banner">
            <div>
              <strong>Replace Q{replaceNum}</strong>
              <span>
                Pick a question with {replaceTarget.source.marks} marks ·{' '}
                {replaceTarget.source.type} ·{' '}
                {difficultySummary(replaceTarget.source.difficulty)}
              </span>
            </div>
            <button
              type="button"
              className="pc-pb-replace-cancel"
              onClick={onCancelReplace}
              aria-label="Cancel replace"
            >
              <X size={14} strokeWidth={1.6} />
            </button>
          </div>
        ) : null}

        {replaceTarget && replacementSuggestions.length > 0 ? (
          <div className="pc-pb-replace-suggestions">
            <span className="pc-pb-replace-suggestions-label">Suggested replacements</span>
            <ul className="pc-pb-replace-suggestions-list">
              {replacementSuggestions.map(({ question, fitnessScore, reasons }) => (
                <li key={question.id}>
                  <button
                    type="button"
                    className="pc-pb-replace-suggestion"
                    onClick={() => onApplySuggestion?.(question)}
                  >
                    <span className="pc-num pc-pb-replace-suggestion-fit">{fitnessScore}%</span>
                    <span className="pc-pb-replace-suggestion-ch">{question.chapter}</span>
                    <span className="pc-pb-replace-suggestion-meta">
                      {question.marks}m · {reasons[0] ?? question.type}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!replaceTarget ? (
          <>
            <p className="pc-pb-browser-target">
              Adding to <strong>Section {activeSection}</strong>
              {activeSectionDef ? (
                <span className="pc-pb-browser-target-sub">
                  {' '}
                  · {activeSectionDef.name.split(' · ')[0]}
                </span>
              ) : null}
            </p>
            <SectionSwitcher
              sections={sections}
              composition={composition}
              activeSection={activeSection}
              onSelect={onSelectSection}
            />
          </>
        ) : null}

        <div className="pc-pb-browser-search">
          <Search size={13} strokeWidth={1.6} className="pc-pb-browser-search-icon" />
          <input
            type="search"
            placeholder="Search questions…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search repository questions"
          />
        </div>

        <div className="pc-pb-quick-filters">
          {filters.classLabel ? (
            <QuickFilter
              label="Class:"
              value={filters.classLabel.replace('Class ', '')}
              active
              onClick={() => onToggleClass(filters.classLabel!)}
            />
          ) : null}
          {filters.subject ? (
            <QuickFilter
              label="Subject:"
              value={filters.subject === 'Mathematics' ? 'Math' : filters.subject}
              active
              onClick={() => onToggleSubject(filters.subject!)}
            />
          ) : null}
          {chapterOptions.slice(0, 2).map((ch) => (
            <QuickFilter
              key={ch}
              value={ch.length > 14 ? `${ch.slice(0, 12)}…` : ch}
              active={filters.chapter === ch}
              onClick={() => onToggleChapter(ch)}
            />
          ))}
          <QuickFilter
            label="Marks:"
            value={filters.marksBand === 'any' ? 'Any' : `${filters.marksBand}m`}
            active={filters.marksBand !== 'any'}
            onClick={() =>
              onToggleMarks(
                filters.marksBand === 'any'
                  ? (String(activeSectionDef?.marksEach ?? 3) as BuilderQuickFilters['marksBand'])
                  : 'any',
              )
            }
          />
          <QuickFilter
            label="Diff:"
            value={filters.difficultyBand === 'any' ? 'Any' : 'Med + Hard'}
            active={filters.difficultyBand !== 'any'}
            onClick={() =>
              onToggleDifficulty(filters.difficultyBand === 'any' ? 'med-hard' : 'any')
            }
          />
        </div>
      </div>

      <div className="pc-pb-browser-meta">
        <span className="pc-pb-browser-meta-count">
          {loading ? 'Loading…' : `${questions.length} results`}
        </span>
        <span className="pc-pb-browser-meta-line" />
        <span className="pc-pb-browser-meta-sort">Sort · Recent</span>
      </div>

      <div ref={listRef} className="pc-pb-browser-list pc-scroll">
        {loading && questions.length === 0 ? (
          <p className="pc-pb-browser-loading">Loading questions…</p>
        ) : questions.length === 0 ? (
          <p className="pc-pb-browser-empty">No questions match these filters.</p>
        ) : (
          questions.map((q) => {
            const compatible = replaceTarget
              ? isCompatibleReplacement(replaceTarget.source, q) && !usedIds.has(q.id)
              : false
            const used = usedIds.has(q.id)

            return (
              <BuilderMiniQuestionCard
                key={q.id}
                question={q}
                paperMedium={paperMedium}
                used={used && !compatible}
                compatible={compatible}
                replaceMode={!!replaceTarget}
                onAdd={() => (replaceTarget ? onReplaceWith(q) : onAdd(q))}
              />
            )
          })
        )}
      </div>
    </aside>
  )
}
