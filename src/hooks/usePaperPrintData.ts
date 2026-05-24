import { useEffect, useState } from 'react'
import {
  emptyComposition,
  sectionsForSetup,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { resolvePaper } from '@/lib/paper-instance'
import {
  hydrateCompositionFromPaper,
  paperToInstanceLayer,
  paperToSetup,
} from '@/lib/paper-persistence'
import { getPaperById } from '@/services/firebase/papers'
import { fetchSchoolBranding } from '@/services/firebase/workspace-settings'
import type { ResolvedPaper } from '@/lib/paper-instance'
import type { PaperStatus } from '@/types/paper'

export type PaperPrintData = {
  setup: PaperSetupState
  composition: PaperComposition
  resolved: ResolvedPaper
  sections: ReturnType<typeof sectionsForSetup>
  status: PaperStatus
}

export function usePaperPrintData(paperId: string | undefined) {
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>(
    paperId ? 'loading' : 'error',
  )
  const [data, setData] = useState<PaperPrintData | null>(null)

  useEffect(() => {
    if (!paperId) {
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
        const instanceLayer = paperToInstanceLayer(paper)
        const { composition } = await hydrateCompositionFromPaper(paper)
        if (cancelled) return
        const sections = sectionsForSetup(setup)
        const school = await fetchSchoolBranding()
        const resolved = resolvePaper(
          setup,
          sections,
          composition ?? emptyComposition(),
          instanceLayer,
          school,
        )
        setData({
          setup,
          composition: composition ?? emptyComposition(),
          resolved,
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
