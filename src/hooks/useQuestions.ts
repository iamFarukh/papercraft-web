import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyStatusToRecord, mapQuestionDoc } from '@/lib/question-mapper'
import {
  buildDefaultFilters,
  buildEmptyFilters,
  filterQuestionsClient,
  filtersToQuery,
  firestoreQueryKey,
  type RepositoryFilters,
} from '@/lib/repository-workspace'
import {
  purgeExpiredDeletedQuestions,
  restoreDeletedQuestions,
  softDeleteQuestions,
  type BulkDeleteResult,
} from '@/services/firebase/question-delete'
import {
  batchUpdateQuestionStatus,
  getQuestions,
  parseFirestoreError,
  seedQuestions,
  updateQuestionStatus,
} from '@/services/firebase/questions'
import type {
  QuestionRecord,
  QuestionStatus,
  RepositoryError,
} from '@/types/question'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

type UseQuestionsOptions = {
  isAdmin: boolean
  filters: RepositoryFilters
  enabled?: boolean
}

export function useQuestions({
  isAdmin,
  filters,
  enabled = true,
}: UseQuestionsOptions) {
  const [allLoaded, setAllLoaded] = useState<QuestionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<RepositoryError | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isEmptyDb, setIsEmptyDb] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null)
  const fetchIdRef = useRef(0)
  const hasLoadedRef = useRef(false)

  /** Only refetch when Firestore-relevant filters change (status / role). */
  const queryKey = useMemo(
    () => firestoreQueryKey(filters, isAdmin),
    [filters.statuses, isAdmin],
  )

  const loadPage = useCallback(
    async (reset: boolean) => {
      const fetchId = ++fetchIdRef.current
      const queryFilters = filtersToQuery(filters, isAdmin)

      if (reset) {
        setError(null)
        lastDocRef.current = null
        if (!hasLoadedRef.current) {
          setLoading(true)
        }
      } else {
        setLoadingMore(true)
      }

      try {
        if (reset && isAdmin) {
          await purgeExpiredDeletedQuestions().catch(() => {
            /* index may be missing until deployed */
          })
        }

        const page = await getQuestions({
          filters: queryFilters,
          isAdmin,
          startAfterDoc: reset ? null : lastDocRef.current,
        })

        if (fetchId !== fetchIdRef.current) return

        const mapped = page.items.map(({ id, data }) =>
          mapQuestionDoc(id, data),
        )

        setAllLoaded((prev) => {
          const next = reset ? mapped : [...prev, ...mapped]
          hasLoadedRef.current = next.length > 0
          return next
        })
        lastDocRef.current = page.lastDoc
        setHasMore(page.hasMore)
        setIsEmptyDb(reset && mapped.length === 0 && !page.hasMore)
        setError(null)
      } catch (err) {
        if (fetchId !== fetchIdRef.current) return
        const parsed = parseFirestoreError(err)
        setError(parsed)
        if (reset) {
          setAllLoaded([])
          hasLoadedRef.current = false
          setIsEmptyDb(false)
        }
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    },
    [filters, isAdmin],
  )

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    loadPage(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryKey is the intentional trigger
  }, [enabled, queryKey])

  /** Load every page so syllabus filters include all classes/subjects (not just the first 50). */
  useEffect(() => {
    if (!enabled || !hasMore || loading || loadingMore) return
    loadPage(false)
  }, [enabled, hasMore, loading, loadingMore, loadPage])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return
    loadPage(false)
  }, [hasMore, loadingMore, loading, loadPage])

  const runSeed = useCallback(async () => {
    setSeeding(true)
    setError(null)
    try {
      const count = await seedQuestions()
      if (count > 0) {
        await loadPage(true)
      } else {
        setError({
          kind: 'unknown',
          message: 'Repository already has questions. Refresh to load them.',
        })
      }
    } catch (err) {
      setError(parseFirestoreError(err))
    } finally {
      setSeeding(false)
    }
  }, [loadPage])

  const initFiltersFromData = useCallback((rows: QuestionRecord[]) => {
    if (rows.length === 0) return buildEmptyFilters(isAdmin)
    return buildDefaultFilters(rows)
  }, [isAdmin])

  const patchQuestion = useCallback(
    (id: string, status: QuestionStatus) => {
      setAllLoaded((prev) =>
        prev.map((q) =>
          q.id === id ? applyStatusToRecord(q, status) : q,
        ),
      )
    },
    [],
  )

  const patchQuestions = useCallback(
    (ids: string[], status: QuestionStatus) => {
      const idSet = new Set(ids)
      setAllLoaded((prev) =>
        prev.map((q) =>
          idSet.has(q.id) ? applyStatusToRecord(q, status) : q,
        ),
      )
    },
    [],
  )

  const setQuestionStatus = useCallback(
    async (id: string, status: QuestionStatus) => {
      await updateQuestionStatus(id, status)
      patchQuestion(id, status)
    },
    [patchQuestion],
  )

  const setQuestionsStatus = useCallback(
    async (ids: string[], status: QuestionStatus) => {
      await batchUpdateQuestionStatus(ids, status)
      patchQuestions(ids, status)
    },
    [patchQuestions],
  )

  const removeQuestions = useCallback((ids: string[]) => {
    const idSet = new Set(ids)
    setAllLoaded((prev) => prev.filter((q) => !idSet.has(q.id)))
  }, [])

  const trashQuestions = useCallback(
    async (ids: string[], deletedBy: string): Promise<BulkDeleteResult> => {
      const result = await softDeleteQuestions(ids, deletedBy)
      if (result.deleted.length > 0) {
        removeQuestions(result.deleted)
      }
      return result
    },
    [removeQuestions],
  )

  const restoreQuestions = useCallback(
    async (ids: string[]): Promise<BulkDeleteResult> => {
      const result = await restoreDeletedQuestions(ids)
      if (result.deleted.length > 0) {
        await loadPage(true)
      }
      return result
    },
    [loadPage],
  )

  return {
    allLoaded,
    loading,
    loadingMore,
    error,
    hasMore,
    isEmptyDb,
    seeding,
    loadMore,
    runSeed,
    reload: () => loadPage(true),
    initFiltersFromData,
    setQuestionStatus,
    setQuestionsStatus,
    trashQuestions,
    restoreQuestions,
    filterClient: (query: string) =>
      filterQuestionsClient(allLoaded, filters, query),
  }
}
