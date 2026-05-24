import { Clock, Eye, Loader2, RotateCcw } from 'lucide-react'
import { PaperExportLink } from '@/components/print/PaperExportLink'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'
import { PaperOfficialPreview } from '@/components/paper-builder/PaperOfficialPreview'
import { Check as CheckIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { useToast } from '@/context/ToastContext'
import {
  sectionsForSetup,
  toolbarTitleFromSetup,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { resolvePaper } from '@/lib/paper-instance'
import {
  DEFAULT_APPROVAL_FILTERS,
  type ApprovalQueueFilters,
} from '@/lib/paper-approval'
import { teacherAvatarTone, teacherInitials } from '@/lib/approval-ui'
import {
  compositionToPaperSections,
  hydrateCompositionFromPaper,
  paperToInstanceLayer,
  paperToSetup,
  setupToSaveInput,
} from '@/lib/paper-persistence'
import { formatApprovalRelative } from '@/lib/paper-approval'
import { PAPER_STATUS_CHIP } from '@/lib/paper-status-ui'
import { canReopenPaper } from '@/lib/paper-submission'
import {
  approvePaper,
  getPaperById,
  listApprovalQueue,
  parsePaperError,
  reopenPaperAsDraft,
} from '@/services/firebase/papers'
import {
  notifyPaperApproved,
  notifyPaperReopened,
} from '@/services/firebase/workflow-notifications'
import { getUserDisplayMap } from '@/services/firebase/users'
import type { ApprovalQueueItem } from '@/types/paper'
import type { PaperDocument, PaperStatus } from '@/types/paper'
import { ApprovalReviewPanel } from './ApprovalReviewPanel'
import { ApprovalSubmissionQueue } from './ApprovalSubmissionQueue'

function parseDurationMinutes(label: string): number {
  const hr = label.match(/(\d+(?:\.\d+)?)\s*h/i)
  if (hr) return Math.round(Number(hr[1]) * 60)
  const min = label.match(/(\d+)\s*m/i)
  if (min) return Number(min[1])
  return 180
}

export function ApprovalWorkspace() {
  const { paperId: routePaperId } = useParams<{ paperId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push: toast } = useToast()
  const school = useSchoolBranding()

  const [queueLoading, setQueueLoading] = useState(true)
  const [queueError, setQueueError] = useState<string | null>(null)
  const [items, setItems] = useState<ApprovalQueueItem[]>([])
  const [filters, setFilters] = useState<ApprovalQueueFilters>(DEFAULT_APPROVAL_FILTERS)

  const [paperLoading, setPaperLoading] = useState(false)
  const [paper, setPaper] = useState<PaperDocument | null>(null)
  const [setup, setSetup] = useState<PaperSetupState | null>(null)
  const [composition, setComposition] = useState<PaperComposition | null>(null)
  const [teacherLabel, setTeacherLabel] = useState('Teacher')
  const [paperStatus, setPaperStatus] = useState<PaperStatus>('submitted')
  const [busy, setBusy] = useState(false)

  const activePaperId = routePaperId ?? null
  const pendingCount = items.filter((i) => i.status === 'submitted').length

  const loadQueue = useCallback(() => {
    setQueueLoading(true)
    setQueueError(null)
    return listApprovalQueue()
      .then(setItems)
      .catch((err) => {
        setQueueError(err instanceof Error ? err.message : 'Could not load submissions.')
      })
      .finally(() => setQueueLoading(false))
  }, [])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  useEffect(() => {
    if (!activePaperId) {
      setPaper(null)
      setSetup(null)
      setComposition(null)
      return
    }

    let cancelled = false
    setPaperLoading(true)

    async function loadPaper() {
      try {
        const doc = await getPaperById(activePaperId)
        if (!doc || cancelled) {
          if (!cancelled) {
            setPaper(null)
            setSetup(null)
            setComposition(null)
          }
          return
        }
        if (doc.status !== 'submitted' && doc.status !== 'approved') {
          if (!cancelled) navigate('/app/approvals', { replace: true })
          return
        }
        const nextSetup = paperToSetup(doc)
        const { composition: comp } = await hydrateCompositionFromPaper(doc)
        const uid = doc.submittedBy ?? doc.createdBy
        const labels = await getUserDisplayMap([uid, doc.createdBy])
        if (cancelled) return
        setPaper(doc)
        setSetup(nextSetup)
        setComposition(comp)
        setPaperStatus(doc.status ?? 'submitted')
        setTeacherLabel(labels.get(uid) ?? labels.get(doc.createdBy) ?? 'Teacher')
      } catch {
        if (!cancelled) {
          setPaper(null)
          setSetup(null)
          setComposition(null)
        }
      } finally {
        if (!cancelled) setPaperLoading(false)
      }
    }

    void loadPaper()
    return () => {
      cancelled = true
    }
  }, [activePaperId, navigate])

  const sections = useMemo(
    () => (setup ? sectionsForSetup(setup) : []),
    [setup],
  )
  const resolved = useMemo(() => {
    if (!setup || !composition || sections.length === 0) return null
    const layer = paper ? paperToInstanceLayer(paper) : {}
    return resolvePaper(setup, sections, composition, layer, school)
  }, [setup, composition, sections, paper, school])
  const meta = resolved?.meta ?? null
  const stats = resolved?.stats ?? null
  const durationMinutes = useMemo(
    () => (setup ? parseDurationMinutes(setup.durationLabel) : 180),
    [setup],
  )

  const persistPayload = useCallback(() => {
    if (!setup || !composition) return null
    const layer = paper ? paperToInstanceLayer(paper) : undefined
    return setupToSaveInput(
      setup,
      compositionToPaperSections(composition, sections),
      layer,
    )
  }, [setup, composition, sections, paper])

  const handleApprove = useCallback(async () => {
    if (!activePaperId || !user || !persistPayload()) return
    setBusy(true)
    try {
      await approvePaper(activePaperId, persistPayload()!, user.uid)
      const ownerId = paper?.createdBy ?? ''
      if (ownerId) {
        void notifyPaperApproved({
          teacherUserId: ownerId,
          paperId: activePaperId,
          title: setup?.examinationName?.trim() || paper?.title || 'Examination paper',
        }).catch(() => undefined)
      }
      setPaperStatus('approved')
      setPaper((p) => (p ? { ...p, status: 'approved' } : p))
      setItems((prev) =>
        prev.map((i) => (i.id === activePaperId ? { ...i, status: 'approved' as const } : i)),
      )
      toast('Paper approved and locked', 'success')
    } catch (err) {
      toast(parsePaperError(err), 'info')
    } finally {
      setBusy(false)
    }
  }, [activePaperId, user, persistPayload, toast])

  const handleReopen = useCallback(async () => {
    if (!activePaperId || !persistPayload()) return
    setBusy(true)
    try {
      await reopenPaperAsDraft(activePaperId, persistPayload()!)
      const ownerId = paper?.createdBy ?? ''
      if (ownerId) {
        void notifyPaperReopened({
          teacherUserId: ownerId,
          paperId: activePaperId,
          title: setup?.examinationName?.trim() || paper?.title || 'Examination paper',
        }).catch(() => undefined)
      }
      toast('Paper reopened as draft', 'success')
      navigate(`/app/builder/${activePaperId}`)
    } catch (err) {
      toast(parsePaperError(err), 'info')
    } finally {
      setBusy(false)
    }
  }, [activePaperId, persistPayload, toast, navigate])

  const chip = PAPER_STATUS_CHIP[paperStatus] ?? PAPER_STATUS_CHIP.submitted
  const submittedAtMs = paper?.submittedAt?.toMillis?.() ?? null
  const teacherUid = paper?.submittedBy ?? paper?.createdBy ?? ''

  if (queueLoading && items.length === 0) {
    return (
      <div className="pc-pb-load-state">
        <Loader2 size={20} className="pc-spin" />
        <p className="pc-pb-load-muted" style={{ marginTop: 12 }}>
          Loading submissions…
        </p>
      </div>
    )
  }

  if (queueError) {
    return (
      <div className="pc-pb-load-state is-error">
        <p className="pc-pb-load-title pc-serif">Could not load queue</p>
        <p className="pc-pb-load-muted">{queueError}</p>
        <button type="button" className="pc-btn is-sm" onClick={() => void loadQueue()}>
          Try again
        </button>
      </div>
    )
  }

  if (!queueLoading && items.length === 0) {
    return (
      <div className="pc-approval-workspace pc-approval-workspace--empty">
        <EmptyStatePanel
          icon={CheckIcon}
          title="No papers awaiting review"
          description="Submitted papers will appear here when teachers send drafts for approval."
          actions={[{ kind: 'link', label: 'Paper library', to: '/app/papers' }]}
        />
      </div>
    )
  }

  return (
    <div className="pc-approval-workspace">
      <header className="pc-approval-workspace-bar">
        <div className="pc-approval-workspace-bar-main">
          {setup ? (
            <h1 className="pc-approval-workspace-title pc-serif">
              {toolbarTitleFromSetup(setup)}
            </h1>
          ) : (
            <h1 className="pc-approval-workspace-title pc-serif">Approvals</h1>
          )}
          {activePaperId && setup ? (
            <span className={`pc-tag ${chip.className}`}>{chip.label}</span>
          ) : null}
        </div>
        {activePaperId && setup && stats ? (
          <div className="pc-approval-workspace-bar-actions">
            {canReopenPaper(paperStatus, true) ? (
              <button
                type="button"
                className="pc-btn is-sm"
                disabled={busy}
                onClick={() => void handleReopen()}
              >
                <RotateCcw size={12} strokeWidth={1.6} />
                Reopen as draft
              </button>
            ) : null}
            {activePaperId ? (
              <Link
                to={`/app/papers/${activePaperId}/preview?from=approval`}
                className="pc-btn is-sm"
              >
                <Eye size={12} strokeWidth={1.6} />
                Official preview
              </Link>
            ) : null}
            {activePaperId ? (
              <PaperExportLink
                paperId={activePaperId}
                canExport={paperStatus === 'approved'}
                from="approval"
              />
            ) : null}
            {paperStatus === 'submitted' ? (
              <button
                type="button"
                className="pc-btn is-primary is-sm"
                disabled={busy}
                onClick={() => void handleApprove()}
              >
                <CheckIcon size={14} strokeWidth={1.6} />
                Approve &amp; lock
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="pc-approval-workspace-grid">
        <ApprovalSubmissionQueue
          items={items}
          activePaperId={activePaperId}
          filters={filters}
          onFiltersChange={setFilters}
          pendingCount={pendingCount}
        />

        <section className="pc-approval-preview pc-scroll pc-dots">
          {!activePaperId ? (
            <div className="pc-approval-preview-empty">
              <p className="pc-approval-preview-empty-title pc-serif">
                Select a submission
              </p>
              <p className="pc-approval-preview-empty-copy">
                Choose a paper from the queue to review the full examination composition.
              </p>
            </div>
          ) : paperLoading || !paper || !setup || !composition || !meta || !stats ? (
            <div className="pc-approval-preview-empty">
              <Loader2 size={22} className="pc-spin" />
              <p className="pc-approval-preview-empty-copy">Loading paper…</p>
            </div>
          ) : (
            <>
              <div className="pc-float pc-approval-meta-strip">
                <span className={`pc-avatar ${teacherAvatarTone(teacherUid)}`}>
                  {teacherInitials(teacherLabel)}
                </span>
                <div className="pc-approval-meta-strip-text">
                  <div className="pc-approval-meta-strip-title">
                    {teacherLabel} · {paper.subject}, {paper.classLabel}
                  </div>
                  <div className="pc-approval-meta-strip-sub">
                    Submitted{' '}
                    {submittedAtMs ? formatApprovalRelative(submittedAtMs) : '—'} ·{' '}
                    <span className="pc-num">{stats.questionCount}</span> questions ·{' '}
                    <span className="pc-num">{stats.totalMarks}</span> marks
                  </div>
                </div>
                <span className="pc-approval-meta-strip-tag">
                  {paperStatus === 'submitted' ? (
                    <span className="pc-tag is-warning">
                      <Clock size={10} strokeWidth={1.6} />
                      in review
                    </span>
                  ) : (
                    <span className={`pc-tag ${chip.className}`}>{chip.label}</span>
                  )}
                </span>
              </div>

              <div className="pc-approval-paper-wrap">
                <PaperOfficialPreview
                  meta={meta}
                  sections={sections}
                  generalInstructions={setup.generalInstructions}
                  composition={composition}
                  resolved={resolved ?? undefined}
                />
                {paperStatus === 'submitted' ? (
                  <div className="pc-approval-watermark" aria-hidden>
                    UNDER REVIEW
                  </div>
                ) : null}
                {paperStatus === 'approved' ? (
                  <div className="pc-approval-watermark is-approved" aria-hidden>
                    APPROVED
                  </div>
                ) : null}
              </div>
            </>
          )}
        </section>

        {activePaperId && stats && setup ? (
          <ApprovalReviewPanel
            paperId={activePaperId}
            status={paperStatus}
            stats={stats}
            planMarks={setup.totalMarks}
            durationMinutes={durationMinutes}
            sections={sections}
            busy={busy}
            onApprove={() => void handleApprove()}
            onReopen={() => void handleReopen()}
          />
        ) : (
          <aside className="pc-approval-review-panel pc-approval-review-panel--placeholder">
            <p className="pc-approval-queue-empty">Review tools appear here.</p>
          </aside>
        )}
      </div>
    </div>
  )
}
