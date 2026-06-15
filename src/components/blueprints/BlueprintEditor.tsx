import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Copy,
  Edit,
  Play,
  Plus,
  Target,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  BlueprintDifficultyBar,
  BlueprintStepStrip,
  BlueprintStructurePreview,
} from '@/components/blueprints/BlueprintShared'
import { BlueprintStructureViz } from '@/components/blueprints/BlueprintStructureViz'
import { FadeIn } from '@/components/motion/FadeIn'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'
import { DraftRecoveryBanner } from '@/components/ui/DraftRecoveryBanner'
import { useAuth } from '@/context/AuthContext'
import { useConnectivityState } from '@/context/ConnectivityContext'
import { useToast } from '@/context/ToastContext'
import { useEditorTabLock } from '@/hooks/useEditorTabLock'
import { useLocalDraftAutosave } from '@/hooks/useLocalDraftAutosave'
import { buildBlueprintSnapshot, blueprintToPaperBootstrap } from '@/lib/blueprint-paper-bridge'
import { isBrowserOnline } from '@/lib/connectivity'
import { saveConfidenceLabel, type ConfidenceSaveStatus } from '@/lib/save-confidence'
import { storeSetup } from '@/lib/paper-builder'
import { createEmptyBlueprintDraft } from '@/lib/blueprint-defaults'
import {
  computeAllocatedMarks,
  computeSectionMarks,
  duplicateBlueprintDraft,
  formatBlueprintDuration,
  newSectionId,
  sectionLetter,
  validateBlueprintStep,
} from '@/lib/blueprint-utils'
import {
  archiveBlueprint,
  createBlueprint,
  getBlueprintById,
  parseBlueprintError,
  updateBlueprint,
} from '@/services/firebase/blueprints'
import {
  BLUEPRINT_QUESTION_TYPE_LABELS,
  type BlueprintDraft,
  type BlueprintQuestionType,
  type BlueprintSection,
} from '@/types/blueprint'

const CLASS_OPTIONS = ['V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'All classes']
const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Science',
  'All subjects',
]
const EXAM_TYPE_OPTIONS = [
  'Unit Test',
  'Periodic Test',
  'Half-Yearly',
  'Annual Examination',
  'Pre-Board',
  'Practice Worksheet',
  'Weekly Assessment',
  'Internal',
  'Custom',
]

const QUESTION_TYPES = Object.keys(
  BLUEPRINT_QUESTION_TYPE_LABELS,
) as BlueprintQuestionType[]

