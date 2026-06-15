import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DraftRecoveryBanner } from '@/components/ui/DraftRecoveryBanner'
import { useAuth } from '@/context/AuthContext'
import { useConnectivityState } from '@/context/ConnectivityContext'
import { useToast } from '@/context/ToastContext'
import { useEditorTabLock } from '@/hooks/useEditorTabLock'
import { useLocalDraftAutosave } from '@/hooks/useLocalDraftAutosave'
import { useQuestions } from '@/hooks/useQuestions'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { useTeacherScope } from '@/hooks/useTeacherScope'
import { isBrowserOnline } from '@/lib/connectivity'
import { saveConfidenceLabel, type SaveUiStatus } from '@/lib/save-confidence'
import { readContinuityState, writeContinuityState } from '@/lib/workflow-continuity'
import {
  defaultPaperInstanceLayer,
  resolvePaper,
} from '@/lib/paper-instance'
import {
  buildCompositionFingerprint,
  compositionToPaperSections,
  setupToSaveInput,
} from '@/lib/paper-persistence'
import {
  buildEmptyFilters,
  filterQuestionsClient,
  sortQuestions,
} from '@/lib/repository-workspace'
import {
  allPaperQuestionIds,
  emptyComposition,
  moveQuestionInSection,
  sectionsForSetup,
  storeSetup,
  toolbarTitleFromSetup,
  type PaperComposition,
  type PaperSectionId,
  type PaperSetupState,
  type ReplaceTarget,
} from '@/lib/paper-builder'
import { questionMatchesPaperMedium } from '@/lib/paper-medium'
import { getReplacementCandidates } from '@/lib/paper-generation-engine'
import {
  canReopenPaper,
  canSubmitPaper,
  isReadOnlyPaperBuilder,
  validatePaperForSubmission,
} from '@/lib/paper-submission'
import {
  createPaper,
  parsePaperError,
  reopenPaperAsDraft,
  submitPaperForApproval,
  updatePaper,
} from '@/services/firebase/papers'
import { recordBlueprintUsage } from '@/services/firebase/blueprints'
import { notifyPaperReopened, notifyPaperSubmitted } from '@/services/firebase/workflow-notifications'
import type { PaperStatus } from '@/types/paper'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { QuestionRecord } from '@/types/question'
import { BuilderRepoBrowser, type BuilderQuickFilters } from './BuilderRepoBrowser'
import { PaperBuilderToolbar } from './PaperBuilderToolbar'
import { PaperBuilderPaginatedCanvas } from './PaperBuilderPaginatedCanvas'
import { PaperInsightsPanel } from './PaperInsightsPanel'
import { BlueprintMatchPanel } from './BlueprintMatchPanel'
import { PaperGenerationWorkspace } from './PaperGenerationWorkspace'
import { PaperExportLink } from '@/components/print/PaperExportLink'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import { PaperApprovedBanner } from './PaperApprovedBanner'
import { PaperSubmittedBanner } from './PaperSubmittedBanner'

function applyBuilderQuickFilters(
  questions: QuestionRecord[],
  filters: BuilderQuickFilters,
): QuestionRecord[] {
  return questions.filter((q) => {
    if (filters.classLabel && q.classLabel !== filters.classLabel) return false
    if (filters.subject && q.subject !== filters.subject) return false
    if (filters.chapter && q.chapter !== filters.chapter) return false
    if (filters.marksBand !== 'any' && q.marks !== Number(filters.marksBand)) return false
    if (filters.difficultyBand === 'med-hard' && q.difficulty <= 2) return false
    return true
  })
}

type PaperBuilderDraftPayload = {
  setup: PaperSetupState
  composition: PaperComposition
  instanceLayer: PaperInstanceLayer
}

type BuilderContinuityState = {
  activeSection?: PaperSectionId
  query?: string
  quickFilters?: BuilderQuickFilters
  browserScrollTop?: number
}

type RemovedQuestionSnapshot = {
  sectionId: PaperSectionId
  index: number
  question: QuestionRecord
}

function parseDurationMinutes(label: string): number {
  const hr = label.match(/(\d+(?:\.\d+)?)\s*h/i)
  if (hr) return Math.round(Number(hr[1]) * 60)
  const min = label.match(/(\d+)\s*m/i)
  if (min) return Number(min[1])
  return 180
}

