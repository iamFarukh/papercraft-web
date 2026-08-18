import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { MotionModal } from '@/components/motion/MotionModal'
import { FilterPanel } from '@/components/repository/FilterPanel'
import {
  filterOptionCounts,
  toggleFilter,
  type RepositoryFilters,
} from '@/lib/repository-workspace'
import {
  cascadeSyllabusToggle,
  type SyllabusToggleTarget,
} from '@/lib/repository-filter-cascade'
import { buildCurriculumTree } from '@/lib/repository-filter-tree'
import { buildFilterRequest, countActiveDimensions } from '@/lib/repository-filter-request'
import type { QuestionRecord } from '@/types/question'

type Props = {
  open: boolean
  questions: QuestionRecord[]
  /** Currently applied filters — the modal opens with these as its draft. */
  committedFilters: RepositoryFilters
  /** "Show all" defaults to restore on Reset. */
  defaultFilters: RepositoryFilters
  query: string
  bulkImportLabels?: Record<string, string>
  isAdmin?: boolean
  hasMore?: boolean
  loadingMore?: boolean
  onApply: (filters: RepositoryFilters) => void
  onClose: () => void
}

export function AdvancedFilterModal({
  open,
  questions,
  committedFilters,
  defaultFilters,
  query,
  bulkImportLabels = {},
  isAdmin = false,
  hasMore = false,
  loadingMore = false,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<RepositoryFilters>(committedFilters)
  const [applying, setApplying] = useState(false)

  // Re-seed the draft from the committed filters every time the modal opens so
  // edits from a previous (cancelled) session don't leak in.
  useEffect(() => {
    if (open) {
      setDraft(committedFilters)
      setApplying(false)
    }
  }, [open, committedFilters])

  // Escape cancels (discards the draft).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const curriculumTree = useMemo(() => buildCurriculumTree(questions), [questions])

  // Facet counts reflect the in-progress draft so numbers update as you select.
  const counts = useMemo(
    () => ({
      classes: filterOptionCounts(questions, 'classes', draft, query),
      subjects: filterOptionCounts(questions, 'subjects', draft, query),
      chapters: filterOptionCounts(questions, 'chapters', draft, query),
      difficulty: filterOptionCounts(questions, 'difficulty', draft, query),
      types: filterOptionCounts(questions, 'types', draft, query),
      statuses: filterOptionCounts(questions, 'statuses', draft, query),
      bulkImports: filterOptionCounts(questions, 'bulkImports', draft, query),
    }),
    [questions, draft, query],
  )

  const activeCount = useMemo(
    () => countActiveDimensions(buildFilterRequest(draft, query)),
    [draft, query],
  )

  const handleToggle = (group: keyof RepositoryFilters, key: string) =>
    setDraft((f) => toggleFilter(f, group, key))

  const handleSyllabusToggle = (target: SyllabusToggleTarget) =>
    setDraft((f) => cascadeSyllabusToggle(f, curriculumTree, target))

  const handleChapterBulkToggle = (chapters: string[], on: boolean) =>
    setDraft((f) => {
      const next = { ...f.chapters }
      for (const ch of chapters) next[ch] = on
      return { ...f, chapters: next }
    })

  const handleApply = () => {
    setApplying(true)
    onApply(draft)
    onClose()
  }

  // Reset clears to the "show all" defaults and applies immediately so results
  // refresh to everything; the modal stays open for further selection.
  const handleReset = () => {
    setDraft(defaultFilters)
    onApply(defaultFilters)
  }

  return (
    <MotionModal
      open={open}
      overlayClassName="pc-adv-filter-overlay"
      panelClassName="pc-adv-filter-panel"
      ariaLabelledBy="pc-adv-filter-title"
      onBackdropClick={onClose}
    >
      <header className="pc-adv-filter-head">
        <div className="pc-adv-filter-head-title">
          <SlidersHorizontal size={16} strokeWidth={1.6} aria-hidden />
          <h2 id="pc-adv-filter-title" className="pc-adv-filter-title">
            Filter questions
          </h2>
          {activeCount > 0 ? (
            <span className="pc-tag is-primary pc-num">{activeCount} active</span>
          ) : null}
        </div>
        <button
          type="button"
          className="pc-adv-filter-close"
          aria-label="Cancel"
          onClick={onClose}
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      </header>

      <div className="pc-adv-filter-body">
        <FilterPanel
          questions={questions}
          filters={draft}
          counts={counts}
          bulkImportLabels={bulkImportLabels}
          hasMore={hasMore}
          loadingMore={loadingMore}
          isAdmin={isAdmin}
          variant="modal"
          onToggle={handleToggle}
          onSyllabusToggle={handleSyllabusToggle}
          onChapterBulkToggle={handleChapterBulkToggle}
          onReset={handleReset}
        />
      </div>

      <footer className="pc-adv-filter-foot">
        <button type="button" className="pc-btn is-ghost is-sm" onClick={handleReset}>
          Reset
        </button>
        <div className="pc-adv-filter-foot-actions">
          <button type="button" className="pc-btn is-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="pc-btn is-primary is-sm"
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? 'Applying…' : 'Apply filters'}
          </button>
        </div>
      </footer>
    </MotionModal>
  )
}
