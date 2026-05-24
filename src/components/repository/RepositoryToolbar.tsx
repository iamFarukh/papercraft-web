import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Filter, Grid3x3, List, Search, Trash2, Upload } from 'lucide-react'
import { layoutMorphTransition } from '@/lib/motion/variants'
import type { SortKey } from '@/lib/repository-workspace'

type ViewMode = 'card' | 'list'

type RepositoryToolbarProps = {
  view: ViewMode
  onViewChange: (view: ViewMode) => void
  query: string
  onQueryChange: (query: string) => void
  sort: SortKey
  onSortChange: (sort: SortKey) => void
  searchFocused?: boolean
  onSearchFocus?: () => void
  onSearchBlur?: () => void
  matchCount: number
  loadedCount?: number
  hasMore?: boolean
  loadingMore?: boolean
  isAdmin?: boolean
  showTrash?: boolean
  showTrashMode?: boolean
  trashCount?: number
  onToggleTrash?: () => void
  onFocusFilters?: () => void
  filterChips?: string[]
}

export function RepositoryToolbar({
  view,
  onViewChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  searchFocused = false,
  onSearchFocus,
  onSearchBlur,
  matchCount,
  loadedCount = 0,
  hasMore = false,
  loadingMore = false,
  isAdmin = false,
  showTrash = false,
  trashCount = 0,
  onToggleTrash,
  onFocusFilters,
  filterChips = [],
  showTrashMode = false,
}: RepositoryToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onQueryChange('')
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onQueryChange])

  return (
    <div className="pc-repo-toolbar-wrap">
      <div className="pc-repo-toolbar">
      <label
        className={
          'pc-repo-cmd' +
          (searchFocused || query ? ' is-focused' : '') +
          (query ? ' has-value' : '')
        }
      >
        <Search size={14} strokeWidth={1.6} className="pc-repo-cmd-icon" />
        <input
          ref={inputRef}
          type="search"
          className="pc-repo-cmd-input"
          placeholder="Search questions, chapters, IDs…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          aria-label="Search repository"
        />
        <kbd>⌘K</kbd>
      </label>

      <select
        className="pc-repo-select"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortKey)}
        aria-label="Sort"
      >
        <option value="recent">Sort: Recent</option>
        <option value="usage">Sort: Most used</option>
        <option value="marks">Sort: Marks</option>
        <option value="chapter">Sort: Chapter</option>
      </select>

      <div className="pc-repo-view-toggle" role="group" aria-label="View layout">
        <motion.span
          className="pc-repo-view-pill"
          aria-hidden
          animate={{ x: view === 'card' ? 0 : 36 }}
          transition={reduceMotion ? { duration: 0 } : layoutMorphTransition.layout}
        />
        <button
          type="button"
          className={'pc-repo-view-btn' + (view === 'card' ? ' is-active' : '')}
          onClick={() => onViewChange('card')}
          aria-pressed={view === 'card'}
          title="Grid view"
        >
          <Grid3x3 size={16} strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          className={'pc-repo-view-btn' + (view === 'list' ? ' is-active' : '')}
          onClick={() => onViewChange('list')}
          aria-pressed={view === 'list'}
          title="List view"
        >
          <List size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>

      <span className="pc-repo-toolbar-meta pc-num" aria-live="polite">
        {showTrashMode ? 'Trash · ' : ''}
        {matchCount} shown
        {hasMore || loadingMore
          ? ` · ${loadedCount}+ loading`
          : loadedCount > 0 && matchCount !== loadedCount
            ? ` · ${loadedCount} loaded`
            : ''}
      </span>

      <button
        type="button"
        className="pc-btn is-ghost is-sm"
        title="Focus filters"
        onClick={onFocusFilters}
      >
        <Filter size={13} strokeWidth={1.6} />
        Filters
      </button>

      {isAdmin && onToggleTrash && (
        <button
          type="button"
          className={'pc-btn is-sm' + (showTrash ? ' is-primary' : ' is-ghost')}
          onClick={onToggleTrash}
          title="Recover deleted questions (12h)"
        >
          <Trash2 size={14} strokeWidth={1.6} />
          Trash
          {trashCount > 0 && (
            <span className="pc-repo-trash-badge pc-num">{trashCount}</span>
          )}
        </button>
      )}

      {isAdmin && (
        <div className="pc-repo-toolbar-actions">
          <Link to="/app/repository/import" className="pc-btn is-ghost is-sm">
            <Upload size={14} strokeWidth={1.6} />
            Import
          </Link>
        </div>
      )}
      </div>

      {(filterChips.length > 0 || query) && (
        <div className="pc-repo-toolbar-chips">
          {filterChips.map((label) => (
            <span key={label} className="pc-repo-chip is-active">
              {label}
            </span>
          ))}
          {query && (
            <button
              type="button"
              className="pc-repo-chip is-active"
              onClick={() => onQueryChange('')}
            >
              Search: {query.length > 28 ? `${query.slice(0, 28)}…` : query} ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}
