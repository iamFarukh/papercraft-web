import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { PaperBuilderWorkspace } from '@/components/paper-builder/PaperBuilderWorkspace'
import {
  emptyComposition,
  readStoredSetup,
  sectionsForSetup,
  storeSetup,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import {
  buildCompositionFingerprint,
  hydrateCompositionFromPaper,
  paperToSetup,
} from '@/lib/paper-persistence'
import { getPaperById } from '@/services/firebase/papers'
import type { PaperStatus } from '@/types/paper'

type LocationState = {
  setup?: PaperSetupState
}

function PaperBuilderLoader({ paperId }: { paperId: string }) {
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading')
  const [setup, setSetup] = useState<PaperSetupState | null>(null)
  const [composition, setComposition] = useState<PaperComposition | null>(null)
  const [missingIds, setMissingIds] = useState<string[]>([])
  const [fingerprint, setFingerprint] = useState('')
  const [paperStatus, setPaperStatus] = useState<PaperStatus>('draft')
  const [submittedAtMs, setSubmittedAtMs] = useState<number | null>(null)
  const [approvedAtMs, setApprovedAtMs] = useState<number | null>(null)
  const [paperCreatedBy, setPaperCreatedBy] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setPhase('loading')
      try {
        const paper = await getPaperById(paperId)
        if (!paper) {
          if (!cancelled) setPhase('error')
          return
        }
        const nextSetup = paperToSetup(paper)
        const { composition: comp, missingIds: missing } =
          await hydrateCompositionFromPaper(paper)
        const defs = sectionsForSetup(nextSetup)
        const fp = buildCompositionFingerprint(nextSetup, comp, defs)
        if (cancelled) return
        storeSetup(nextSetup)
        setSetup(nextSetup)
        setComposition(comp)
        setMissingIds(missing)
        setFingerprint(fp)
        setPaperStatus(paper.status ?? 'draft')
        setSubmittedAtMs(paper.submittedAt?.toMillis?.() ?? null)
        setApprovedAtMs(paper.approvedAt?.toMillis?.() ?? null)
        setPaperCreatedBy(paper.createdBy ?? null)
        setPhase('ready')
      } catch {
        if (!cancelled) setPhase('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [paperId])

  if (phase === 'ready' && paperStatus === 'approved') {
    return <Navigate to={`/app/papers/${paperId}/preview?from=builder`} replace />
  }

  if (phase === 'loading') {
    return (
      <div className="pc-pb-load-state">
        <p className="pc-pb-load-title pc-serif">Opening paper…</p>
        <p className="pc-pb-load-muted">Loading composition from your draft.</p>
      </div>
    )
  }

  if (phase === 'error' || !setup || !composition) {
    return (
      <div className="pc-pb-load-state is-error">
        <p className="pc-pb-load-title pc-serif">Paper not found</p>
        <p className="pc-pb-load-muted">
          This draft may have been removed or you may not have access to it.
        </p>
        <div className="pc-pb-load-actions">
          <Link to="/app/papers" className="pc-btn">
            Recent papers
          </Link>
          <Link to="/app/builder/new" className="pc-btn is-primary">
            New paper
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PaperBuilderWorkspace
      setup={setup}
      paperId={paperId}
      initialComposition={composition}
      initialFingerprint={fingerprint}
      missingQuestionIds={missingIds}
      initialPaperStatus={paperStatus}
      initialSubmittedAtMs={submittedAtMs}
      initialApprovedAtMs={approvedAtMs}
      paperCreatedBy={paperCreatedBy}
    />
  )
}

export function PaperBuilderCanvasPage() {
  const { paperId } = useParams<{ paperId?: string }>()
  const location = useLocation()
  const state = location.state as LocationState | null

  if (paperId) {
    return <PaperBuilderLoader paperId={paperId} />
  }

  const setup = state?.setup ?? readStoredSetup()
  if (!setup) {
    return <Navigate to="/app/builder/new" replace />
  }

  const defs = sectionsForSetup(setup)
  const fingerprint = buildCompositionFingerprint(setup, emptyComposition(), defs)

  return (
    <PaperBuilderWorkspace
      setup={setup}
      initialFingerprint={fingerprint}
    />
  )
}
