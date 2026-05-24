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
  paperToInstanceLayer,
  paperToSetup,
} from '@/lib/paper-persistence'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import { firebaseErrorCode, getPaperById } from '@/services/firebase/papers'
import type { PaperStatus } from '@/types/paper'

type LocationState = {
  setup?: PaperSetupState
  composition?: PaperComposition
  instanceLayer?: PaperInstanceLayer
  fingerprint?: string
  paperStatus?: PaperStatus
}

function paperLoadMessage(code: string): string {
  if (code === 'permission-denied') {
    return 'You do not have permission to open this paper. It may belong to another account.'
  }
  if (code === 'unavailable') {
    return 'Could not reach the server. Check your connection and try again.'
  }
  return 'This draft may have been removed, or something went wrong while loading it.'
}

function PaperBuilderLoader({ paperId }: { paperId: string }) {
  const location = useLocation()
  const boot = location.state as LocationState | null
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>(
    boot?.setup && boot?.composition ? 'ready' : 'loading',
  )
  const [loadError, setLoadError] = useState<string | null>(null)
  const [setup, setSetup] = useState<PaperSetupState | null>(boot?.setup ?? null)
  const [composition, setComposition] = useState<PaperComposition | null>(
    boot?.composition ?? null,
  )
  const [missingIds, setMissingIds] = useState<string[]>([])
  const [instanceLayer, setInstanceLayer] = useState<PaperInstanceLayer | undefined>(
    boot?.instanceLayer,
  )
  const [fingerprint, setFingerprint] = useState(boot?.fingerprint ?? '')
  const [paperStatus, setPaperStatus] = useState<PaperStatus>(
    boot?.paperStatus ?? 'draft',
  )
  const [submittedAtMs, setSubmittedAtMs] = useState<number | null>(null)
  const [approvedAtMs, setApprovedAtMs] = useState<number | null>(null)
  const [paperCreatedBy, setPaperCreatedBy] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!boot?.setup || !boot?.composition) {
        setPhase('loading')
      }
      setLoadError(null)

      try {
        const paper = await getPaperById(paperId)
        if (!paper) {
          if (!cancelled && !boot?.setup) {
            setLoadError(paperLoadMessage(''))
            setPhase('error')
          }
          return
        }

        const nextSetup = paperToSetup(paper)
        const { composition: comp, missingIds: missing } =
          await hydrateCompositionFromPaper(paper)
        const defs = sectionsForSetup(nextSetup)
        const layer = paperToInstanceLayer(paper)
        const fp = buildCompositionFingerprint(nextSetup, comp, defs, layer)
        if (cancelled) return

        storeSetup(nextSetup)
        setSetup(nextSetup)
        setComposition(comp)
        setInstanceLayer(layer)
        setMissingIds(missing)
        setFingerprint(fp)
        setPaperStatus(paper.status ?? 'draft')
        setSubmittedAtMs(paper.submittedAt?.toMillis?.() ?? null)
        setApprovedAtMs(paper.approvedAt?.toMillis?.() ?? null)
        setPaperCreatedBy(paper.createdBy ?? null)
        setPhase('ready')
      } catch (err) {
        if (cancelled) return
        const code = firebaseErrorCode(err)
        if (boot?.setup && boot?.composition) {
          setLoadError(paperLoadMessage(code))
          setPhase('ready')
          return
        }
        setLoadError(paperLoadMessage(code))
        setPhase('error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [paperId, boot?.setup, boot?.composition])

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
        <p className="pc-pb-load-muted">{loadError ?? paperLoadMessage('')}</p>
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
    <>
      {loadError ? (
        <div className="pc-pb-missing-banner" role="status">
          <span>{loadError} Showing your last saved view on this device.</span>
        </div>
      ) : null}
      <PaperBuilderWorkspace
        setup={setup}
        paperId={paperId}
        initialComposition={composition}
        initialInstanceLayer={instanceLayer}
        initialFingerprint={fingerprint}
        missingQuestionIds={missingIds}
        initialPaperStatus={paperStatus}
        initialSubmittedAtMs={submittedAtMs}
        initialApprovedAtMs={approvedAtMs}
        paperCreatedBy={paperCreatedBy}
      />
    </>
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
  const fingerprint = buildCompositionFingerprint(
    setup,
    emptyComposition(),
    defs,
    state?.instanceLayer,
  )

  return (
    <PaperBuilderWorkspace
      setup={setup}
      initialInstanceLayer={state?.instanceLayer}
      initialFingerprint={fingerprint}
    />
  )
}
