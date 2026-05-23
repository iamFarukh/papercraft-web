import { FilterX, Library, Plus, Search, Upload } from 'lucide-react'

type EmptyVariant =
  | 'no-results'
  | 'no-questions'
  | 'filters-strict'
  | 'empty-database'

const COPY: Record<
  EmptyVariant,
  { icon: typeof Search; title: string; body: string; hint?: string }
> = {
  'no-results': {
    icon: Search,
    title: 'No questions match your search',
    body: 'Try a shorter phrase, a question ID, or a chapter name from the loaded set.',
    hint: 'Press Esc to clear search',
  },
  'no-questions': {
    icon: Library,
    title: 'No questions in this view',
    body: 'Adjust filters or load more to explore the repository.',
  },
  'filters-strict': {
    icon: FilterX,
    title: 'Filters are too narrow',
    body: 'Broaden class, subject, or difficulty to see more of the bank.',
    hint: 'Reset filters in the left panel',
  },
  'empty-database': {
    icon: Library,
    title: 'Your repository is ready to grow',
    body: 'This is the academic heart of PaperCraft — add RBSE questions for Classes V–VIII, or seed sample Mathematics, Science, and Hindi items to explore the workspace.',
    hint: 'Admins can seed sample data or create the first question',
  },
}

type RepositoryEmptyStateProps = {
  variant: EmptyVariant
  onClearSearch?: () => void
  onResetFilters?: () => void
  onSeed?: () => void
  onCreate?: () => void
  seeding?: boolean
  isAdmin?: boolean
}

export function RepositoryEmptyState({
  variant,
  onClearSearch,
  onResetFilters,
  onSeed,
  onCreate,
  seeding = false,
  isAdmin = false,
}: RepositoryEmptyStateProps) {
  const { icon: Icon, title, body, hint } = COPY[variant]

  return (
    <div className="pc-repo-empty">
      <div className="pc-repo-empty-icon" aria-hidden>
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <h4 className="pc-repo-empty-title pc-serif">{title}</h4>
      <p className="pc-repo-empty-body">{body}</p>
      {hint && <p className="pc-repo-empty-hint">{hint}</p>}
      <div className="pc-repo-empty-actions">
        {variant === 'no-results' && onClearSearch && (
          <button type="button" className="pc-btn is-sm" onClick={onClearSearch}>
            Clear search
          </button>
        )}
        {variant === 'filters-strict' && onResetFilters && (
          <button type="button" className="pc-btn is-sm" onClick={onResetFilters}>
            Reset filters
          </button>
        )}
        {variant === 'empty-database' && isAdmin && (
          <>
            {onSeed && (
              <button
                type="button"
                className="pc-btn is-sm"
                onClick={onSeed}
                disabled={seeding}
              >
                <Upload size={13} strokeWidth={1.6} />
                {seeding ? 'Seeding…' : 'Seed sample questions'}
              </button>
            )}
            {onCreate && (
              <button type="button" className="pc-btn is-primary is-sm" onClick={onCreate}>
                <Plus size={14} strokeWidth={1.6} />
                Create first question
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
