import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ExaminationEditorShellProvider } from '@/context/ExaminationEditorShellContext'
import { ExaminationEditorWorkspace } from '@/components/examination-editor/ExaminationEditorWorkspace'
import {
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
    return 'You do not have permission to open this paper.'
  }
  if (code === 'unavailable') {
    return 'Could not reach the server. Check your connection and try again.'
  }
  return 'This draft may have been removed, or something went wrong while loading it.'
}

export function ExaminationEditorPage() {
  const { paperId } = useParams<{ paperId: string }>()
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
  const [instanceLayer, setInstanceLayer] = useState<PaperInstanceLayer | undefined>(
    boot?.instanceLayer,
  )
  const [fingerprint, setFingerprint] = useState(boot?.fingerprint ?? '')
  const [paperStatus, setPaperStatus] = useState<PaperStatus>(
    boot?.paperStatus ?? 'draft',
  )

  useEffect(() => {
    if (!paperId) return
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
        const { composition: comp } = await hydrateCompositionFromPaper(paper)
        const defs = sectionsForSetup(nextSetup)
        const layer = paperToInstanceLayer(paper)
        const fp = buildCompositionFingerprint(nextSetup, comp, defs, layer)
        if (cancelled) return

        storeSetup(nextSetup)
        setSetup(nextSetup)
        setComposition(comp)
        setInstanceLayer(layer)
        setFingerprint(fp)
        setPaperStatus(paper.status ?? 'draft')
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

  if (!paperId) {
    return <Navigate to="/app/papers" replace />
  }

  if (phase === 'ready' && paperStatus === 'approved') {
    return <Navigate to={`/app/papers/${paperId}/preview?from=editor`} replace />
  }

  if (phase === 'loading') {
    return (
      <ExaminationEditorShellProvider>
        <div className="pc-ee-load-state">
          <p className="pc-ee-load-title pc-serif">Opening examination editor…</p>
          <p className="pc-ee-load-muted">Loading your saved examination draft.</p>
        </div>
      </ExaminationEditorShellProvider>
    )
  }

  if (phase === 'error' || !setup || !composition) {
    return (
      <ExaminationEditorShellProvider>
        <div className="pc-ee-load-state is-error">
        <p className="pc-ee-load-title pc-serif">Paper not found</p>
        <p className="pc-ee-load-muted">{loadError ?? paperLoadMessage('')}</p>
        <div className="pc-ee-load-actions">
          <Link to="/app/papers" className="pc-btn">
            Recent papers
          </Link>
          <Link to={`/app/builder/${paperId}`} className="pc-btn is-primary">
            Back to compose
          </Link>
        </div>
        </div>
      </ExaminationEditorShellProvider>
    )
  }

  return (
    <ExaminationEditorShellProvider>
      {loadError ? (
        <div className="pc-pb-missing-banner" role="status">
          <span>{loadError} Showing your last saved view on this device.</span>
        </div>
      ) : null}
      <ExaminationEditorWorkspace
        paperId={paperId}
        setup={setup}
        composition={composition}
        instanceLayer={instanceLayer}
        savedFingerprint={fingerprint}
        paperStatus={paperStatus}
      />
    </ExaminationEditorShellProvider>
  )
}
