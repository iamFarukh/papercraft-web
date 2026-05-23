import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import {
  DIFFICULTY_LABELS,
  type RepositoryFilters,
} from '@/lib/repository-workspace'
import {
  buildCurriculumTree,
  matchesFilterSearch,
  type ClassTreeNode,
} from '@/lib/repository-filter-tree'
import {
  classTriState,
  isFilterOn,
  subjectTriState,
  type SyllabusToggleTarget,
  type TriState,
} from '@/lib/repository-filter-cascade'
import type { QuestionRecord } from '@/types/question'

type FilterRowProps = {
  label: string
  count?: number
  state?: TriState
  swatch?: string
  indent?: number
  onToggle: () => void
}

function FilterRow({
  label,
  count,
  state = 'off',
  swatch,
  indent = 0,
  onToggle,
}: FilterRowProps) {
  const checked = state === 'on'
  const indeterminate = state === 'mixed'

  return (
    <label
      className={
        'pc-repo-filter-row' +
        (checked ? ' is-checked' : '') +
        (indeterminate ? ' is-indeterminate' : '')
      }
      style={{ paddingLeft: 6 + indent * 14 }}
    >
      <input
        type="checkbox"
        className="pc-repo-filter-checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = indeterminate
        }}
        onChange={onToggle}
      />
      {swatch && (
        <span className="pc-repo-filter-swatch" style={{ background: swatch }} />
      )}
      <span className="pc-repo-filter-row-label">{label}</span>
      {count !== undefined && (
        <span className="pc-repo-filter-count pc-num">{count}</span>
      )}
    </label>
  )
}

function CollapseSection({
  title,
  meta,
  defaultOpen = true,
  children,
}: {
  title: string
  meta?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="pc-repo-filter-section">
      <button
        type="button"
        className="pc-repo-filter-section-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? (
          <ChevronDown size={14} strokeWidth={1.6} />
        ) : (
          <ChevronRight size={14} strokeWidth={1.6} />
        )}
        <span>{title}</span>
        {meta && <span className="pc-repo-filter-section-meta">{meta}</span>}
      </button>
      {open && <div className="pc-repo-filter-section-body">{children}</div>}
    </section>
  )
}

const DIFFICULTY_SWATCH: Record<string, string> = {
  Easy: 'var(--pc-success)',
  Medium: 'var(--pc-primary)',
  Hard: 'var(--pc-warning)',
}

type FilterPanelProps = {
  questions: QuestionRecord[]
  filters: RepositoryFilters
  counts: {
    classes: Record<string, number>
    subjects: Record<string, number>
    chapters: Record<string, number>
    difficulty: Record<string, number>
    types: Record<string, number>
    statuses: Record<string, number>
  }
  isAdmin?: boolean
  onToggle: (group: keyof RepositoryFilters, key: string) => void
  onSyllabusToggle: (target: SyllabusToggleTarget) => void
  onReset: () => void
}

