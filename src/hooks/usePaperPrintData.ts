import { useEffect, useState } from 'react'
import {
  emptyComposition,
  sectionsForSetup,
  setupToPaperMeta,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { hydrateCompositionFromPaper, paperToSetup } from '@/lib/paper-persistence'
import { getPaperById } from '@/services/firebase/papers'
import type { PaperStatus } from '@/types/paper'

export type PaperPrintData = {
  setup: PaperSetupState
  composition: PaperComposition
  meta: ReturnType<typeof setupToPaperMeta>
  sections: ReturnType<typeof sectionsForSetup>
  status: PaperStatus
}

export function usePaperPrintData(paperId: string | undefined) {
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading')
  const [data, setData] = useState<PaperPrintData | null>(null)

  useEffect(() => {
    if (!paperId) {
      setPhase('error')
      return
    }

    let cancelled = false

    async function load() {
      setPhase('loading')
      try {
        const paper = await getPaperById(paperId)
        if (!paper || cancelled) {
          if (!cancelled) setPhase('error')
          return
        }
        const setup = paperToSetup(paper)
        const { composition } = await hydrateCompositionFromPaper(paper)
        if (cancelled) return
        const sections = sectionsForSetup(setup)
        setData({
          setup,
          composition: composition ?? emptyComposition(),
          meta: setupToPaperMeta(setup),
          sections,
          status: paper.status ?? 'draft',
        })
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

  return { phase, data }
}
