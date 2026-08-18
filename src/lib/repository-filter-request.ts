import type { QuestionRecord } from '@/types/question'
import {
  filterQuestionsClient,
  type RepositoryFilters,
} from '@/lib/repository-workspace'

/**
 * Serializable filter payload, dynamically derived from the selected filter
 * state. This is the "filter request" that drives every fetch: today it is
 * executed against the in-memory question pool (see `runFilterRequest`); it is
 * shaped so it can be sent to a real server endpoint later without changing
 * callers.
 *
 * Each array lists the *active constraint* for a dimension. An empty array
 * means "no constraint for this dimension" (show all) — which is also the
 * default-page-load state.
 */
export type QuestionFilterRequest = {
  classes: string[]
  subjects: string[]
  chapters: string[]
  difficulties: string[]
  types: string[]
  statuses: string[]
  bulkImports: string[]
  query: string
}

/**
 * A group is only a constraint when it is *partially* selected. All-on and
 * fully-off both mean "no constraint" — matching the matcher in
 * `repository-workspace.ts` (`isGroupFullyOff` / `activeFilterChips`).
 */
function activeConstraint(group: Record<string, boolean>): string[] {
  const entries = Object.entries(group)
  const total = entries.length
  const on = entries.filter(([, v]) => v).map(([k]) => k)
  if (total === 0 || on.length === 0 || on.length === total) return []
  return on.sort()
}

/** Build the filter request payload from the current filter selection. */
export function buildFilterRequest(
  filters: RepositoryFilters,
  query: string,
): QuestionFilterRequest {
  return {
    classes: activeConstraint(filters.classes),
    subjects: activeConstraint(filters.subjects),
    chapters: activeConstraint(filters.chapters),
    difficulties: activeConstraint(filters.difficulty),
    types: activeConstraint(filters.types),
    statuses: activeConstraint(filters.statuses),
    bulkImports: activeConstraint(filters.bulkImports),
    query: query.trim(),
  }
}

/** True when the request applies no constraints (default load → all questions). */
export function isEmptyFilterRequest(request: QuestionFilterRequest): boolean {
  return (
    request.query.length === 0 &&
    request.classes.length === 0 &&
    request.subjects.length === 0 &&
    request.chapters.length === 0 &&
    request.difficulties.length === 0 &&
    request.types.length === 0 &&
    request.statuses.length === 0 &&
    request.bulkImports.length === 0
  )
}

/** Number of active filter dimensions in a request (for badges/summaries). */
export function countActiveDimensions(request: QuestionFilterRequest): number {
  return (
    (request.classes.length ? 1 : 0) +
    (request.subjects.length ? 1 : 0) +
    (request.chapters.length ? 1 : 0) +
    (request.difficulties.length ? 1 : 0) +
    (request.types.length ? 1 : 0) +
    (request.statuses.length ? 1 : 0) +
    (request.bulkImports.length ? 1 : 0) +
    (request.query ? 1 : 0)
  )
}

/**
 * The single filter executor. Today it runs client-side against the in-memory
 * pool via `filterQuestionsClient` (preserving the exact existing matching
 * semantics — subject-scoped keys, bulk-import exclusion, inclusion-by-default).
 * To move server-side later, replace the body with a fetch that posts
 * `buildFilterRequest(filters, query)` and returns the response; callers and the
 * request shape stay the same.
 */
export function runFilterRequest(
  questions: QuestionRecord[],
  filters: RepositoryFilters,
  query: string,
): QuestionRecord[] {
  return filterQuestionsClient(questions, filters, query)
}