export function BlueprintDetailWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [blueprint, setBlueprint] = useState<
    (Awaited<ReturnType<typeof getBlueprintById>> & { createdByLabel?: string }) | null
  >(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    getBlueprintById(id)
      .then((doc) => {
        if (!cancelled) {
          if (!doc) setError('Blueprint not found.')
          else setBlueprint(doc)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(parseBlueprintError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const handleDuplicate = useCallback(() => {
    if (!id || !blueprint) return
    const suggested = `${blueprint.name} (copy)`
    const name = window.prompt('Name for the derived blueprint', suggested)
    if (name === null) return
    navigate(`/app/blueprints/new?from=${id}&name=${encodeURIComponent(name.trim() || suggested)}`)
  }, [blueprint, id, navigate])

  const handleCreatePaper = useCallback(() => {
    if (!id || !blueprint) return
    const { setup, instanceLayer } = blueprintToPaperBootstrap(blueprint, id)
    storeSetup(setup)
    navigate('/app/builder', { state: { setup, instanceLayer } })
  }, [blueprint, id, navigate])

  const handleArchive = useCallback(async () => {
    if (!id || !blueprint || blueprint.isSystem) return
    if (!window.confirm(`Archive "${blueprint.name}"?`)) return
    setBusy(true)
    try {
      await archiveBlueprint(id)
      navigate('/app/blueprints')
    } catch (err) {
      setError(parseBlueprintError(err))
    } finally {
      setBusy(false)
    }
  }, [blueprint, id, navigate])

  if (loading) return <p className="pc-bp-muted pc-bp-page-pad">Loading blueprint…</p>
  if (error || !blueprint) {
    return (
      <EmptyStatePanel
        icon={Target}
        title="Blueprint unavailable"
        description={error ?? 'Not found'}
        actions={[{ kind: 'link', label: 'Back to library', to: '/app/blueprints' }]}
      />
    )
  }

  const readOnly = blueprint.isSystem || !isAdmin
  const snapshot = buildBlueprintSnapshot(blueprint)
  const usageCount = blueprint.usageStats?.paperCount ?? 0

  return (
    <FadeIn className="pc-bp-detail pc-bp-page">
      <header className="pc-bp-detail-hero pc-panel">
        <div className="pc-bp-detail-main">
          <div className="pc-bp-detail-tags">
            <span className="pc-tag is-outline">
              {blueprint.isSystem ? 'System' : 'Custom'}
            </span>
            <span className="pc-tag is-outline">{blueprint.examType}</span>
            <span className="pc-tag is-outline">
              {blueprint.recommendedClasses.join(' · ')}
            </span>
          </div>
          <h1 className="pc-bp-detail-title pc-serif">{blueprint.name}</h1>
          {blueprint.description ? (
            <p className="pc-bp-detail-desc pc-serif">{blueprint.description}</p>
          ) : null}
          <div className="pc-bp-detail-stats">
            <div>
              <span className="pc-bp-detail-stat-k">Total marks</span>
              <span className="pc-bp-detail-stat-v pc-num">{blueprint.totalMarks}</span>
            </div>
            <div>
              <span className="pc-bp-detail-stat-k">Duration</span>
              <span className="pc-bp-detail-stat-v">
                {formatBlueprintDuration(blueprint.durationMinutes)}
              </span>
            </div>
            <div>
              <span className="pc-bp-detail-stat-k">Sections</span>
              <span className="pc-bp-detail-stat-v pc-num">{blueprint.sections.length}</span>
            </div>
          </div>
        </div>
        <aside className="pc-bp-detail-aside">
          <span className="pc-bp-detail-aside-k">Lifecycle</span>
          <dl className="pc-bp-detail-meta">
            <div>
              <dt>Created by</dt>
              <dd>{blueprint.isSystem ? 'PaperCraft' : blueprint.createdBy}</dd>
            </div>
            <div>
              <dt>Papers built</dt>
              <dd className="pc-num">{usageCount}</dd>
            </div>
            {blueprint.usageStats?.lastUsedAtMs ? (
              <div>
                <dt>Last used</dt>
                <dd>
                  {new Date(blueprint.usageStats.lastUsedAtMs).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Coverage</dt>
              <dd>
                {blueprint.chapterCoverage.mode === 'full_syllabus'
                  ? 'Full syllabus'
                  : `${blueprint.chapterCoverage.chapters.filter((c) => c.included !== false).length} chapters`}
              </dd>
            </div>
            {readOnly ? (
              <div>
                <dt>Access</dt>
                <dd>Read-only</dd>
              </div>
            ) : null}
          </dl>
          <div className="pc-bp-detail-actions">
            <button
              type="button"
              className="pc-btn is-sm is-primary"
              onClick={handleCreatePaper}
            >
              <Play size={13} strokeWidth={1.6} />
              Create paper
            </button>
            {isAdmin ? (
              <>
                <button
                  type="button"
                  className="pc-btn is-sm"
                  disabled={busy}
                  onClick={() => void handleDuplicate()}
                >
                  <Copy size={13} strokeWidth={1.6} />
                  Duplicate
                </button>
                {!blueprint.isSystem ? (
                  <>
                    <Link
                      to={`/app/blueprints/${id}/edit`}
                      className="pc-btn is-sm"
                    >
                      <Edit size={13} strokeWidth={1.6} />
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="pc-btn is-sm is-ghost"
                      disabled={busy}
                      onClick={() => void handleArchive()}
                    >
                      <Archive size={13} strokeWidth={1.6} />
                      Archive
                    </button>
                  </>
                ) : null}
              </>
            ) : null}
            <Link to="/app/blueprints" className="pc-btn is-sm is-ghost">
              <ArrowLeft size={13} strokeWidth={1.6} />
              Library
            </Link>
          </div>
        </aside>
      </header>

      <BlueprintStructureViz snapshot={snapshot} />
    </FadeIn>
  )
}


type BuilderProps = {
  mode: 'create' | 'edit'
  initialDraft?: BlueprintDraft
}

export function BlueprintBuilderWorkspace({ mode, initialDraft }: BuilderProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push: toast } = useToast()
  const { justReconnected, clearReconnected } = useConnectivityState()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [draft, setDraft] = useState<BlueprintDraft>(
    initialDraft ?? createEmptyBlueprintDraft(),
  )
  const [serverFingerprint, setServerFingerprint] = useState('')
  const [loading, setLoading] = useState(mode === 'edit')
  const [error, setError] = useState<string | null>(null)
  const [issues, setIssues] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<ConfidenceSaveStatus>('saved')
  const [savedAtMs, setSavedAtMs] = useState<number | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  const draftResourceId = id ?? 'new'
  const draftFingerprint = useMemo(() => JSON.stringify(draft), [draft])
  const isDirty = draftFingerprint !== serverFingerprint

  const draftAutosave = useLocalDraftAutosave<BlueprintDraft>({
    scope: 'blueprint-builder',
    resourceId: draftResourceId,
    enabled: !loading && !error,
    fingerprint: draftFingerprint,
    serverFingerprint,
    payload: draft,
  })

  const { conflict: tabConflict } = useEditorTabLock({
    kind: 'blueprint',
    resourceId: id ?? null,
    enabled: mode === 'edit' && Boolean(id),
  })

  const saveHint = useMemo(
    () => saveConfidenceLabel(saveStatus, { savedAtMs, isDirty }),
    [saveStatus, savedAtMs, isDirty],
  )

  useEffect(() => {
    if (mode !== 'edit' || !id) return
    let cancelled = false
    getBlueprintById(id)
      .then((doc) => {
        if (cancelled) return
        if (!doc) {
          setError('Blueprint not found.')
          return
        }
        if (doc.isSystem) {
          setError('System blueprints cannot be edited. Duplicate to customize.')
          return
        }
        setDraft({
          name: doc.name,
          examType: doc.examType,
          description: doc.description,
          instructions: doc.instructions,
          recommendedClasses: doc.recommendedClasses,
          recommendedSubjects: doc.recommendedSubjects,
          durationMinutes: doc.durationMinutes,
          totalMarks: doc.totalMarks,
          sections: doc.sections,
          difficultyDistribution: doc.difficultyDistribution,
          chapterCoverage: doc.chapterCoverage,
        })
        const loaded = JSON.stringify({
          name: doc.name,
          examType: doc.examType,
          description: doc.description,
          instructions: doc.instructions,
          recommendedClasses: doc.recommendedClasses,
          recommendedSubjects: doc.recommendedSubjects,
          durationMinutes: doc.durationMinutes,
          totalMarks: doc.totalMarks,
          sections: doc.sections,
          difficultyDistribution: doc.difficultyDistribution,
          chapterCoverage: doc.chapterCoverage,
        })
        setServerFingerprint(loaded)
        setSavedAtMs(Date.now())
        setSaveStatus('saved')
        setActiveSectionId(doc.sections[0]?.id ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(parseBlueprintError(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, mode])

  useEffect(() => {
    if (mode === 'create' && initialDraft) {
      setServerFingerprint(JSON.stringify(initialDraft))
    }
  }, [mode, initialDraft])

  useEffect(() => {
    if (!isDirty) return
    setSaveStatus('unsaved')
  }, [isDirty, draftFingerprint])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!justReconnected) return
    toast('Connection restored.', 'success')
    clearReconnected()
  }, [justReconnected, toast, clearReconnected])

  const updateDraft = useCallback((patch: Partial<BlueprintDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }))
  }, [])

  const updateSection = useCallback((sectionId: string, patch: Partial<BlueprintSection>) => {
    setDraft((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== sectionId) return s
        const next = { ...s, ...patch }
        next.marksAllocation = computeSectionMarks(next)
        return next
      }),
    }))
  }, [])

  const addSection = useCallback(() => {
    const letter = sectionLetter(draft.sections.length)
    const section: BlueprintSection = {
      id: newSectionId(),
      title: `Section ${letter}`,
      questionCount: 5,
      marksPerQuestion: 1,
      marksAllocation: 5,
      allowedQuestionTypes: ['mcq'],
      internalChoice: { enabled: false },
    }
    setDraft((prev) => ({ ...prev, sections: [...prev.sections, section] }))
    setActiveSectionId(section.id)
  }, [draft.sections.length])

  const removeSection = useCallback((sectionId: string) => {
    setDraft((prev) => {
      const sections = prev.sections.filter((s) => s.id !== sectionId)
      return { ...prev, sections: sections.length ? sections : prev.sections }
    })
  }, [])

  const goNext = () => {
    const stepIssues = validateBlueprintStep(draft, step)
    if (stepIssues.length > 0) {
      setIssues(stepIssues.map((i) => i.message))
      return
    }
    setIssues([])
    setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)
  }

  const goBack = () => {
    setIssues([])
    setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)
  }

  const save = async () => {
    const allIssues = validateBlueprintStep(draft, 4)
    if (allIssues.length > 0) {
      setIssues(allIssues.map((i) => i.message))
      return
    }
    if (!user) return
    if (!isBrowserOnline()) {
      setSaveStatus('offline')
      toast(
        'You are offline. Blueprint changes are saved on this device and will sync when you reconnect.',
        'info',
      )
      return
    }
    setSaving(true)
    setSaveStatus('saving')
    setError(null)
    try {
      if (mode === 'edit' && id) {
        await updateBlueprint(id, draft)
        navigate(`/app/blueprints/${id}`)
      } else {
        const newId = await createBlueprint(draft, user.uid)
        navigate(`/app/blueprints/${newId}`)
      }
      setServerFingerprint(draftFingerprint)
      setSavedAtMs(Date.now())
      setSaveStatus('saved')
      draftAutosave.clearOnSync()
    } catch (err) {
      setSaveStatus(isBrowserOnline() ? 'error' : 'offline')
      setError(parseBlueprintError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleRecoverDraft = () => {
    const recovered = draftAutosave.applyRecovery()
    if (!recovered) return
    setDraft(recovered)
    setSaveStatus('unsaved')
    toast('Recovered your local blueprint draft.', 'success')
  }

  const allocated = computeAllocatedMarks(draft.sections)
  const marksDelta = draft.totalMarks - allocated

  if (loading) return <p className="pc-bp-muted pc-bp-page-pad">Loading…</p>
  if (error && mode === 'edit') {
    return (
      <EmptyStatePanel
        icon={Target}
        title="Cannot edit blueprint"
        description={error}
        actions={[{ kind: 'link', label: 'Back to library', to: '/app/blueprints' }]}
      />
    )
  }

  return (
    <div className="pc-bp-builder pc-bp-page">
      {draftAutosave.showRecovery && draftAutosave.recoveryLabel ? (
        <DraftRecoveryBanner
          savedLabel={draftAutosave.recoveryLabel}
          onRecover={handleRecoverDraft}
          onDismiss={draftAutosave.dismissRecovery}
        />
      ) : null}
      {tabConflict ? (
        <div className="pc-pb-missing-banner" role="status">
          This blueprint may be open in another tab. Save here before editing elsewhere.
        </div>
      ) : null}
      <div className="pc-bp-builder-scroll">
        <BlueprintStepStrip step={step} />

        {issues.length > 0 ? (
          <div className="pc-bp-issues" role="alert">
            {issues.map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <StepBasics draft={draft} onChange={updateDraft} />
        ) : null}
        {step === 2 ? (
          <StepStructure
            draft={draft}
            activeSectionId={activeSectionId}
            marksDelta={marksDelta}
            allocated={allocated}
            onChange={updateDraft}
            onSectionChange={updateSection}
            onAddSection={addSection}
            onRemoveSection={removeSection}
            onSelectSection={setActiveSectionId}
          />
        ) : null}
        {step === 3 ? (
          <StepSyllabus draft={draft} onChange={updateDraft} allocated={allocated} />
        ) : null}
        {step === 4 ? <StepReview draft={draft} onEdit={setStep} /> : null}
      </div>

      <footer className="pc-bp-builder-foot">
        <span className="pc-bp-builder-foot-hint">
          Step <span className="pc-num">{step}</span> of 4 · {saveHint}
        </span>
        <div className="pc-bp-builder-foot-actions">
          <Link to="/app/blueprints" className="pc-btn is-sm is-ghost">
            Cancel
          </Link>
          {step > 1 ? (
            <button type="button" className="pc-btn is-sm" onClick={goBack}>
              <ArrowLeft size={13} strokeWidth={1.6} />
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button type="button" className="pc-btn is-sm is-primary" onClick={goNext}>
              Continue
              <ArrowRight size={13} strokeWidth={1.6} />
            </button>
          ) : (
            <button
              type="button"
              className="pc-btn is-sm is-primary"
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? 'Saving…' : mode === 'edit' ? 'Save blueprint' : 'Create blueprint'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

function StepBasics({
  draft,
  onChange,
}: {
  draft: BlueprintDraft
  onChange: (patch: Partial<BlueprintDraft>) => void
}) {
  const toggleClass = (value: string) => {
    const set = new Set(draft.recommendedClasses)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    onChange({ recommendedClasses: [...set] })
  }

  const toggleSubject = (value: string) => {
    const set = new Set(draft.recommendedSubjects)
    if (set.has(value)) set.delete(value)
    else set.add(value)
    onChange({ recommendedSubjects: [...set] })
  }

  return (
    <div className="pc-bp-builder-grid">
        <section className="pc-panel pc-bp-builder-panel">
          {draft.name.includes('(copy)') ? (
            <p className="pc-bp-derive-banner">
              Deriving a new blueprint — adjust marks, sections, or exam type as needed.
            </p>
          ) : null}
          <h2 className="pc-bp-panel-heading pc-serif">Identity & academic context</h2>
        <p className="pc-bp-panel-lead">
          Name the examination policy descriptively. Class and subject determine syllabus
          options in the next steps.
        </p>
        <div className="pc-bp-form-grid">
          <label className="pc-bp-field pc-bp-field-span-2">
            <span>Blueprint name</span>
            <input
              className="pc-bp-input pc-serif"
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Half-Yearly · Class X Mathematics"
            />
          </label>
          <label className="pc-bp-field pc-bp-field-span-2">
            <span>Description</span>
            <textarea
              className="pc-bp-textarea"
              rows={2}
              value={draft.description ?? ''}
              onChange={(e) => onChange({ description: e.target.value })}
            />
          </label>
          <label className="pc-bp-field">
            <span>Exam type</span>
            <select
              className="pc-bp-select"
              value={draft.examType}
              onChange={(e) => onChange({ examType: e.target.value })}
            >
              <option value="">Select…</option>
              {EXAM_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="pc-bp-field">
            <span>Total marks</span>
            <input
              className="pc-bp-input pc-num"
              type="number"
              min={1}
              value={draft.totalMarks}
              onChange={(e) => onChange({ totalMarks: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="pc-bp-field">
            <span>Duration (minutes)</span>
            <input
              className="pc-bp-input pc-num"
              type="number"
              min={1}
              value={draft.durationMinutes}
              onChange={(e) =>
                onChange({ durationMinutes: Number(e.target.value) || 0 })
              }
            />
          </label>
          <label className="pc-bp-field pc-bp-field-span-2">
            <span>General instructions</span>
            <textarea
              className="pc-bp-textarea"
              rows={2}
              value={draft.instructions ?? ''}
              onChange={(e) => onChange({ instructions: e.target.value })}
            />
          </label>
        </div>

        <div className="pc-bp-chip-field">
          <span className="pc-bp-chip-label">Recommended classes</span>
          <div className="pc-bp-chips">
            {CLASS_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`pc-bp-chip ${draft.recommendedClasses.includes(c) ? 'is-on' : ''}`}
                onClick={() => toggleClass(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="pc-bp-chip-field">
          <span className="pc-bp-chip-label">Recommended subjects</span>
          <div className="pc-bp-chips">
            {SUBJECT_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`pc-bp-chip ${draft.recommendedSubjects.includes(s) ? 'is-on' : ''}`}
                onClick={() => toggleSubject(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="pc-panel pc-bp-builder-preview">
        <span className="pc-bp-preview-kicker">Structure preview</span>
        <BlueprintStructurePreview
          sections={draft.sections}
          totalMarks={draft.totalMarks}
          compact
        />
      </aside>
    </div>
  )
}

function StepStructure({
  draft,
  activeSectionId,
  marksDelta,
  allocated,
  onChange: _onChange,
  onSectionChange,
  onAddSection,
  onRemoveSection,
  onSelectSection,
}: {
  draft: BlueprintDraft
  activeSectionId: string | null
  marksDelta: number
  allocated: number
  onChange: (patch: Partial<BlueprintDraft>) => void
  onSectionChange: (id: string, patch: Partial<BlueprintSection>) => void
  onAddSection: () => void
  onRemoveSection: (id: string) => void
  onSelectSection: (id: string) => void
}) {
  const active =
    draft.sections.find((s) => s.id === activeSectionId) ?? draft.sections[0]

  const toggleQuestionType = (sectionId: string, type: BlueprintQuestionType) => {
    const section = draft.sections.find((s) => s.id === sectionId)
    if (!section) return
    const set = new Set(section.allowedQuestionTypes)
    if (set.has(type)) set.delete(type)
    else set.add(type)
    onSectionChange(sectionId, { allowedQuestionTypes: [...set] })
  }

  return (
    <div className="pc-bp-builder-grid">
      <section className="pc-panel pc-bp-builder-panel">
        <div className="pc-bp-section-toolbar">
          <div>
            <h2 className="pc-bp-panel-heading pc-serif">Section structure</h2>
            <p className="pc-bp-panel-lead">
              Define question counts, marks, and allowed types for each section.
            </p>
          </div>
          <button type="button" className="pc-btn is-sm is-primary" onClick={onAddSection}>
            <Plus size={11} strokeWidth={1.6} />
            Add section
          </button>
        </div>

        <div className="pc-bp-section-cards">
          {draft.sections.map((section, index) => (
            <article
              key={section.id}
              className={`pc-bp-section-card ${
                active?.id === section.id ? 'is-active' : ''
              }`}
              onClick={() => onSelectSection(section.id)}
            >
              <span className="pc-bp-section-card-letter pc-serif">
                {sectionLetter(index)}
              </span>
              <div className="pc-bp-section-card-body">
                <input
                  className="pc-bp-section-title-input pc-serif"
                  value={section.title}
                  onChange={(e) =>
                    onSectionChange(section.id, { title: e.target.value })
                  }
                />
                <div className="pc-bp-section-card-fields">
                  <label>
                    <span>Questions</span>
                    <input
                      type="number"
                      min={1}
                      className="pc-bp-input pc-num"
                      value={section.questionCount}
                      onChange={(e) =>
                        onSectionChange(section.id, {
                          questionCount: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </label>
                  <label>
                    <span>Marks each</span>
                    <input
                      type="number"
                      min={1}
                      className="pc-bp-input pc-num"
                      value={section.marksPerQuestion}
                      onChange={(e) =>
                        onSectionChange(section.id, {
                          marksPerQuestion: Number(e.target.value) || 1,
                        })
                      }
                    />
                  </label>
                  <span className="pc-bp-section-total pc-num">
                    = {section.marksAllocation}m
                  </span>
                </div>
                <div className="pc-bp-type-chips">
                  {QUESTION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`pc-tag is-outline pc-bp-type-chip ${
                        section.allowedQuestionTypes.includes(type) ? 'is-on' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleQuestionType(section.id, type)
                      }}
                    >
                      {BLUEPRINT_QUESTION_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
                <label className="pc-bp-choice-toggle">
                  <input
                    type="checkbox"
                    checked={section.internalChoice?.enabled ?? false}
                    onChange={(e) =>
                      onSectionChange(section.id, {
                        internalChoice: {
                          enabled: e.target.checked,
                          attemptCount: section.questionCount,
                        },
                      })
                    }
                  />
                  Internal choice
                </label>
              </div>
              {draft.sections.length > 1 ? (
                <button
                  type="button"
                  className="pc-btn is-sm is-ghost pc-bp-section-remove"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveSection(section.id)
                  }}
                >
                  Remove
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <aside className="pc-panel pc-bp-builder-preview">
        <span className="pc-bp-preview-kicker">Marks balance</span>
        <div className="pc-bp-balance">
          <span className="pc-bp-balance-value pc-serif pc-num">{allocated}</span>
          <span className="pc-bp-balance-of">/ {draft.totalMarks}</span>
          <span
            className={`pc-tag ${marksDelta === 0 ? 'is-success' : 'is-warning'}`}
          >
            {marksDelta === 0
              ? 'Balanced'
              : marksDelta > 0
                ? `Under by ${marksDelta}`
                : `Over by ${Math.abs(marksDelta)}`}
          </span>
        </div>
        <div className="pc-bp-balance-bar">
          <span
            style={{
              width: `${Math.min(100, (allocated / draft.totalMarks) * 100)}%`,
            }}
          />
        </div>
        <BlueprintStructurePreview
          sections={draft.sections}
          totalMarks={draft.totalMarks}
          compact
        />
      </aside>
    </div>
  )
}

function StepSyllabus({
  draft,
  onChange,
  allocated,
}: {
  draft: BlueprintDraft
  onChange: (patch: Partial<BlueprintDraft>) => void
  allocated: number
}) {
  const setDifficulty = (key: 'easy' | 'medium' | 'hard', value: number) => {
    onChange({
      difficultyDistribution: {
        ...draft.difficultyDistribution,
        [key]: value,
      },
    })
  }

  const diffTotal =
    draft.difficultyDistribution.easy +
    draft.difficultyDistribution.medium +
    draft.difficultyDistribution.hard

  return (
    <div className="pc-bp-builder-grid">
      <section className="pc-panel pc-bp-builder-panel">
        <h2 className="pc-bp-panel-heading pc-serif">Chapter coverage</h2>
        <p className="pc-bp-panel-lead">
          Choose whether the blueprint spans the full syllabus or selected chapters with
          weightage.
        </p>
        <div className="pc-bp-coverage-toggle">
          <label>
            <input
              type="radio"
              name="coverage"
              checked={draft.chapterCoverage.mode === 'full_syllabus'}
              onChange={() =>
                onChange({
                  chapterCoverage: { mode: 'full_syllabus', chapters: [] },
                })
              }
            />
            Full syllabus
          </label>
          <label>
            <input
              type="radio"
              name="coverage"
              checked={draft.chapterCoverage.mode === 'selected_chapters'}
              onChange={() =>
                onChange({
                  chapterCoverage: {
                    mode: 'selected_chapters',
                    chapters: draft.chapterCoverage.chapters.length
                      ? draft.chapterCoverage.chapters
                      : [
                          {
                            chapterName: 'Chapter 1',
                            marksWeight: Math.floor(draft.totalMarks / 3),
                            included: true,
                          },
                          {
                            chapterName: 'Chapter 2',
                            marksWeight: Math.floor(draft.totalMarks / 3),
                            included: true,
                          },
                          {
                            chapterName: 'Chapter 3',
                            marksWeight:
                              draft.totalMarks - 2 * Math.floor(draft.totalMarks / 3),
                            included: true,
                          },
                        ],
                  },
                })
              }
            />
            Selected chapters
          </label>
        </div>

        {draft.chapterCoverage.mode === 'selected_chapters' ? (
          <div className="pc-bp-chapter-list">
            {draft.chapterCoverage.chapters.map((chapter, index) => (
              <div key={`${chapter.chapterName}-${index}`} className="pc-bp-chapter-row">
                <input
                  type="checkbox"
                  checked={chapter.included !== false}
                  onChange={(e) => {
                    const chapters = [...draft.chapterCoverage.chapters]
                    chapters[index] = { ...chapter, included: e.target.checked }
                    onChange({ chapterCoverage: { ...draft.chapterCoverage, chapters } })
                  }}
                />
                <input
                  className="pc-bp-input"
                  value={chapter.chapterName}
                  onChange={(e) => {
                    const chapters = [...draft.chapterCoverage.chapters]
                    chapters[index] = { ...chapter, chapterName: e.target.value }
                    onChange({ chapterCoverage: { ...draft.chapterCoverage, chapters } })
                  }}
                />
                <input
                  type="number"
                  min={0}
                  className="pc-bp-input pc-num"
                  value={chapter.marksWeight}
                  onChange={(e) => {
                    const chapters = [...draft.chapterCoverage.chapters]
                    chapters[index] = {
                      ...chapter,
                      marksWeight: Number(e.target.value) || 0,
                    }
                    onChange({ chapterCoverage: { ...draft.chapterCoverage, chapters } })
                  }}
                />
                <label className="pc-bp-mandatory">
                  <input
                    type="checkbox"
                    checked={chapter.mandatory ?? false}
                    onChange={(e) => {
                      const chapters = [...draft.chapterCoverage.chapters]
                      chapters[index] = { ...chapter, mandatory: e.target.checked }
                      onChange({ chapterCoverage: { ...draft.chapterCoverage, chapters } })
                    }}
                  />
                  Mandatory
                </label>
              </div>
            ))}
            <button
              type="button"
              className="pc-btn is-sm"
              onClick={() =>
                onChange({
                  chapterCoverage: {
                    ...draft.chapterCoverage,
                    chapters: [
                      ...draft.chapterCoverage.chapters,
                      {
                        chapterName: `Chapter ${draft.chapterCoverage.chapters.length + 1}`,
                        marksWeight: 0,
                        included: true,
                      },
                    ],
                  },
                })
              }
            >
              Add chapter
            </button>
          </div>
        ) : null}
      </section>

      <aside className="pc-panel pc-bp-builder-preview">
        <span className="pc-bp-preview-kicker">Difficulty distribution</span>
        <BlueprintDifficultyBar mix={draft.difficultyDistribution} />
        <div className="pc-bp-difficulty-sliders">
          {(['easy', 'medium', 'hard'] as const).map((key) => (
            <label key={key} className="pc-bp-field">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)} %</span>
              <input
                type="range"
                min={0}
                max={100}
                value={draft.difficultyDistribution[key]}
                onChange={(e) => setDifficulty(key, Number(e.target.value))}
              />
              <span className="pc-num">{draft.difficultyDistribution[key]}%</span>
            </label>
          ))}
        </div>
        <p className={`pc-bp-diff-total ${diffTotal === 100 ? 'is-ok' : 'is-warn'}`}>
          Total: {diffTotal}% {diffTotal === 100 ? '✓' : '(must equal 100%)'}
        </p>
        <p className="pc-bp-panel-copy">
          Section marks allocated: {allocated} / {draft.totalMarks}
        </p>
      </aside>
    </div>
  )
}

function StepReview({
  draft,
  onEdit,
}: {
  draft: BlueprintDraft
  onEdit: (step: 1 | 2 | 3 | 4) => void
}) {
  return (
    <div className="pc-bp-review-grid">
      <section className="pc-panel pc-bp-review-block">
        <div className="pc-bp-review-head">
          <h2 className="pc-bp-panel-heading pc-serif">Examination meta</h2>
          <button type="button" className="pc-btn is-sm is-ghost" onClick={() => onEdit(1)}>
            Edit
          </button>
        </div>
        <dl className="pc-bp-review-dl">
          <div>
            <dt>Name</dt>
            <dd className="pc-serif">{draft.name || '—'}</dd>
          </div>
          <div>
            <dt>Exam type</dt>
            <dd>{draft.examType || '—'}</dd>
          </div>
          <div>
            <dt>Marks · Duration</dt>
            <dd>
              {draft.totalMarks} marks · {formatBlueprintDuration(draft.durationMinutes)}
            </dd>
          </div>
          <div>
            <dt>Classes · Subjects</dt>
            <dd>
              {draft.recommendedClasses.join(', ')} ·{' '}
              {draft.recommendedSubjects.join(', ')}
            </dd>
          </div>
        </dl>
      </section>

      <section className="pc-panel pc-bp-review-block">
        <div className="pc-bp-review-head">
          <h2 className="pc-bp-panel-heading pc-serif">Structure</h2>
          <button type="button" className="pc-btn is-sm is-ghost" onClick={() => onEdit(2)}>
            Edit
          </button>
        </div>
        <BlueprintStructurePreview sections={draft.sections} totalMarks={draft.totalMarks} />
      </section>

      <section className="pc-panel pc-bp-review-block">
        <div className="pc-bp-review-head">
          <h2 className="pc-bp-panel-heading pc-serif">Syllabus & difficulty</h2>
          <button type="button" className="pc-btn is-sm is-ghost" onClick={() => onEdit(3)}>
            Edit
          </button>
        </div>
        <p className="pc-bp-panel-copy">
          Coverage:{' '}
          {draft.chapterCoverage.mode === 'full_syllabus'
            ? 'Full syllabus'
            : `${draft.chapterCoverage.chapters.filter((c) => c.included !== false).length} chapters`}
        </p>
        <BlueprintDifficultyBar mix={draft.difficultyDistribution} compact />
      </section>
    </div>
  )
}

export function blueprintDraftFromDuplicateParam(
  source: Awaited<ReturnType<typeof getBlueprintById>>,
): BlueprintDraft | null {
  if (!source) return null
  return duplicateBlueprintDraft({
    name: source.name,
    examType: source.examType,
    description: source.description,
    instructions: source.instructions,
    recommendedClasses: source.recommendedClasses,
    recommendedSubjects: source.recommendedSubjects,
    durationMinutes: source.durationMinutes,
    totalMarks: source.totalMarks,
    sections: source.sections,
    difficultyDistribution: source.difficultyDistribution,
    chapterCoverage: source.chapterCoverage,
  })
}
