import { useCallback, useEffect, useRef, useState } from 'react'
import { saveWorkspaceSettings } from '@/services/firebase/workspace-settings'
import { DEFAULT_WORKSPACE_SETTINGS } from '@/lib/workspace-settings-defaults'
import type { WorkspaceSettings } from '@/types/workspace-settings'

export type SettingsSaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

function draftsEqual(a: WorkspaceSettings, b: WorkspaceSettings): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function useWorkspaceSettingsEditor(source: WorkspaceSettings | null) {
  const [draft, setDraft] = useState<WorkspaceSettings | null>(null)
  const [saveState, setSaveState] = useState<SettingsSaveState>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const baselineRef = useRef<WorkspaceSettings | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!source) return
    baselineRef.current = source
    setDraft(source)
    setSaveState('idle')
    setSaveError(null)
  }, [source?.updatedAtMs, source])

  const flushSave = useCallback(async () => {
    if (!draft || !baselineRef.current) return
    if (draftsEqual(draft, baselineRef.current)) {
      setSaveState('idle')
      return
    }
    if (savingRef.current) return

    savingRef.current = true
    setSaveState('saving')
    setSaveError(null)

    try {
      await saveWorkspaceSettings(draft)
      baselineRef.current = draft
      setSavedAt(Date.now())
      setSaveState('saved')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save settings.')
      setSaveState('error')
    } finally {
      savingRef.current = false
    }
  }, [draft])

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveState('pending')
    debounceRef.current = setTimeout(() => {
      void flushSave()
    }, 750)
  }, [flushSave])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const patchSettings = useCallback(
    (patch: Partial<WorkspaceSettings>) => {
      setDraft((prev) => {
        if (!prev) return prev
        const next: WorkspaceSettings = {
          identity: patch.identity ?? prev.identity,
          academic: patch.academic ?? prev.academic,
          paper: patch.paper ?? prev.paper,
          notifications: patch.notifications ?? prev.notifications,
          workspace: patch.workspace ?? prev.workspace,
          export: patch.export ?? prev.export,
          session: patch.session ?? prev.session,
          updatedAtMs: prev.updatedAtMs,
        }
        if (baselineRef.current && draftsEqual(next, baselineRef.current)) {
          setSaveState('idle')
        } else {
          scheduleSave()
        }
        return next
      })
    },
    [scheduleSave],
  )

  const resetDraft = useCallback(() => {
    const base = baselineRef.current ?? DEFAULT_WORKSPACE_SETTINGS
    setDraft(base)
    setSaveState('idle')
    setSaveError(null)
  }, [])

  return {
    draft,
    patchSettings,
    saveState,
    saveError,
    savedAt,
    resetDraft,
    flushSave,
  }
}