type Props = {
  setup: PaperSetupState
  paperId?: string | null
  initialComposition?: PaperComposition
  initialInstanceLayer?: PaperInstanceLayer
  initialFingerprint?: string
  missingQuestionIds?: string[]
  initialPaperStatus?: PaperStatus
  initialSubmittedAtMs?: number | null
  initialApprovedAtMs?: number | null
  paperCreatedBy?: string | null
}

export function PaperBuilderWorkspace({
  setup: setupProp,
  paperId: initialPaperId = null,
  initialComposition,
  initialInstanceLayer,
  initialFingerprint = '',
  missingQuestionIds = [],
  initialPaperStatus = 'draft',
  initialSubmittedAtMs = null,
  initialApprovedAtMs = null,
  paperCreatedBy = null,
}: Props) {
  const continuityResourceId = initialPaperId ?? 'new'
  const continuityBoot = readContinuityState<BuilderContinuityState>(
    'paper-builder',
    continuityResourceId,
  )
  const navigate = useNavigate()
  const { user, isAdmin, profile } = useAuth()
  const school = useSchoolBranding()
  const { filterQuestions: scopeByAssignment, isScoped } = useTeacherScope()
  const { push: toast } = useToast()
  const { isOnline, justReconnected, clearReconnected } = useConnectivityState()
  const workspaceRef = useRef<HTMLDivElement>(null)
  const persistDraftRef = useRef<() => Promise<boolean>>(async () => false)
  const [setup, setSetup] = useState(setupProp)
  const [instanceLayer, setInstanceLayer] = useState<PaperInstanceLayer>(
    () => initialInstanceLayer ?? defaultPaperInstanceLayer(),
  )

  useEffect(() => {
    setSetup(setupProp)
  }, [setupProp])

  useEffect(() => {
    if (initialInstanceLayer) setInstanceLayer(initialInstanceLayer)
  }, [initialInstanceLayer])

  const [paperId, setPaperId] = useState<string | null>(initialPaperId)
  const [query, setQuery] = useState(continuityBoot?.query ?? '')
  const [composition, setComposition] = useState<PaperComposition>(
    () => initialComposition ?? emptyComposition(),
  )

  const sections = useMemo(() => sectionsForSetup(setup), [setup])
  const resolved = useMemo(
    () => resolvePaper(setup, sections, composition, instanceLayer, school),
    [setup, sections, composition, instanceLayer, school],
  )
  const meta = resolved.meta
  const builderLayout = useMeasuredPrintLayout(resolved)
  const planMinutes = useMemo(() => parseDurationMinutes(setup.durationLabel), [setup.durationLabel])
  const [activeSection, setActiveSection] = useState<PaperSectionId>(
    continuityBoot?.activeSection ?? 'A',
  )
  const [replaceTarget, setReplaceTarget] = useState<ReplaceTarget | null>(null)
  const [lastInsertedId, setLastInsertedId] = useState<string | null>(null)
  const [missingIds] = useState<string[]>(missingQuestionIds)
  const [savedFingerprint, setSavedFingerprint] = useState(initialFingerprint)
  const [savedAtMs, setSavedAtMs] = useState<number | null>(
    initialPaperId ? Date.now() : null,
  )
  const [saveStatus, setSaveStatus] = useState<SaveUiStatus>(
    initialFingerprint ? 'saved' : 'unsaved',
  )
  const [paperStatus, setPaperStatus] = useState<PaperStatus>(initialPaperStatus)
  const [submittedAtMs, setSubmittedAtMs] = useState<number | null>(initialSubmittedAtMs)
  const [approvedAtMs, setApprovedAtMs] = useState<number | null>(initialApprovedAtMs)
  const [submitting, setSubmitting] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [generationOpen, setGenerationOpen] = useState(false)
  const [removedQuestion, setRemovedQuestion] = useState<RemovedQuestionSnapshot | null>(null)
  const blueprintRecordedRef = useRef(false)

  const readOnly = isReadOnlyPaperBuilder(paperStatus, isAdmin)
  const [quickFilters, setQuickFilters] = useState<BuilderQuickFilters>(() => ({
    classLabel: continuityBoot?.quickFilters?.classLabel ?? setup.classLabel,
    subject: continuityBoot?.quickFilters?.subject ?? setup.subject,
    chapter: continuityBoot?.quickFilters?.chapter ?? null,
    marksBand: continuityBoot?.quickFilters?.marksBand ?? 'any',
    difficultyBand: continuityBoot?.quickFilters?.difficultyBand ?? 'any',
  }))

  const currentFingerprint = useMemo(
    () => buildCompositionFingerprint(setup, composition, sections, instanceLayer),
    [setup, composition, sections, instanceLayer],
  )

  const draftResourceId = paperId ?? 'new'

  const draftAutosave = useLocalDraftAutosave<PaperBuilderDraftPayload>({
    scope: 'paper-builder',
    resourceId: draftResourceId,
    enabled: !readOnly,
    fingerprint: currentFingerprint,
    serverFingerprint: savedFingerprint,
    payload: { setup, composition, instanceLayer },
  })

  const { conflict: tabConflict } = useEditorTabLock({
    kind: 'paper',
    resourceId: paperId,
    enabled: Boolean(paperId) && !readOnly,
  })

  const repoFilters = useMemo(
    () => ({
      ...buildEmptyFilters(isAdmin),
      statuses: { Published: true },
    }),
    [isAdmin],
  )

  const { allLoaded, loading } = useQuestions({
    isAdmin,
    filters: repoFilters,
  })

  const published = useMemo(() => {
    let rows = allLoaded.filter((q) => q.statusRaw === 'published' && !q.isInTrash)
    if (isScoped) rows = scopeByAssignment(rows)
    return rows
  }, [allLoaded, isScoped, scopeByAssignment])

  const scopedPublished = useMemo(
    () =>
      published.filter(
        (q) => q.classLabel === setup.classLabel && q.subject === setup.subject,
      ),
    [published, setup.classLabel, setup.subject],
  )

  const classOptions = useMemo(
    () => [...new Set(published.map((q) => q.classLabel))].sort(),
    [published],
  )
  const subjectOptions = useMemo(
    () => [...new Set(published.map((q) => q.subject))].sort(),
    [published],
  )
  const chapterOptions = useMemo(
    () => [...new Set(scopedPublished.map((q) => q.chapter))].sort(),
    [scopedPublished],
  )

  const browserQuestions = useMemo(() => {
    const base = filterQuestionsClient(scopedPublished, repoFilters, query)
    const sorted = sortQuestions(base, 'recent')
    const filtered = applyBuilderQuickFilters(sorted, quickFilters).filter((q) =>
      questionMatchesPaperMedium(q, setup.medium),
    )
    return filtered
  }, [scopedPublished, repoFilters, query, quickFilters, setup.medium])

  const usedIds = useMemo(
    () => allPaperQuestionIds(composition, sections),
    [composition, sections],
  )

  const sectionBlueprintSnap = useMemo(() => {
    if (!setup.blueprintSnapshot || !replaceTarget) return undefined
    return setup.blueprintSnapshot.sections.find(
      (s) => s.paperSectionId === replaceTarget.sectionId,
    )
  }, [setup.blueprintSnapshot, replaceTarget])

  const replacementSuggestions = useMemo(() => {
    if (!replaceTarget) return []
    return getReplacementCandidates(
      replaceTarget.source,
      scopedPublished,
      usedIds,
      setup.classLabel,
      setup.subject,
      setup.medium,
      sectionBlueprintSnap,
      3,
    )
  }, [
    replaceTarget,
    scopedPublished,
    usedIds,
    setup.classLabel,
    setup.subject,
    setup.medium,
    sectionBlueprintSnap,
  ])

  const stats = resolved.stats

  const isDirty = currentFingerprint !== savedFingerprint

  const saveHint = useMemo(
    () => saveConfidenceLabel(saveStatus, { savedAtMs, isDirty }),
    [saveStatus, savedAtMs, isDirty],
  )

  useEffect(() => {
    if (!isDirty || readOnly) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty, readOnly])

  useEffect(() => {
    if (!justReconnected) return
    toast('Connection restored.', 'success')
    clearReconnected()
  }, [justReconnected, toast, clearReconnected])

  useEffect(() => {
    if (saveStatus === 'saving') return
    if (currentFingerprint === savedFingerprint) {
      setSaveStatus('saved')
    } else {
      setSaveStatus('unsaved')
    }
  }, [currentFingerprint, savedFingerprint, saveStatus])

  useEffect(() => {
    if (!lastInsertedId) return
    const t = window.setTimeout(() => setLastInsertedId(null), 1200)
    return () => window.clearTimeout(t)
  }, [lastInsertedId])

  useEffect(() => {
    if (!removedQuestion) return
    const t = window.setTimeout(() => setRemovedQuestion(null), 6000)
    return () => window.clearTimeout(t)
  }, [removedQuestion])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && replaceTarget) setReplaceTarget(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [replaceTarget])

  useEffect(() => {
    writeContinuityState(
      'paper-builder',
      {
        activeSection,
        query,
        quickFilters,
      },
      draftResourceId,
    )
  }, [activeSection, query, quickFilters, draftResourceId])

  useEffect(() => {
    const list = workspaceRef.current?.querySelector<HTMLElement>('.pc-pb-browser-list')
    if (!list) return
    if (typeof continuityBoot?.browserScrollTop === 'number') {
      list.scrollTop = continuityBoot.browserScrollTop
    }
    const onScroll = () => {
      writeContinuityState(
        'paper-builder',
        {
          activeSection,
          query,
          quickFilters,
          browserScrollTop: list.scrollTop,
        },
        draftResourceId,
      )
    }
    list.addEventListener('scroll', onScroll)
    return () => list.removeEventListener('scroll', onScroll)
  }, [activeSection, query, quickFilters, draftResourceId, continuityBoot?.browserScrollTop])

  const persistDraft = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast('Sign in to save papers', 'info')
      return false
    }
    if (!isBrowserOnline()) {
      setSaveStatus('offline')
      toast('You are offline. Changes are saved on this device and will sync when you reconnect.', 'info')
      return false
    }
    setSaveStatus('saving')
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots, instanceLayer)
      storeSetup(setup)

      if (paperId) {
        await updatePaper(paperId, input)
      } else {
        const id = await createPaper(input, user.uid)
        setPaperId(id)
        if (setup.blueprintId && !blueprintRecordedRef.current) {
          blueprintRecordedRef.current = true
          void recordBlueprintUsage(setup.blueprintId, setup.classLabel).catch(
            () => undefined,
          )
        }
        navigate(`/app/builder/${id}`, {
          replace: true,
          state: {
            setup,
            composition,
            instanceLayer,
            fingerprint: currentFingerprint,
            paperStatus: 'draft' as const,
          },
        })
      }

      setSavedFingerprint(currentFingerprint)
      setSavedAtMs(Date.now())
      setSaveStatus('saved')
      draftAutosave.clearOnSync()
      return true
    } catch (err) {
      setSaveStatus(isBrowserOnline() ? 'error' : 'offline')
      toast(
        isBrowserOnline()
          ? parsePaperError(err)
          : 'You are offline. Your draft is safe on this device.',
        'info',
      )
      return false
    }
  }, [
    user,
    composition,
    sections,
    setup,
    paperId,
    currentFingerprint,
    instanceLayer,
    navigate,
    toast,
    draftAutosave,
  ])

  persistDraftRef.current = persistDraft

  useEffect(() => {
    if (!isOnline || readOnly) return
    if (
      (saveStatus === 'offline' || saveStatus === 'error') &&
      isDirty
    ) {
      setSaveStatus('retrying')
      void persistDraftRef.current()
    }
  }, [isOnline, readOnly, saveStatus, isDirty])

  const saveDraft = useCallback(async () => {
    if (readOnly) return
    await persistDraft()
  }, [readOnly, persistDraft])

  const submitForApproval = useCallback(async () => {
    if (readOnly || !canSubmitPaper(paperStatus)) return
    if (!user) {
      toast('Sign in to submit papers', 'info')
      return
    }
    if (!paperId) {
      toast('Save your paper as a draft before submitting.', 'info')
      return
    }
    if (saveStatus === 'unsaved' || currentFingerprint !== savedFingerprint) {
      toast('Save your changes before submitting for approval.', 'info')
      return
    }

    const validation = validatePaperForSubmission(
      setup,
      composition,
      sections,
      instanceLayer,
    )
    if (!validation.ok) {
      toast(validation.message, 'info')
      return
    }

    setSubmitting(true)
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots, instanceLayer)
      await submitPaperForApproval(paperId, input, user.uid)
      void notifyPaperSubmitted({
        paperId,
        title: setup.examinationName.trim() || 'Examination paper',
        teacherName: profile?.displayName ?? 'Teacher',
        classLabel: setup.classLabel,
        subject: setup.subject,
      }).catch(() => undefined)
      setPaperStatus('submitted')
      setSubmittedAtMs(Date.now())
      setReplaceTarget(null)
      toast('Paper submitted for approval', 'success')
    } catch (err) {
      toast(parsePaperError(err), 'error')
    } finally {
      setSubmitting(false)
    }
  }, [
    readOnly,
    paperStatus,
    user,
    paperId,
    saveStatus,
    currentFingerprint,
    savedFingerprint,
    setup,
    composition,
    sections,
    toast,
  ])

  const reopenDraft = useCallback(async () => {
    if (!canReopenPaper(paperStatus, isAdmin) || !paperId || !user) return
    if (saveStatus === 'unsaved') {
      toast('Save or discard changes before reopening.', 'info')
      return
    }

    setReopening(true)
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots, instanceLayer)
      await reopenPaperAsDraft(paperId, input)
      if (paperCreatedBy) {
        void notifyPaperReopened({
          teacherUserId: paperCreatedBy,
          paperId,
          title: setup.examinationName.trim() || 'Examination paper',
        }).catch(() => undefined)
      }
      setPaperStatus('draft')
      setApprovedAtMs(null)
      setSubmittedAtMs(null)
      toast('Paper reopened as draft', 'success')
    } catch (err) {
      toast(parsePaperError(err), 'error')
    } finally {
      setReopening(false)
    }
  }, [
    paperStatus,
    isAdmin,
    paperId,
    user,
    saveStatus,
    composition,
    sections,
    setup,
    toast,
  ])

  const addQuestion = useCallback(
    (question: QuestionRecord) => {
      if (readOnly) return
      if (replaceTarget) return
      if (usedIds.has(question.id)) return
      setComposition((prev) => ({
        ...prev,
        [activeSection]: [...prev[activeSection], question],
      }))
      setLastInsertedId(question.id)
    },
    [activeSection, usedIds, replaceTarget, readOnly],
  )

  const replaceQuestionWith = useCallback(
    (replacement: QuestionRecord) => {
      if (readOnly) return
      if (!replaceTarget) return
      if (usedIds.has(replacement.id) && replacement.id !== replaceTarget.questionId) return
      setComposition((prev) => ({
        ...prev,
        [replaceTarget.sectionId]: prev[replaceTarget.sectionId].map((q) =>
          q.id === replaceTarget.questionId ? replacement : q,
        ),
      }))
      setReplaceTarget(null)
      setLastInsertedId(replacement.id)
      toast('Question replaced', 'success')
    },
    [replaceTarget, usedIds, toast, readOnly],
  )

  const removeQuestion = useCallback(
    (sectionId: PaperSectionId, questionId: string) => {
      if (readOnly) return
      if (replaceTarget?.questionId === questionId) setReplaceTarget(null)
      setComposition((prev) => {
        const index = prev[sectionId].findIndex((q) => q.id === questionId)
        if (index < 0) return prev
        const question = prev[sectionId][index]
        if (!question) return prev
        setRemovedQuestion({ sectionId, index, question })
        return {
          ...prev,
          [sectionId]: prev[sectionId].filter((q) => q.id !== questionId),
        }
      })
    },
    [replaceTarget, readOnly],
  )

  const undoRemoveQuestion = useCallback(() => {
    if (!removedQuestion) return
    setComposition((prev) => {
      const rows = [...prev[removedQuestion.sectionId]]
      rows.splice(removedQuestion.index, 0, removedQuestion.question)
      return { ...prev, [removedQuestion.sectionId]: rows }
    })
    setRemovedQuestion(null)
    toast('Question restored.', 'success')
  }, [removedQuestion, toast])

  const moveQuestion = useCallback(
    (sectionId: PaperSectionId, questionId: string, direction: 'up' | 'down') => {
      if (readOnly) return
      setComposition((prev) => moveQuestionInSection(prev, sectionId, questionId, direction))
    },
    [readOnly],
  )

  const startReplace = useCallback((sectionId: PaperSectionId, question: QuestionRecord) => {
    if (readOnly) return
    setReplaceTarget({ sectionId, questionId: question.id, source: question })
    setActiveSection(sectionId)
  }, [readOnly])

  const focusRepository = useCallback(() => {
    workspaceRef.current
      ?.querySelector<HTMLInputElement>('.pc-pb-browser input[type="search"]')
      ?.focus()
  }, [])

  const handleRecoverDraft = useCallback(() => {
    const recovered = draftAutosave.applyRecovery()
    if (!recovered) return
    setSetup(recovered.setup)
    setComposition(recovered.composition)
    setInstanceLayer(recovered.instanceLayer)
    setSaveStatus('unsaved')
    toast('Recovered your local draft.', 'success')
  }, [draftAutosave, toast])

  const showSubmittedBanner = paperStatus === 'submitted'
  const showApprovedBanner = paperStatus === 'approved'
  const saveHintDisplay =
    readOnly && paperStatus === 'submitted'
      ? 'Submitted · view only'
      : readOnly && paperStatus === 'approved'
        ? 'Approved · official copy'
        : saveHint

  return (
    <div
      className={`pc-pb-workspace${readOnly ? ' is-read-only' : ''}`}
      ref={workspaceRef}
    >
      <PrintMeasureSurface
        resolved={resolved}
        blocks={builderLayout.blocks}
        onMeasured={builderLayout.onPrintMeasured}
      />
      {draftAutosave.showRecovery && draftAutosave.recoveryLabel ? (
        <DraftRecoveryBanner
          savedLabel={draftAutosave.recoveryLabel}
          onRecover={handleRecoverDraft}
          onDismiss={draftAutosave.dismissRecovery}
        />
      ) : null}
      {tabConflict ? (
        <div className="pc-pb-missing-banner" role="status">
          This paper may be open in another tab. Save here before editing elsewhere to avoid
          conflicting changes.
        </div>
      ) : null}
      {removedQuestion ? (
        <div className="pc-recovery-banner" role="status">
          <div className="pc-recovery-banner-main">
            <p>
              Question removed from Section {removedQuestion.sectionId}. You can undo this
              action for a few seconds.
            </p>
          </div>
          <div className="pc-recovery-banner-actions">
            <button type="button" className="pc-btn is-sm is-primary" onClick={undoRemoveQuestion}>
              Undo
            </button>
            <button type="button" className="pc-btn is-sm" onClick={() => setRemovedQuestion(null)}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <PaperBuilderToolbar
        title={toolbarTitleFromSetup(setup)}
        blueprintLabel={setup.blueprintSnapshot?.name}
        saveStatus={saveStatus}
        saveHint={saveHintDisplay}
        paperStatus={paperStatus}
        readOnly={readOnly}
        saveDisabled={(saveStatus === 'saved' && isOnline) || readOnly}
        submitDisabled={
          !canSubmitPaper(paperStatus) ||
          !paperId ||
          saveStatus === 'unsaved' ||
          currentFingerprint !== savedFingerprint
        }
        submitting={submitting}
        onSaveDraft={() => void saveDraft()}
        onPreview={() => {
          if (!paperId) {
            toast('Save the paper before opening print preview.', 'info')
            return
          }
          navigate(`/app/papers/${paperId}/preview?from=builder`)
        }}
        onSubmit={() => void submitForApproval()}
        exportSlot={
          <PaperExportLink
            paperId={paperId ?? ''}
            canExport={paperStatus === 'approved' && Boolean(paperId)}
            from="builder"
          />
        }
        canOpenEditor={!!paperId}
        onOpenEditor={() => {
          if (!paperId) {
            toast('Save the paper before opening the examination editor.', 'info')
            return
          }
          navigate(`/app/builder/${paperId}/editor`, {
            state: {
              setup,
              composition,
              instanceLayer,
              fingerprint: currentFingerprint,
              paperStatus,
            },
          })
        }}
        onGenerateDraft={() => setGenerationOpen(true)}
        canGenerateDraft={Boolean(setup.blueprintSnapshot)}
        generateDraftHint="Start from a blueprint in paper setup to enable guided generation."
      />

      {showSubmittedBanner ? (
        <PaperSubmittedBanner
          submittedAtMs={submittedAtMs}
          isAdminView={isAdmin}
          onReopen={
            canReopenPaper(paperStatus, isAdmin) ? () => void reopenDraft() : undefined
          }
          reopening={reopening}
        />
      ) : null}

      {showApprovedBanner ? (
        <PaperApprovedBanner
          paperId={paperId}
          approvedAtMs={approvedAtMs}
          isAdminView={isAdmin}
          onReopen={
            canReopenPaper(paperStatus, isAdmin) ? () => void reopenDraft() : undefined
          }
          reopening={reopening}
        />
      ) : null}

      {missingIds.length > 0 ? (
        <div className="pc-pb-missing-banner" role="status">
          <AlertTriangle size={14} strokeWidth={1.6} />
          <span>
            <strong className="pc-num">{missingIds.length}</strong> question
            {missingIds.length === 1 ? ' is' : 's are'} no longer in the repository and
            {missingIds.length === 1 ? ' is' : ' are'} shown as unavailable. Replace or
            remove before submitting.
          </span>
        </div>
      ) : null}

      <div className={`pc-pb-panels${readOnly ? ' is-read-only' : ''}`}>
        <BuilderRepoBrowser
          readOnly={readOnly}
          query={query}
          onQueryChange={setQuery}
          filters={quickFilters}
          classOptions={classOptions}
          subjectOptions={subjectOptions}
          chapterOptions={chapterOptions}
          onToggleClass={(label) =>
            setQuickFilters((f) => ({
              ...f,
              classLabel: f.classLabel === label ? setup.classLabel : label,
            }))
          }
          onToggleSubject={(subject) =>
            setQuickFilters((f) => ({
              ...f,
              subject: f.subject === subject ? setup.subject : subject,
            }))
          }
          onToggleChapter={(chapter) =>
            setQuickFilters((f) => ({
              ...f,
              chapter: f.chapter === chapter ? null : chapter,
            }))
          }
          onToggleMarks={(band) =>
            setQuickFilters((f) => ({
              ...f,
              marksBand: f.marksBand === band ? 'any' : band,
            }))
          }
          onToggleDifficulty={(band) =>
            setQuickFilters((f) => ({
              ...f,
              difficultyBand: f.difficultyBand === band ? 'any' : band,
            }))
          }
          questions={browserQuestions}
          usedIds={usedIds}
          loading={loading}
          activeSection={activeSection}
          sections={sections}
          composition={composition}
          onSelectSection={setActiveSection}
          replaceTarget={replaceTarget}
          onCancelReplace={() => setReplaceTarget(null)}
          onAdd={addQuestion}
          onReplaceWith={replaceQuestionWith}
          replacementSuggestions={replacementSuggestions}
          onApplySuggestion={replaceQuestionWith}
          contextLabel={`${setup.classLabel} · ${setup.subject}`}
          compositionForNumbering={composition}
          sectionsForNumbering={sections}
          paperMedium={setup.medium}
        />

        <PaperBuilderPaginatedCanvas
          meta={meta}
          resolved={resolved}
          pages={builderLayout.pages}
          sections={sections}
          generalInstructions={setup.generalInstructions}
          composition={composition}
          activeSection={activeSection}
          replaceTarget={replaceTarget}
          lastInsertedId={lastInsertedId}
          readOnly={readOnly}
          paperMedium={setup.medium}
          onSelectSection={setActiveSection}
          onRemove={removeQuestion}
          onReplace={startReplace}
          onMove={moveQuestion}
          onFocusRepository={focusRepository}
        />

        <PaperInsightsPanel
          stats={stats}
          planMarks={setup.totalMarks}
          planMinutes={planMinutes}
          sections={sections}
          paperStatus={paperStatus}
          blueprintSnapshot={setup.blueprintSnapshot ?? undefined}
          blueprintMatchSlot={
            setup.blueprintSnapshot ? (
              <BlueprintMatchPanel
                snapshot={setup.blueprintSnapshot}
                blueprintName={setup.blueprintSnapshot.name}
                composition={composition}
                sections={sections}
                stats={stats}
              />
            ) : undefined
          }
        />
      </div>

      {setup.blueprintSnapshot ? (
        <PaperGenerationWorkspace
          open={generationOpen}
          onClose={() => setGenerationOpen(false)}
          snapshot={setup.blueprintSnapshot}
          sections={sections}
          composition={composition}
          pool={scopedPublished}
          classLabel={setup.classLabel}
          subject={setup.subject}
          medium={setup.medium}
          onApply={(next) => {
            setComposition(next)
            setSaveStatus('unsaved')
            toast('Draft applied — review sections and save when ready.', 'success')
          }}
        />
      ) : null}
    </div>
  )
}
