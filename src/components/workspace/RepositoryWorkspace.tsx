import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PC_DURATION, PC_EASE } from '@/lib/motion/tokens'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { BulkActionBar } from '@/components/repository/BulkActionBar'
import { DeleteConfirmDialog } from '@/components/repository/DeleteConfirmDialog'
import { AdvancedFilterModal } from '@/components/repository/AdvancedFilterModal'
import { RepositoryQuickFilters, type QuickFilterOption } from '@/components/repository/RepositoryQuickFilters'
import { QuestionDetailDrawer } from '@/components/repository/QuestionDetailDrawer'
import { QuestionStream } from '@/components/repository/QuestionStream'
import { RepositoryToolbar } from '@/components/repository/RepositoryToolbar'
import { RepositoryToolbarSkeleton } from '@/components/repository/RepositorySkeleton'
import { useQuestions } from '@/hooks/useQuestions'
import { useTeacherScope } from '@/hooks/useTeacherScope'
import {
  activeFilterChips,
  buildEmptyFilters,
  bulkImportFilterLabels,
  isGroupFullyOff,
  mergeFilterOptions,
  sortQuestions,
  type RepositoryFilters,
  type SortKey,
} from '@/lib/repository-workspace'
import {
  buildFilterRequest,
  countActiveDimensions,
  runFilterRequest,
} from '@/lib/repository-filter-request'
import {
  actionToStatus,
  type LifecycleAction,
} from '@/lib/question-lifecycle'
import { parseFirestoreError } from '@/services/firebase/questions'
import {
  cascadeSyllabusToggle,
  classTriState,
  subjectTriState,
  type SyllabusToggleTarget,
} from '@/lib/repository-filter-cascade'
import { buildCurriculumTree } from '@/lib/repository-filter-tree'
import { readContinuityState, writeContinuityState } from '@/lib/workflow-continuity'

const REPO_VIEW_KEY = 'pc-repo-view'
const REPO_CONTINUITY_SCOPE = 'repository-workspace'

function loadSavedView(): 'card' | 'list' {
  try {
    const v = localStorage.getItem(REPO_VIEW_KEY)
    return v === 'list' ? 'list' : 'card'
  } catch {
    return 'card'
  }
}

