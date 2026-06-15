import { useCallback, useEffect, useRef, useState } from 'react'
import { parseProfileSaveError, updateProfileDocument } from '@/services/firebase/profile'
import type { ProfileSettings } from '@/types/profile-settings'
import { DEFAULT_PROFILE_SETTINGS } from '@/types/profile-settings'
import type { UserProfile } from '@/types/user-profile'

export type ProfileSaveState = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

export type ProfileDraft = {
  displayName: string
  settings: ProfileSettings
}

function draftFromProfile(profile: UserProfile): ProfileDraft {
  return {
    displayName: profile.displayName,
    settings: { ...DEFAULT_PROFILE_SETTINGS, ...profile.settings },
  }
}

function draftsEqual(a: ProfileDraft, b: ProfileDraft): boolean {
  return (
    a.displayName === b.displayName &&
    JSON.stringify(a.settings) === JSON.stringify(b.settings)
  )
}

export function useProfileEditor(profile: UserProfile | null) {
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [saveState, setSaveState] = useState<ProfileSaveState>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const baselineRef = useRef<ProfileDraft | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)

  useEffect(() => {
    if (!profile) return
    const next = draftFromProfile(profile)
    baselineRef.current = next
    setDraft(next)
    setSaveState('idle')
    setSaveError(null)
  }, [profile?.uid, profile])

  const flushSave = useCallback(async () => {
    if (!profile || !draft || !baselineRef.current) return
    if (draftsEqual(draft, baselineRef.current)) {
      setSaveState('idle')
      return
    }
    if (savingRef.current) return

    savingRef.current = true
    setSaveState('saving')
    setSaveError(null)

    try {
      await updateProfileDocument(profile.uid, {
        displayName: draft.displayName,
        settings: draft.settings,
      })
      baselineRef.current = draft
      setSavedAt(Date.now())
      setSaveState('saved')
    } catch (err) {
      setSaveError(parseProfileSaveError(err))
      setSaveState('error')
    } finally {
      savingRef.current = false
    }
  }, [draft, profile])

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSaveState('pending')
    debounceRef.current = setTimeout(() => {
      void flushSave()
    }, 700)
  }, [flushSave])

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const patchDraft = useCallback(
    (patch: Partial<ProfileDraft> | ((prev: ProfileDraft) => ProfileDraft)) => {
      setDraft((prev) => {
        if (!prev) return prev
        const next =
          typeof patch === 'function'
            ? patch(prev)
            : {
                displayName: patch.displayName ?? prev.displayName,
                settings: patch.settings
                  ? { ...prev.settings, ...patch.settings }
                  : prev.settings,
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

  const patchSettings = useCallback(
    (patch: Partial<ProfileSettings>) => {
      patchDraft((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }))
    },
    [patchDraft],
  )

  return {
    draft,
    patchDraft,
    patchSettings,
    saveState,
    saveError,
    savedAt,
    flushSave,
  }
}
