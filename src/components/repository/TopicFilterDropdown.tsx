import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, Search } from 'lucide-react'
import { AnimatePresence, m } from 'framer-motion'
import { AnimatedChevron } from '@/components/motion'
import { dropdownReveal } from '@/lib/motion/variants'
import type { ChapterTreeNode } from '@/lib/repository-filter-tree'
import { isFilterOn } from '@/lib/repository-filter-cascade'

type TopicFilterDropdownProps = {
  classLabel: string
  subject: string
  chapters: ChapterTreeNode[]
  chapterFilters: Record<string, boolean>
  counts: Record<string, number>
  chapterKey: (chapter: string) => string
  onToggleChapter: (chapter: string) => void
  onToggleAll: (chapterKeys: string[], on: boolean) => void
}

export function TopicFilterDropdown({
  classLabel,
  subject,
  chapters,
  chapterFilters,
  counts,
  chapterKey,
  onToggleChapter,
  onToggleAll,
}: TopicFilterDropdownProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      q
        ? chapters.filter((ch) => ch.chapter.toLowerCase().includes(q))
        : chapters,
    [chapters, q],
  )

  const activeCount = chapters.filter((ch) =>
    isFilterOn(chapterFilters, chapterKey(ch.chapter)),
  ).length
  const allOn = activeCount === chapters.length && chapters.length > 0
  const noneOn = activeCount === 0

  const summary =
    chapters.length === 0
      ? 'No topics'
      : allOn
        ? `All topics (${chapters.length})`
        : noneOn
          ? 'No topics selected'
          : `${activeCount} of ${chapters.length} topics`

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="pc-repo-topic-filter" ref={rootRef}>
      <span className="pc-repo-topic-filter-kicker">
        {classLabel} · {subject}
      </span>
      <button
        type="button"
        className={'pc-repo-topic-filter-trigger' + (open ? ' is-open' : '')}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
      >
        <span className="pc-repo-topic-filter-summary">{summary}</span>
        <AnimatedChevron open={open} flip className="pc-repo-topic-filter-chevron" />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <m.div
            className="pc-repo-topic-filter-menu"
            id={listId}
            role="listbox"
            variants={dropdownReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
          <div className="pc-repo-topic-filter-search">
            <Search size={13} strokeWidth={1.6} />
            <input
              type="search"
              placeholder="Search topics…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="pc-repo-topic-filter-actions">
            <button
              type="button"
              className="pc-repo-topic-filter-action"
              onClick={() => onToggleAll(chapters.map((c) => chapterKey(c.chapter)), true)}
            >
              Select all
            </button>
            <button
              type="button"
              className="pc-repo-topic-filter-action"
              onClick={() => onToggleAll(chapters.map((c) => chapterKey(c.chapter)), false)}
            >
              Clear
            </button>
          </div>
          <ul className="pc-repo-topic-filter-list pc-scroll">
            {filtered.length === 0 ? (
              <li className="pc-repo-topic-filter-empty">No matching topics</li>
            ) : (
              filtered.map((ch) => {
                const scopedKey = chapterKey(ch.chapter)
                const on = isFilterOn(chapterFilters, scopedKey)
                return (
                  <li key={ch.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      className={'pc-repo-topic-filter-option' + (on ? ' is-on' : '')}
                      onClick={() => onToggleChapter(ch.chapter)}
                    >
                      <span
                        className="pc-repo-topic-filter-check"
                        aria-hidden
                      >
                        {on ? <Check size={12} strokeWidth={2} /> : null}
                      </span>
                      <span className="pc-repo-topic-filter-label">
                        {ch.chapter}
                      </span>
                      <span className="pc-repo-topic-filter-count pc-num">
                        {counts[scopedKey] ?? ch.count}
                      </span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