export function RepositoryWorkspace() {
  const navigate = useNavigate()
  const { isAdmin, loading: authLoading, user } = useAuth()
  const { filterQuestions: scopeByAssignment, isScoped } = useTeacherScope()
  const { push: toast } = useToast()
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const continuity = readContinuityState<{
    query?: string
    sort?: SortKey
    showTrash?: boolean
  }>(REPO_CONTINUITY_SCOPE)
  const [view, setView] = useState<'card' | 'list'>(loadSavedView)
  const [isSwitchingView, setIsSwitchingView] = useState(false)
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showTrash, setShowTrash] = useState(Boolean(continuity?.showTrash))
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [query, setQuery] = useState(continuity?.query ?? '')
  const [sort, setSort] = useState<SortKey>(continuity?.sort ?? 'recent')
  const [filters, setFilters] = useState<RepositoryFilters>(() =>
    buildEmptyFilters(true),
  )
  const [filtersReady, setFiltersReady] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [bulkBusy, setBulkBusy] = useState(false)
  const filtersInitialized = useRef(false)

  const {
    allLoaded,
    loading,
    loadingMore,
    error,
    hasMore,
    isEmptyDb,
    seeding,
    loadMore,
    runSeed,
    reload,
    initFiltersFromData,
    setQuestionStatus,
    setQuestionsStatus,
    trashQuestions,
    restoreQuestions,
  } = useQuestions({
    isAdmin,
    filters,
    enabled: filtersReady && !authLoading,
  })

  const roleReady = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!roleReady.current) {
      roleReady.current = true
      setFilters(buildEmptyFilters(isAdmin))
      setFiltersReady(true)
      return
    }
    if (!filtersInitialized.current) return
    setFilters(buildEmptyFilters(isAdmin))
  }, [authLoading, isAdmin])

  useEffect(() => {
    if (allLoaded.length === 0) return
    setFilters((prev) => {
      if (!filtersInitialized.current) {
        filtersInitialized.current = true
        return initFiltersFromData(allLoaded)
      }
      return mergeFilterOptions(prev, allLoaded)
    })
  }, [allLoaded, initFiltersFromData])

  const activePool = useMemo(() => {
    let pool = showTrash
      ? allLoaded.filter((q) => q.isInTrash)
      : allLoaded.filter((q) => !q.isInTrash)
    if (isScoped) pool = scopeByAssignment(pool)
    return pool
  }, [allLoaded, showTrash, isScoped, scopeByAssignment])

  const trashCount = useMemo(
    () => allLoaded.filter((q) => q.isInTrash).length,
    [allLoaded],
  )

  // Single filter path: every fetch flows through the filter request executor.
  const filtered = useMemo(
    () => sortQuestions(runFilterRequest(activePool, filters, query), sort),
    [activePool, filters, query, sort],
  )

  const handleViewChange = useCallback((next: 'card' | 'list') => {
    if (next === view) return
    if (switchTimeoutRef.current) {
      clearTimeout(switchTimeoutRef.current)
    }
    setIsSwitchingView(true)
    setView(next)
    try {
      localStorage.setItem(REPO_VIEW_KEY, next)
    } catch {
      /* private mode */
    }
    switchTimeoutRef.current = setTimeout(() => {
      setIsSwitchingView(false)
      switchTimeoutRef.current = null
    }, 380)
  }, [view])

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    writeContinuityState(REPO_CONTINUITY_SCOPE, { query, sort, showTrash })
  }, [query, sort, showTrash])

  useEffect(() => {
    const root = workspaceRef.current?.querySelector<HTMLElement>('.pc-repo-stream')
    if (!root) return
    const saved = readContinuityState<{ streamScrollTop?: number }>(REPO_CONTINUITY_SCOPE)
    if (typeof saved?.streamScrollTop === 'number') {
      root.scrollTop = saved.streamScrollTop
    }
    const onScroll = () => {
      writeContinuityState(REPO_CONTINUITY_SCOPE, {
        query,
        sort,
        showTrash,
        streamScrollTop: root.scrollTop,
      })
    }
    root.addEventListener('scroll', onScroll)
    return () => root.removeEventListener('scroll', onScroll)
  }, [query, sort, showTrash])

  const curriculumTree = useMemo(
    () => buildCurriculumTree(activePool),
    [activePool],
  )

  const bulkLabels = useMemo(() => bulkImportFilterLabels(activePool), [activePool])

  const chips = useMemo(
    () => activeFilterChips(filters, bulkLabels),
    [filters, bulkLabels],
  )

  const activeFilterCount = useMemo(
    () => countActiveDimensions(buildFilterRequest(filters, query)),
    [filters, query],
  )

  // "Show all" defaults used when resetting from the advanced filter modal.
  const defaultFilters = useMemo(
    () =>
      allLoaded.length > 0
        ? initFiltersFromData(allLoaded)
        : buildEmptyFilters(isAdmin),
    [allLoaded, initFiltersFromData, isAdmin],
  )

  // Top quick filters (Class, Subject) — apply instantly to committed filters.
  const quickClassOptions = useMemo<QuickFilterOption[]>(
    () =>
      curriculumTree.map((cls) => ({
        value: cls.classLabel,
        label: cls.classLabel,
        on: classTriState(cls, filters) !== 'off',
        count: cls.count,
      })),
    [curriculumTree, filters],
  )

  const quickSubjectOptions = useMemo<QuickFilterOption[]>(() => {
    const map = new Map<string, { count: number; on: boolean }>()
    for (const cls of curriculumTree) {
      for (const sub of cls.subjects) {
        const prev = map.get(sub.subject) ?? { count: 0, on: false }
        const on = prev.on || subjectTriState(cls.classLabel, sub, filters) !== 'off'
        map.set(sub.subject, { count: prev.count + sub.count, on })
      }
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([subject, { count, on }]) => ({ value: subject, label: subject, on, count }))
  }, [curriculumTree, filters])

  const handleToggleQuickSubject = useCallback(
    (subject: string) => {
      setFilters((f) => {
        const anyOn = curriculumTree.some((cls) => {
          const sub = cls.subjects.find((s) => s.subject === subject)
          return sub ? subjectTriState(cls.classLabel, sub, f) !== 'off' : false
        })
        const desired = !anyOn
        let next = f
        for (const cls of curriculumTree) {
          const sub = cls.subjects.find((s) => s.subject === subject)
          if (!sub) continue
          const curOn = subjectTriState(cls.classLabel, sub, next) !== 'off'
          if (curOn !== desired) {
            next = cascadeSyllabusToggle(next, curriculumTree, {
              level: 'subject',
              classLabel: cls.classLabel,
              subject,
            })
          }
        }
        return next
      })
    },
    [curriculumTree],
  )

  const selectedQuestion = useMemo(
    () => allLoaded.find((q) => q.id === activeId) ?? null,
    [allLoaded, activeId],
  )

  const hasStrictFilters = useMemo(() => {
    const groups: (keyof RepositoryFilters)[] = [
      'classes',
      'subjects',
      'chapters',
      'difficulty',
      'types',
      'statuses',
    ]
    return groups.some((g) => {
      const group = filters[g]
      const active = Object.values(group).filter(Boolean).length
      const total = Object.keys(group).length
      return total > 0 && active > 0 && active < total
    })
  }, [filters])

  const lastSelectedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (filtered.length === 0) {
      setActiveId(null)
      setSelectedIds(new Set())
      return
    }
    setSelectedIds((prev) => {
      const visible = new Set(filtered.map((q) => q.id))
      const next = new Set([...prev].filter((id) => visible.has(id)))
      return next.size === prev.size ? prev : next
    })
    if (activeId && !filtered.some((q) => q.id === activeId)) {
      setActiveId(null)
      setDrawerOpen(false)
    }
  }, [filtered, activeId])

  const handleSyllabusToggle = useCallback(
    (target: SyllabusToggleTarget) => {
      setFilters((f) => cascadeSyllabusToggle(f, curriculumTree, target))
    },
    [curriculumTree],
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [defaultFilters])

  const handleToggleSelect = useCallback(
    (id: string, e: MouseEvent) => {
      e.stopPropagation()
      setActionError(null)

      if (e.shiftKey && lastSelectedIdRef.current) {
        const ids = filtered.map((q) => q.id)
        const anchor = ids.indexOf(lastSelectedIdRef.current)
        const target = ids.indexOf(id)
        if (anchor >= 0 && target >= 0) {
          const [start, end] =
            anchor < target ? [anchor, target] : [target, anchor]
          setSelectedIds((prev) => {
            const next = new Set(prev)
            for (let i = start; i <= end; i++) next.add(ids[i]!)
            return next
          })
          lastSelectedIdRef.current = id
          return
        }
      }

      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (e.metaKey || e.ctrlKey) {
          if (next.has(id)) next.delete(id)
          else next.add(id)
        } else if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
      lastSelectedIdRef.current = id
    },
    [filtered],
  )

  const handleOpenQuestion = useCallback((id: string) => {
    setActiveId(id)
    setDrawerOpen(true)
    setActionError(null)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false)
    setActionError(null)
  }, [])

  const handleDrawerStatusChange = useCallback(
    async (action: LifecycleAction) => {
      if (!activeId) return
      setActionError(null)
      try {
        await setQuestionStatus(activeId, actionToStatus(action))
      } catch (err) {
        const parsed = parseFirestoreError(err)
        setActionError(parsed.message)
        throw err
      }
    },
    [activeId, setQuestionStatus],
  )

  const handleBulkAction = useCallback(
    async (action: LifecycleAction) => {
      const ids = [...selectedIds]
      if (ids.length === 0) return
      setBulkBusy(true)
      setActionError(null)
      try {
        await setQuestionsStatus(ids, actionToStatus(action))
      } catch (err) {
        setActionError(parseFirestoreError(err).message)
      } finally {
        setBulkBusy(false)
      }
    },
    [selectedIds, setQuestionsStatus],
  )

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((cur) => (cur === id ? null : id))
  }, [])

  const handleNewQuestion = useCallback(() => {
    navigate('/app/repository/new')
  }, [navigate])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setActiveId(null)
    setDrawerOpen(false)
    setActionError(null)
  }, [])

  const deleteUsageWarning = useMemo(() => {
    return [...selectedIds].some((id) => {
      const q = allLoaded.find((row) => row.id === id)
      return q && q.usage > 0
    })
  }, [selectedIds, allLoaded])

  const handleRequestDelete = useCallback(() => {
    if (selectedIds.size === 0) return
    setDeleteConfirmOpen(true)
  }, [selectedIds.size])

  const handleConfirmDelete = useCallback(async () => {
    const ids = [...selectedIds]
    if (ids.length === 0 || !user?.uid) return
    setBulkBusy(true)
    setActionError(null)
    try {
      const result = await trashQuestions(ids, user.uid)
      if (result.deleted.length > 0) {
        toast(
          `${result.deleted.length} moved to trash · recoverable 12h`,
          'success',
        )
        clearSelection()
      }
      if (result.skipped.length > 0) {
        toast(
          `${result.skipped.length} skipped: ${result.skipped[0]!.reason}`,
          'info',
        )
      }
      setDeleteConfirmOpen(false)
    } catch (err) {
      setActionError(parseFirestoreError(err).message)
    } finally {
      setBulkBusy(false)
    }
  }, [selectedIds, user?.uid, trashQuestions, toast, clearSelection])

  const handleBulkRestore = useCallback(async () => {
    const ids = [...selectedIds]
    if (ids.length === 0) return
    setBulkBusy(true)
    setActionError(null)
    try {
      const result = await restoreQuestions(ids)
      if (result.deleted.length > 0) {
        toast(`${result.deleted.length} question(s) restored`, 'success')
        clearSelection()
        setShowTrash(false)
      }
      if (result.skipped.length > 0) {
        toast(result.skipped[0]!.reason, 'info')
      }
    } catch (err) {
      setActionError(parseFirestoreError(err).message)
    } finally {
      setBulkBusy(false)
    }
  }, [selectedIds, restoreQuestions, toast, clearSelection])

  const handleDrawerDelete = useCallback(async () => {
    if (!activeId || !user?.uid) return
    setBulkBusy(true)
    try {
      const result = await trashQuestions([activeId], user.uid)
      if (result.deleted.length > 0) {
        toast('Moved to trash · recoverable for 12 hours', 'success')
        handleCloseDrawer()
      } else if (result.skipped[0]) {
        toast(result.skipped[0].reason, 'info')
      }
    } catch (err) {
      setActionError(parseFirestoreError(err).message)
    } finally {
      setBulkBusy(false)
    }
  }, [activeId, user?.uid, trashQuestions, toast, handleCloseDrawer])

  const handleDrawerRestore = useCallback(async () => {
    if (!activeId) return
    setBulkBusy(true)
    try {
      const result = await restoreQuestions([activeId])
      if (result.deleted.length > 0) {
        toast('Question restored', 'success')
        handleCloseDrawer()
        setShowTrash(false)
      } else if (result.skipped[0]) {
        toast(result.skipped[0].reason, 'info')
      }
    } catch (err) {
      setActionError(parseFirestoreError(err).message)
    } finally {
      setBulkBusy(false)
    }
  }, [activeId, restoreQuestions, toast, handleCloseDrawer])

  const showBulk = selectedIds.size > 0

  return (
    <div className="pc-repo-workspace" ref={workspaceRef}>
      {loading && !allLoaded.length ? (
        <RepositoryToolbarSkeleton />
      ) : (
        <RepositoryToolbar
          view={view}
          onViewChange={handleViewChange}
          showTrash={showTrash}
          trashCount={trashCount}
          onToggleTrash={() => {
            setShowTrash((v) => !v)
            clearSelection()
          }}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          searchFocused={searchFocused}
          onSearchFocus={() => setSearchFocused(true)}
          onSearchBlur={() => setSearchFocused(false)}
          matchCount={filtered.length}
          loadedCount={activePool.length}
          hasMore={hasMore}
          loadingMore={loadingMore}
          isAdmin={isAdmin}
          onOpenFilters={() => setFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
          filterChips={chips}
          showTrashMode={showTrash}
        />
      )}

      {!loading || allLoaded.length > 0 ? (
        <RepositoryQuickFilters
          classOptions={quickClassOptions}
          subjectOptions={quickSubjectOptions}
          onToggleClass={(value) =>
            handleSyllabusToggle({ level: 'class', classLabel: value })
          }
          onToggleSubject={handleToggleQuickSubject}
        />
      ) : null}

      {showTrash && !loading && isAdmin && (
        <p className="pc-repo-trash-banner" role="status">
          Deleted questions stay here for 12 hours. Restore or they are removed
          permanently.
        </p>
      )}

      <AnimatePresence initial={false}>
        {showBulk && !loading && isAdmin ? (
          <BulkActionBar
            key="bulk-bar"
            count={selectedIds.size}
            disabled={bulkBusy}
            trashMode={showTrash}
            onClear={clearSelection}
            onPublish={showTrash ? undefined : () => handleBulkAction('publish')}
            onArchive={showTrash ? undefined : () => handleBulkAction('archive')}
            onLock={showTrash ? undefined : () => handleBulkAction('lock')}
            onDelete={showTrash ? undefined : handleRequestDelete}
            onRestore={showTrash ? () => void handleBulkRestore() : undefined}
          />
        ) : null}
      </AnimatePresence>

      {actionError && !drawerOpen && (
        <div className="pc-repo-inline-error pc-repo-inline-error--bar" role="alert">
          {actionError}
        </div>
      )}

      <motion.div
        className="pc-repo-panels pc-repo-panels--single"
        layout
        transition={{ layout: { duration: PC_DURATION.normal, ease: PC_EASE.out } }}
      >
        <QuestionStream
          questions={filtered}
          view={view}
          isSwitchingView={isSwitchingView}
          loading={loading && !allLoaded.length}
          loadingMore={loadingMore}
          error={error}
          selectedIds={selectedIds}
          activeId={activeId}
          expandedId={expandedId}
          hasQuery={query.trim().length > 0}
          hasStrictFilters={
            hasStrictFilters ||
            Object.values(filters).some((g) => isGroupFullyOff(g))
          }
          isEmptyDb={isEmptyDb}
          hasMore={hasMore}
          isAdmin={isAdmin}
          seeding={seeding}
          onToggleSelect={isAdmin ? handleToggleSelect : undefined}
          onOpenQuestion={handleOpenQuestion}
          onToggleExpand={handleToggleExpand}
          onClearSearch={() => setQuery('')}
          onResetFilters={handleResetFilters}
          onLoadMore={loadMore}
          onRetry={reload}
          onSeed={runSeed}
          onCreate={isAdmin ? handleNewQuestion : undefined}
        />

      </motion.div>

      <AdvancedFilterModal
        open={filterModalOpen}
        questions={activePool}
        committedFilters={filters}
        defaultFilters={defaultFilters}
        query={query}
        bulkImportLabels={bulkLabels}
        isAdmin={isAdmin}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onApply={setFilters}
        onClose={() => setFilterModalOpen(false)}
      />

      <AnimatePresence>
        {drawerOpen && selectedQuestion ? (
          <QuestionDetailDrawer
            key={selectedQuestion.id}
            question={selectedQuestion}
            isAdmin={isAdmin}
            trashMode={showTrash || selectedQuestion.isInTrash}
            onClose={handleCloseDrawer}
            onStatusChange={handleDrawerStatusChange}
            onDelete={handleDrawerDelete}
            onRestore={handleDrawerRestore}
            actionError={actionError}
            busy={bulkBusy}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmOpen && (
          <DeleteConfirmDialog
            open={deleteConfirmOpen}
            count={selectedIds.size}
            usageWarning={deleteUsageWarning}
            busy={bulkBusy}
            onCancel={() => setDeleteConfirmOpen(false)}
            onConfirm={() => void handleConfirmDelete()}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
