import { AlertTriangle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { useQuestions } from '@/hooks/useQuestions'
import { useTeacherScope } from '@/hooks/useTeacherScope'
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
  computePaperStats,
  emptyComposition,
  moveQuestionInSection,
  sectionsForSetup,
  setupToPaperMeta,
  storeSetup,
  toolbarTitleFromSetup,
  type PaperComposition,
  type PaperSectionId,
  type PaperSetupState,
  type ReplaceTarget,
} from '@/lib/paper-builder'
import { questionMatchesPaperMedium } from '@/lib/paper-medium'
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
import { notifyPaperReopened, notifyPaperSubmitted } from '@/services/firebase/workflow-notifications'
import type { PaperStatus } from '@/types/paper'
import type { QuestionRecord } from '@/types/question'
import { BuilderRepoBrowser, type BuilderQuickFilters } from './BuilderRepoBrowser'
import {
  PaperBuilderToolbar,
  type SaveUiStatus,
} from './PaperBuilderToolbar'
import { PaperCompositionCanvas } from './PaperCompositionCanvas'
import { PaperInsightsPanel } from './PaperInsightsPanel'
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

function formatSavedAt(savedAtMs: number | null): string {
  if (!savedAtMs) return 'Saved'
  const sec = Math.max(0, Math.floor((Date.now() - savedAtMs) / 1000))
  if (sec < 8) return 'Saved · just now'
  if (sec < 60) return `Saved · ${sec}s ago`
  return `Saved · ${Math.floor(sec / 60)}m ago`
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
  initialFingerprint?: string
  missingQuestionIds?: string[]
  initialPaperStatus?: PaperStatus
  initialSubmittedAtMs?: number | null
  initialApprovedAtMs?: number | null
  paperCreatedBy?: string | null
}

export function PaperBuilderWorkspace({
  setup,
  paperId: initialPaperId = null,
  initialComposition,
  initialFingerprint = '',
  missingQuestionIds = [],
  initialPaperStatus = 'draft',
  initialSubmittedAtMs = null,
  initialApprovedAtMs = null,
  paperCreatedBy = null,
}: Props) {
  const navigate = useNavigate()
  const { user, isAdmin, profile } = useAuth()
  const { filterQuestions: scopeByAssignment, isScoped } = useTeacherScope()
  const { push: toast } = useToast()
  const workspaceRef = useRef<HTMLDivElement>(null)
  const sections = useMemo(() => sectionsForSetup(setup), [setup])
  const meta = useMemo(() => setupToPaperMeta(setup), [setup])
  const planMinutes = useMemo(() => parseDurationMinutes(setup.durationLabel), [setup.durationLabel])

  const [paperId, setPaperId] = useState<string | null>(initialPaperId)
  const [query, setQuery] = useState('')
  const [composition, setComposition] = useState<PaperComposition>(
    () => initialComposition ?? emptyComposition(),
  )
  const [activeSection, setActiveSection] = useState<PaperSectionId>('A')
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

  const readOnly = isReadOnlyPaperBuilder(paperStatus, isAdmin)
  const [quickFilters, setQuickFilters] = useState<BuilderQuickFilters>(() => ({
    classLabel: setup.classLabel,
    subject: setup.subject,
    chapter: null,
    marksBand: 'any',
    difficultyBand: 'any',
  }))

  const currentFingerprint = useMemo(
    () => buildCompositionFingerprint(setup, composition, sections),
    [setup, composition, sections],
  )

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
  const stats = useMemo(
    () => computePaperStats(composition, sections),
    [composition, sections],
  )

  const saveHint = useMemo(() => {
    if (saveStatus === 'saving') return 'Saving…'
    if (saveStatus === 'error') return 'Save failed — try again'
    if (saveStatus === 'unsaved') return 'Unsaved changes'
    return formatSavedAt(savedAtMs)
  }, [saveStatus, savedAtMs])

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
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && replaceTarget) setReplaceTarget(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [replaceTarget])

  const persistDraft = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast('Sign in to save papers', 'info')
      return false
    }
    setSaveStatus('saving')
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots)
      storeSetup(setup)

      if (paperId) {
        await updatePaper(paperId, input)
      } else {
        const id = await createPaper(input, user.uid)
        setPaperId(id)
        navigate(`/app/builder/${id}`, { replace: true })
      }

      setSavedFingerprint(currentFingerprint)
      setSavedAtMs(Date.now())
      setSaveStatus('saved')
      return true
    } catch (err) {
      setSaveStatus('error')
      toast(parsePaperError(err), 'info')
      return false
    }
  }, [
    user,
    composition,
    sections,
    setup,
    paperId,
    currentFingerprint,
    navigate,
    toast,
  ])

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

    const validation = validatePaperForSubmission(setup, composition, sections)
    if (!validation.ok) {
      toast(validation.message, 'info')
      return
    }

    setSubmitting(true)
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots)
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
      toast(parsePaperError(err), 'info')
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
      const input = setupToSaveInput(setup, sectionSnapshots)
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
      toast(parsePaperError(err), 'info')
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
      setComposition((prev) => ({
        ...prev,
        [sectionId]: prev[sectionId].filter((q) => q.id !== questionId),
      }))
    },
    [replaceTarget, readOnly],
  )

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
      <PaperBuilderToolbar
        title={toolbarTitleFromSetup(setup)}
        saveStatus={saveStatus}
        saveHint={saveHintDisplay}
        paperStatus={paperStatus}
        readOnly={readOnly}
        saveDisabled={saveStatus === 'saved' || readOnly}
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
        onExport={() => {
          if (!paperId) {
            toast('Save the paper before opening export.', 'info')
            return
          }
          if (paperStatus !== 'approved') return
          navigate(`/app/papers/${paperId}/preview?from=builder&export=1`)
        }}
        onSettings={() =>
          toast(
            'Examination details are set when you create a paper. Start a new paper to change class, subject, or marks.',
            'info',
          )
        }
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
          replaceTarget={replaceTarget}
          onCancelReplace={() => setReplaceTarget(null)}
          onAdd={addQuestion}
          onReplaceWith={replaceQuestionWith}
          contextLabel={`${setup.classLabel} · ${setup.subject}`}
          compositionForNumbering={composition}
          sectionsForNumbering={sections}
        />

        <PaperCompositionCanvas
          meta={meta}
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
        />
      </div>
    </div>
  )
}
