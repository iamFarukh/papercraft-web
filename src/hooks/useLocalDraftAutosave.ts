import { useCallback, useEffect, useRef, useState } from 'react'
import {
  clearLocalDraft,
  formatRecoveryTime,
  hasRecoverableDraft,
  readLocalDraft,
  writeLocalDraft,
  type DraftScope,
  type LocalDraftEnvelope,
} from '@/lib/draft-recovery'

type Options<T> = {
  scope: DraftScope
  resourceId: string
  enabled: boolean
  fingerprint: string
  serverFingerprint: string
  payload: T
  debounceMs?: number
}

export function useLocalDraftAutosave<T>({
  scope,
  resourceId,
  enabled,
  fingerprint,
  serverFingerprint,
  payload,
  debounceMs = 2000,
}: Options<T>) {
  const [recoveryDraft, setRecoveryDraft] = useState<LocalDraftEnvelope<T> | null>(
    null,
  )
  const [recoveryDismissed, setRecoveryDismissed] = useState(false)
  const checkedRef = useRef(false)

  useEffect(() => {
    checkedRef.current = false
    setRecoveryDismissed(false)
    setRecoveryDraft(null)
  }, [scope, resourceId])

  useEffect(() => {
    if (!enabled || checkedRef.current) return
    checkedRef.current = true
    const recoverable = hasRecoverableDraft<T>(scope, resourceId, serverFingerprint)
    if (recoverable) setRecoveryDraft(recoverable)
  }, [enabled, scope, resourceId, serverFingerprint])

  useEffect(() => {
    if (!enabled) return
    const timer = window.setTimeout(() => {
      writeLocalDraft({
        scope,
        resourceId,
        fingerprint,
        serverFingerprint,
        payload,
      })
    }, debounceMs)
    return () => window.clearTimeout(timer)
  }, [enabled, scope, resourceId, fingerprint, serverFingerprint, payload, debounceMs])

  const applyRecovery = useCallback((): T | null => {
    if (!recoveryDraft) return null
    setRecoveryDismissed(true)
    setRecoveryDraft(null)
    return recoveryDraft.payload
  }, [recoveryDraft])

  const dismissRecovery = useCallback(() => {
    setRecoveryDismissed(true)
    setRecoveryDraft(null)
    clearLocalDraft(scope, resourceId)
  }, [scope, resourceId])

  const clearOnSync = useCallback(() => {
    clearLocalDraft(scope, resourceId)
    setRecoveryDraft(null)
  }, [scope, resourceId])

  const recoveryLabel = recoveryDraft
    ? formatRecoveryTime(recoveryDraft.savedAtMs)
    : null

  return {
    showRecovery: Boolean(recoveryDraft) && !recoveryDismissed,
    recoveryLabel,
    applyRecovery,
    dismissRecovery,
    clearOnSync,
    readCached: () => readLocalDraft<T>(scope, resourceId),
  }
}
