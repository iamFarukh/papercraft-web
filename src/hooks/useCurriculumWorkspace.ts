import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { CurriculumSelection, CurriculumTreeNode } from '@/lib/curriculum-workspace'
import type { CurriculumInsights } from '@/lib/curriculum-workspace'
import { normalizeDisplayName } from '@/lib/curriculum-normalize'
import {
  computeCurriculumInsights,
  countLinkedQuestions,
  loadCurriculumTree,
  renameTaxonomyNode,
  setTaxonomyLifecycle,
} from '@/services/firebase/curriculum-workspace'
import {
  createChapter,
  createSubject,
  createTopic,
  type CreateTaxonomyResult,
} from '@/services/firebase/curriculum'

export function useCurriculumWorkspace() {
  const { user, isAdmin } = useAuth()
  const [tree, setTree] = useState<CurriculumTreeNode[]>([])
  const [selection, setSelection] = useState<CurriculumSelection | null>(null)
  const [insights, setInsights] = useState<CurriculumInsights | null>(null)
  const [linkedQuestions, setLinkedQuestions] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const nextTree = await loadCurriculumTree({ includeArchived: showArchived })
      setTree(nextTree)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load curriculum.')
    } finally {
      setLoading(false)
    }
  }, [showArchived])

  useEffect(() => {
    void reload()
  }, [reload])

  const refreshInsights = useCallback(async () => {
    if (!user) return
    try {
      const ins = await computeCurriculumInsights(
        tree,
        selection,
        user.uid,
        isAdmin,
      )
      setInsights(ins)
    } catch {
      setInsights(null)
    }
  }, [tree, selection, user, isAdmin])

  useEffect(() => {
    void refreshInsights()
  }, [refreshInsights])

  const refreshLinkedCount = useCallback(async () => {
    if (!selection) {
      setLinkedQuestions(0)
      return
    }
    try {
      const n = await countLinkedQuestions(
        selection.type,
        selection.id,
        selection.classNumber,
        selection.subjectId,
        selection.chapterId,
        isAdmin,
      )
      setLinkedQuestions(n)
    } catch {
      setLinkedQuestions(0)
    }
  }, [selection, isAdmin])

  useEffect(() => {
    void refreshLinkedCount()
  }, [refreshLinkedCount])

  const selectNode = useCallback((node: CurriculumTreeNode) => {
    setSelection({
      type: node.type,
      id: node.id,
      classNumber: node.classNumber,
      subjectId: node.subjectId,
      chapterId: node.chapterId,
      label: node.label,
      status: node.status,
    })
  }, [])

  const addChild = useCallback(
    async (name: string): Promise<CreateTaxonomyResult> => {
      if (!selection || !isAdmin) {
        return { ok: false, message: 'Select a parent node first.' }
      }
      setBusy(true)
      try {
        let result: CreateTaxonomyResult
        if (selection.type === 'class') {
          result = await createSubject(name, selection.classNumber, null)
        } else if (selection.type === 'subject' && selection.subjectId) {
          result = await createChapter(
            name,
            selection.classNumber,
            selection.subjectId,
          )
        } else if (
          selection.type === 'chapter' &&
          selection.subjectId &&
          selection.chapterId
        ) {
          result = await createTopic(
            name,
            selection.classNumber,
            selection.subjectId,
            selection.chapterId,
          )
        } else {
          return { ok: false, message: 'Cannot add a child here.' }
        }
        if (result.ok) await reload()
        return result
      } finally {
        setBusy(false)
      }
    },
    [selection, isAdmin, reload],
  )

  const renameNode = useCallback(
    async (newName: string) => {
      if (!selection || !isAdmin) return { ok: false, message: 'Not allowed.' }
      setBusy(true)
      try {
        const result = await renameTaxonomyNode(
          selection.type,
          selection.id,
          newName,
          {
            classNumber: selection.classNumber,
            subjectId: selection.subjectId,
            chapterId: selection.chapterId,
          },
        )
        if (result.ok) {
          await reload()
          const label = normalizeDisplayName(newName)
          setSelection((s) => (s ? { ...s, label } : s))
        }
        return result
      } finally {
        setBusy(false)
      }
    },
    [selection, isAdmin, reload],
  )

  const setArchived = useCallback(
    async (archived: boolean) => {
      if (!selection || !isAdmin || selection.type === 'class') return
      setBusy(true)
      try {
        await setTaxonomyLifecycle(
          selection.type,
          selection.id,
          archived ? 'archived' : 'active',
        )
        await reload()
        setSelection((s) =>
          s ? { ...s, status: archived ? 'archived' : 'active' } : s,
        )
      } finally {
        setBusy(false)
      }
    },
    [selection, isAdmin, reload],
  )

  return {
    tree,
    selection,
    insights,
    linkedQuestions,
    loading,
    busy,
    error,
    showArchived,
    isAdmin,
    setShowArchived,
    selectNode,
    addChild,
    renameNode,
    setArchived,
    reload,
  }
}
