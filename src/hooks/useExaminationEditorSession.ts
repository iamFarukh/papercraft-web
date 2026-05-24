import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { useToast } from '@/context/ToastContext'
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
  sectionsForSetup,
  storeSetup,
  type PaperComposition,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { isReadOnlyPaperBuilder } from '@/lib/paper-submission'
import { parsePaperError, updatePaper } from '@/services/firebase/papers'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperStatus } from '@/types/paper'

export type EditorSaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

function formatSavedAt(savedAtMs: number | null): string {
  if (!savedAtMs) return 'Not saved yet'
  const sec = Math.max(0, Math.floor((Date.now() - savedAtMs) / 1000))
  if (sec < 8) return 'Saved · just now'
  if (sec < 60) return `Saved · ${sec}s ago`
  return `Saved · ${Math.floor(sec / 60)}m ago`
}

type Initial = {
  paperId: string
  setup: PaperSetupState
  composition: PaperComposition
  instanceLayer?: PaperInstanceLayer
  savedFingerprint?: string
  paperStatus?: PaperStatus
}

export function useExaminationEditorSession({
  paperId,
  setup: initialSetup,
  composition: initialComposition,
  instanceLayer: initialLayer,
  savedFingerprint: initialSavedFp = '',
  paperStatus: initialStatus = 'draft',
}: Initial) {
  const { user, isAdmin } = useAuth()
  const { push: toast } = useToast()
  const school = useSchoolBranding()

  const [setup, setSetup] = useState(initialSetup)
  const [composition] = useState(initialComposition)
  const [instanceLayer, setInstanceLayer] = useState(
    () => initialLayer ?? defaultPaperInstanceLayer(),
  )
  const [paperStatus] = useState<PaperStatus>(initialStatus)
  const [savedFingerprint, setSavedFingerprint] = useState(initialSavedFp)
  const [savedAtMs, setSavedAtMs] = useState<number | null>(
    initialSavedFp ? Date.now() : null,
  )
  const [saveStatus, setSaveStatus] = useState<EditorSaveStatus>(
    initialSavedFp ? 'saved' : 'unsaved',
  )

  const sections = useMemo(() => sectionsForSetup(setup), [setup])
  const resolved = useMemo(
    () => resolvePaper(setup, sections, composition, instanceLayer, school),
    [setup, sections, composition, instanceLayer, school],
  )

  const currentFingerprint = useMemo(
    () => buildCompositionFingerprint(setup, composition, sections, instanceLayer),
    [setup, composition, sections, instanceLayer],
  )

  const isDirty = currentFingerprint !== savedFingerprint
  const readOnly = isReadOnlyPaperBuilder(paperStatus, isAdmin)
  const saveHint = formatSavedAt(savedAtMs)

  useEffect(() => {
    if (saveStatus === 'saving') return
    if (isDirty) setSaveStatus('unsaved')
    else if (saveStatus !== 'error') setSaveStatus('saved')
  }, [isDirty, savedFingerprint, saveStatus])

  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const persist = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast('Sign in to save', 'info')
      return false
    }
    if (readOnly) return false

    setSaveStatus('saving')
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots, instanceLayer)
      storeSetup(setup)
      await updatePaper(paperId, input)
      setSavedFingerprint(currentFingerprint)
      setSavedAtMs(Date.now())
      setSaveStatus('saved')
      toast('Examination formatting saved', 'success')
      return true
    } catch (err) {
      setSaveStatus('error')
      toast(parsePaperError(err), 'info')
      return false
    }
  }, [user, readOnly, composition, sections, setup, instanceLayer, paperId, currentFingerprint, toast])

  const save = useCallback(async () => {
    await persist()
  }, [persist])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save])

  return {
    paperId,
    setup,
    setSetup,
    composition,
    instanceLayer,
    setInstanceLayer,
    sections,
    resolved,
    readOnly,
    paperStatus,
    saveStatus,
    saveHint,
    isDirty,
    save,
    persist,
    currentFingerprint,
    savedFingerprint,
  }
}
