/** Local draft persistence for interrupted editing sessions. */

export type DraftScope = 'paper-builder' | 'examination-editor' | 'blueprint-builder'

const STORAGE_PREFIX = 'pc-draft-v1:'
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type LocalDraftEnvelope<T> = {
  version: 1
  scope: DraftScope
  resourceId: string
  savedAtMs: number
  fingerprint: string
  serverFingerprint: string
  payload: T
}

function storageKey(scope: DraftScope, resourceId: string): string {
  return `${STORAGE_PREFIX}${scope}:${resourceId}`
}

function safeParse<T>(raw: string): LocalDraftEnvelope<T> | null {
  try {
    const data = JSON.parse(raw) as LocalDraftEnvelope<T>
    if (data?.version !== 1 || !data.scope || !data.resourceId) return null
    if (Date.now() - data.savedAtMs > DRAFT_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

export function readLocalDraft<T>(
  scope: DraftScope,
  resourceId: string,
): LocalDraftEnvelope<T> | null {
  try {
    const raw = localStorage.getItem(storageKey(scope, resourceId))
    if (!raw) return null
    const parsed = safeParse<T>(raw)
    if (!parsed || parsed.scope !== scope || parsed.resourceId !== resourceId) return null
    return parsed
  } catch {
    return null
  }
}

export function writeLocalDraft<T>(draft: Omit<LocalDraftEnvelope<T>, 'version' | 'savedAtMs'>): void {
  try {
    const envelope: LocalDraftEnvelope<T> = {
      version: 1,
      ...draft,
      savedAtMs: Date.now(),
    }
    localStorage.setItem(storageKey(draft.scope, draft.resourceId), JSON.stringify(envelope))
  } catch {
    /* quota / private mode */
  }
}

export function clearLocalDraft(scope: DraftScope, resourceId: string): void {
  try {
    localStorage.removeItem(storageKey(scope, resourceId))
  } catch {
    /* ignore */
  }
}

export function hasRecoverableDraft<T>(
  scope: DraftScope,
  resourceId: string,
  serverFingerprint: string,
): LocalDraftEnvelope<T> | null {
  const local = readLocalDraft<T>(scope, resourceId)
  if (!local) return null
  if (local.fingerprint === serverFingerprint) return null
  return local
}

export function formatRecoveryTime(savedAtMs: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - savedAtMs) / 1000))
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} minutes ago`
  return new Date(savedAtMs).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
