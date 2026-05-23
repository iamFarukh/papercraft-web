import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Grid3x3, List, Plus, Search, Trash2, Upload } from 'lucide-react'
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
  isAdmin?: boolean
  showTrash?: boolean
  trashCount?: number
  onToggleTrash?: () => void
  onNewQuestion?: () => void
  onFocusFilters?: () => void
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
  isAdmin = false,
  showTrash = false,
  trashCount = 0,
  onToggleTrash,
  onNewQuestion,
  onFocusFilters,
}: RepositoryToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

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
        <button
          type="button"
          className={'pc-repo-view-btn' + (view === 'card' ? ' is-active' : '')}
          onClick={() => onViewChange('card')}
          aria-pressed={view === 'card'}
          title="Grid cards"
        >
          <Grid3x3 size={13} strokeWidth={1.6} />
          <span className="pc-repo-view-btn-label">Grid</span>
        </button>
        <button
          type="button"
          className={'pc-repo-view-btn' + (view === 'list' ? ' is-active' : '')}
          onClick={() => onViewChange('list')}
          aria-pressed={view === 'list'}
          title="Compact list"
        >
          <List size={13} strokeWidth={1.6} />
          <span className="pc-repo-view-btn-label">List</span>
        </button>
      </div>

      <span className="pc-repo-toolbar-meta pc-num" aria-live="polite">
        {matchCount} match{matchCount === 1 ? '' : 'es'}
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
          {onNewQuestion && (
            <button
              type="button"
              className="pc-btn is-primary is-sm"
              onClick={onNewQuestion}
            >
              <Plus size={14} strokeWidth={1.6} />
              New Question
            </button>
          )}
        </div>
      )}
    </div>
  )
}
