import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useConnectivityState } from '@/context/ConnectivityContext'
import { useSchoolBranding } from '@/hooks/useSchoolBranding'
import { useLocalDraftAutosave } from '@/hooks/useLocalDraftAutosave'
import { useEditorTabLock } from '@/hooks/useEditorTabLock'
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
import { isBrowserOnline } from '@/lib/connectivity'
import { isReadOnlyPaperBuilder } from '@/lib/paper-submission'
import { saveConfidenceLabel, type ConfidenceSaveStatus } from '@/lib/save-confidence'
import { parsePaperError, updatePaper } from '@/services/firebase/papers'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperStatus } from '@/types/paper'

export type EditorSaveStatus = ConfidenceSaveStatus

type EditorDraftPayload = {
  setup: PaperSetupState
  instanceLayer: PaperInstanceLayer
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
  const { isOnline, justReconnected, clearReconnected } = useConnectivityState()
  const school = useSchoolBranding()
  const persistRef = useRef<() => Promise<boolean>>(async () => false)

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

  const draftAutosave = useLocalDraftAutosave<EditorDraftPayload>({
    scope: 'examination-editor',
    resourceId: paperId,
    enabled: !readOnly,
    fingerprint: currentFingerprint,
    serverFingerprint: savedFingerprint,
    payload: { setup, instanceLayer },
  })

  const { conflict: tabConflict } = useEditorTabLock({
    kind: 'paper',
    resourceId: paperId,
    enabled: !readOnly,
  })

  const saveHint = useMemo(
    () => saveConfidenceLabel(saveStatus, { savedAtMs, isDirty }),
    [saveStatus, savedAtMs, isDirty],
  )

  useEffect(() => {
    if (saveStatus === 'saving') return
    if (isDirty) setSaveStatus('unsaved')
    else if (saveStatus !== 'error' && saveStatus !== 'offline') setSaveStatus('saved')
  }, [isDirty, savedFingerprint, saveStatus])

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

  const persist = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast('Sign in to save', 'info')
      return false
    }
    if (readOnly) return false
    if (!isBrowserOnline()) {
      setSaveStatus('offline')
      toast(
        'You are offline. Formatting changes are saved on this device and will sync when you reconnect.',
        'info',
      )
      return false
    }

    setSaveStatus('saving')
    try {
      const sectionSnapshots = compositionToPaperSections(composition, sections)
      const input = setupToSaveInput(setup, sectionSnapshots, instanceLayer)
      storeSetup(setup)
      await updatePaper(paperId, input)
      setSavedFingerprint(currentFingerprint)
      setSavedAtMs(Date.now())
      setSaveStatus('saved')
      draftAutosave.clearOnSync()
      toast('Examination formatting saved', 'success')
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
    readOnly,
    composition,
    sections,
    setup,
    instanceLayer,
    paperId,
    currentFingerprint,
    toast,
    draftAutosave,
  ])

  persistRef.current = persist

  useEffect(() => {
    if (!isOnline || readOnly) return
    if ((saveStatus === 'offline' || saveStatus === 'error') && isDirty) {
      setSaveStatus('retrying')
      void persistRef.current()
    }
  }, [isOnline, readOnly, saveStatus, isDirty])

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
    tabConflict,
    draftRecovery: {
      showRecovery: draftAutosave.showRecovery,
      recoveryLabel: draftAutosave.recoveryLabel,
      applyRecovery: () => {
        const recovered = draftAutosave.applyRecovery()
        if (!recovered) return
        setSetup(recovered.setup)
        setInstanceLayer(recovered.instanceLayer)
        setSaveStatus('unsaved')
        toast('Recovered your local formatting draft.', 'success')
      },
      dismissRecovery: draftAutosave.dismissRecovery,
    },
  }
}