export function FilterPanel({
  questions,
  filters,
  counts,
  isAdmin = false,
  onToggle,
  onSyllabusToggle,
  onReset,
}: FilterPanelProps) {
  const [syllabusSearch, setSyllabusSearch] = useState('')
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(() => new Set())
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(() => new Set())

  /** Full syllabus tree — never hide options when a class/subject is unchecked. */
  const tree = useMemo(() => buildCurriculumTree(questions), [questions])
  const didAutoExpand = useRef(false)

  useEffect(() => {
    if (didAutoExpand.current || tree.length === 0) return
    didAutoExpand.current = true
    const first = tree[0]!
    setExpandedClasses(new Set([first.classLabel]))
    if (first.subjects[0]) {
      setExpandedSubjects(new Set([first.subjects[0]!.key]))
    }
  }, [tree])

  const search = syllabusSearch.trim().toLowerCase()

  const filteredTree = useMemo(() => {
    if (!search) return tree
    return tree
      .map((cls) => {
        const subjects = cls.subjects
          .map((sub) => {
            const chapters = sub.chapters.filter(
              (ch) =>
                matchesFilterSearch(ch.chapter, search) ||
                matchesFilterSearch(sub.subject, search) ||
                matchesFilterSearch(cls.classLabel, search),
            )
            if (chapters.length === 0 && !matchesFilterSearch(sub.subject, search)) {
              return null
            }
            return { ...sub, chapters }
          })
          .filter(Boolean) as ClassTreeNode['subjects']
        if (subjects.length === 0 && !matchesFilterSearch(cls.classLabel, search)) {
          return null
        }
        return { ...cls, subjects }
      })
      .filter(Boolean) as ClassTreeNode[]
  }, [tree, search])

  const activeSummary = useMemo(() => {
    const parts: string[] = []
    const classKeys = Object.keys(filters.classes)
    const classOn = classKeys.filter((k) => isFilterOn(filters.classes, k)).length
    if (classOn > 0 && classOn < classKeys.length) {
      parts.push(`${classOn} classes`)
    }
    const chKeys = Object.keys(filters.chapters)
    const chOn = chKeys.filter((k) => isFilterOn(filters.chapters, k)).length
    if (chOn > 0 && chOn < chKeys.length) {
      parts.push(`${chOn} chapters`)
    }
    return parts.length ? parts.join(' · ') : 'All syllabus'
  }, [filters])

  function toggleClassExpand(classLabel: string) {
    setExpandedClasses((prev) => {
      const next = new Set(prev)
      if (next.has(classLabel)) next.delete(classLabel)
      else next.add(classLabel)
      return next
    })
  }

  function toggleSubjectExpand(key: string) {
    setExpandedSubjects((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function ensureExpanded(classLabel: string, subjectKey: string) {
    setExpandedClasses((prev) => new Set(prev).add(classLabel))
    setExpandedSubjects((prev) => new Set(prev).add(subjectKey))
  }

  return (
    <aside className="pc-repo-filters pc-scroll" aria-label="Filters">
      <div className="pc-repo-filters-intro">
        <div>
          <span className="pc-repo-filters-title">Smart filters</span>
          <span className="pc-repo-filters-sub">{activeSummary}</span>
        </div>
        <button type="button" className="pc-repo-filters-reset" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="pc-repo-filter-search">
        <Search size={14} strokeWidth={1.6} />
        <input
          type="search"
          placeholder="Search class, subject, chapter…"
          value={syllabusSearch}
          onChange={(e) => setSyllabusSearch(e.target.value)}
        />
      </div>

      <CollapseSection
        title="Syllabus"
        meta={`${filteredTree.length} classes`}
        defaultOpen
      >
        {filteredTree.length === 0 ? (
          <p className="pc-repo-filter-empty">No matches in loaded questions.</p>
        ) : (
          <div className="pc-repo-filter-tree">
            {filteredTree.map((cls) => {
              const classOpen =
                expandedClasses.has(cls.classLabel) || search.length > 0
              const clsState = classTriState(cls, filters)

              return (
                <div key={cls.key} className="pc-repo-filter-tree-class">
                  <div className="pc-repo-filter-tree-row">
                    <button
                      type="button"
                      className="pc-repo-filter-tree-chevron"
                      onClick={() => toggleClassExpand(cls.classLabel)}
                      aria-label={classOpen ? 'Collapse' : 'Expand'}
                    >
                      {classOpen ? (
                        <ChevronDown size={13} strokeWidth={1.6} />
                      ) : (
                        <ChevronRight size={13} strokeWidth={1.6} />
                      )}
                    </button>
                    <FilterRow
                      label={cls.classLabel}
                      count={counts.classes[cls.classLabel] ?? cls.count}
                      state={clsState}
                      onToggle={() =>
                        onSyllabusToggle({
                          level: 'class',
                          classLabel: cls.classLabel,
                        })
                      }
                    />
                  </div>

                  {classOpen &&
                    cls.subjects.map((sub) => {
                      const subOpen =
                        expandedSubjects.has(sub.key) || search.length > 0
                      const subState = subjectTriState(sub, filters)

                      return (
                        <div key={sub.key} className="pc-repo-filter-tree-subject">
                          <div className="pc-repo-filter-tree-row">
                            <button
                              type="button"
                              className="pc-repo-filter-tree-chevron"
                              onClick={() => toggleSubjectExpand(sub.key)}
                              aria-label={subOpen ? 'Collapse' : 'Expand'}
                            >
                              {subOpen ? (
                                <ChevronDown size={12} strokeWidth={1.6} />
                              ) : (
                                <ChevronRight size={12} strokeWidth={1.6} />
                              )}
                            </button>
                            <FilterRow
                              label={sub.subject}
                              count={counts.subjects[sub.subject] ?? sub.count}
                              state={subState}
                              indent={1}
                              onToggle={() => {
                                ensureExpanded(cls.classLabel, sub.key)
                                onSyllabusToggle({
                                  level: 'subject',
                                  classLabel: cls.classLabel,
                                  subject: sub.subject,
                                })
                              }}
                            />
                          </div>

                          {subOpen &&
                            sub.chapters.map((ch) => (
                              <FilterRow
                                key={`${sub.key}|${ch.key}`}
                                label={ch.chapter}
                                count={counts.chapters[ch.chapter] ?? ch.count}
                                state={
                                  isFilterOn(filters.chapters, ch.chapter)
                                    ? 'on'
                                    : 'off'
                                }
                                indent={2}
                                onToggle={() => {
                                  ensureExpanded(cls.classLabel, sub.key)
                                  onSyllabusToggle({
                                    level: 'chapter',
                                    classLabel: cls.classLabel,
                                    subject: sub.subject,
                                    chapter: ch.chapter,
                                  })
                                }}
                              />
                            ))}
                        </div>
                      )
                    })}
                </div>
              )
            })}
          </div>
        )}
      </CollapseSection>

      <CollapseSection title="Difficulty" defaultOpen={false}>
        <div className="pc-repo-filter-chips">
          {DIFFICULTY_LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={
                'pc-repo-filter-chip' +
                (filters.difficulty[label] ? ' is-on' : '')
              }
              onClick={() => onToggle('difficulty', label)}
            >
              <span
                className="pc-repo-filter-chip-dot"
                style={{ background: DIFFICULTY_SWATCH[label] }}
              />
              {label}
              <span className="pc-num">{counts.difficulty[label] ?? 0}</span>
            </button>
          ))}
        </div>
      </CollapseSection>

      <CollapseSection title="Question type" defaultOpen={false}>
        <div className="pc-repo-filter-options pc-repo-filter-options--compact">
          {Object.keys(filters.types)
            .sort()
            .map((label) => (
              <FilterRow
                key={label}
                label={label}
                count={counts.types[label] ?? 0}
                state={filters.types[label] ? 'on' : 'off'}
                onToggle={() => onToggle('types', label)}
              />
            ))}
        </div>
      </CollapseSection>

      {isAdmin && Object.keys(filters.statuses).length > 0 && (
        <CollapseSection title="Status" defaultOpen={false}>
          <div className="pc-repo-filter-chips">
            {Object.keys(filters.statuses)
              .sort()
              .map((label) => (
                <button
                  key={label}
                  type="button"
                  className={
                    'pc-repo-filter-chip' +
                    (filters.statuses[label] ? ' is-on' : '')
                  }
                  onClick={() => onToggle('statuses', label)}
                >
                  {label}
                  <span className="pc-num">{counts.statuses[label] ?? 0}</span>
                </button>
              ))}
          </div>
        </CollapseSection>
      )}

      {!isAdmin && (
        <p className="pc-repo-filters-teacher-note">
          Showing published questions only.
        </p>
      )}
    </aside>
  )
}
