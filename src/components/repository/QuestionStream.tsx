import type { MouseEvent } from 'react'
import type { QuestionRecord, RepositoryError } from '@/types/question'
import { QuestionCard } from './QuestionCard'
import { RepositoryEmptyState } from './RepositoryEmptyState'
import { RepositoryErrorState } from './RepositoryErrorState'
import { RepositoryStreamSkeleton } from './RepositorySkeleton'

type QuestionStreamProps = {
  questions: QuestionRecord[]
  view: 'card' | 'list'
  loading?: boolean
  loadingMore?: boolean
  error?: RepositoryError | null
  selectedIds: Set<string>
  activeId: string | null
  expandedId: string | null
  hasQuery: boolean
  hasStrictFilters: boolean
  isEmptyDb?: boolean
  hasMore?: boolean
  isAdmin?: boolean
  seeding?: boolean
  onSelect: (id: string, e: MouseEvent) => void
  onToggleExpand: (id: string) => void
  onClearSearch: () => void
  onResetFilters: () => void
  onLoadMore?: () => void
  onRetry?: () => void
  onSeed?: () => void
  onCreate?: () => void
}

export function QuestionStream({
  questions,
  view,
  loading = false,
  loadingMore = false,
  error = null,
  selectedIds,
  activeId,
  expandedId,
  hasQuery,
  hasStrictFilters,
  isEmptyDb = false,
  hasMore = false,
  isAdmin = false,
  seeding = false,
  onSelect,
  onToggleExpand,
  onClearSearch,
  onResetFilters,
  onLoadMore,
  onRetry,
  onSeed,
  onCreate,
}: QuestionStreamProps) {
  if (loading) {
    return <RepositoryStreamSkeleton view={view} />
  }

  if (error && questions.length === 0) {
    return (
      <section className="pc-repo-stream pc-scroll">
        <RepositoryErrorState error={error} onRetry={onRetry} />
      </section>
    )
  }

  const emptyVariant = isEmptyDb
    ? 'empty-database'
    : hasQuery
      ? 'no-results'
      : hasStrictFilters
        ? 'filters-strict'
        : 'no-questions'

  return (
    <section className="pc-repo-stream pc-scroll" aria-label="Question stream">
      <div className="pc-repo-stream-head">
        <h3 className="pc-repo-stream-title">
          {questions.length === 0 ? (
            'No questions in view'
          ) : (
            <>
              Showing <span className="pc-num">{questions.length}</span>
              {questions.length === 1 ? ' question' : ' questions'}
            </>
          )}
        </h3>
        <span className="pc-repo-stream-rule" aria-hidden />
      </div>

      {error && questions.length > 0 && (
        <div className="pc-repo-inline-error" role="alert">
          {error.message}
        </div>
      )}

      {questions.length === 0 ? (
        <RepositoryEmptyState
          variant={emptyVariant}
          onClearSearch={hasQuery ? onClearSearch : undefined}
          onResetFilters={hasStrictFilters ? onResetFilters : undefined}
          onSeed={isEmptyDb ? onSeed : undefined}
          onCreate={isEmptyDb ? onCreate : undefined}
          seeding={seeding}
          isAdmin={isAdmin}
        />
      ) : (
        <div
          className={'pc-repo-cards' + (view === 'list' ? ' is-list' : '')}
        >
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              view={view}
              isAdmin={isAdmin}
              selected={selectedIds.has(q.id)}
              active={activeId === q.id}
              expanded={expandedId === q.id}
              onSelect={(e) => onSelect(q.id, e)}
              onToggleExpand={() => onToggleExpand(q.id)}
            />
          ))}
        </div>
      )}

      {questions.length > 0 && hasMore && (
        <div className="pc-repo-load-more">
          <button
            type="button"
            className="pc-btn is-sm"
            onClick={onLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load more questions'}
          </button>
        </div>
      )}
    </section>
  )
}
