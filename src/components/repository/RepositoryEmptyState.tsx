import { FilterX, Library, Search } from 'lucide-react'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'

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
  const { icon, title, body, hint } = COPY[variant]

  const actions: Parameters<typeof EmptyStatePanel>[0]['actions'] = []

  if (variant === 'no-results' && onClearSearch) {
    actions.push({ kind: 'button', label: 'Clear search', onClick: onClearSearch })
  }
  if (variant === 'filters-strict' && onResetFilters) {
    actions.push({ kind: 'button', label: 'Reset filters', onClick: onResetFilters })
  }
  if (variant === 'empty-database' && isAdmin) {
    if (onSeed) {
      actions.push({
        kind: 'button',
        label: seeding ? 'Seeding…' : 'Seed sample questions',
        onClick: onSeed,
        disabled: seeding,
      })
    }
    if (onCreate) {
      actions.push({
        kind: 'button',
        label: 'Create first question',
        onClick: onCreate,
        primary: true,
      })
    }
  }

  return (
    <EmptyStatePanel
      icon={icon}
      title={title}
      description={body}
      hint={hint}
      actions={actions}
      wide
      className="pc-repo-empty-wrap"
    />
  )
}
