/** Lightweight multi-tab awareness via localStorage heartbeat. */

const LOCK_PREFIX = 'pc-tab-lock:'
const STALE_MS = 12_000

export type TabLockKind = 'paper' | 'blueprint'

function lockKey(kind: TabLockKind, resourceId: string): string {
  return `${LOCK_PREFIX}${kind}:${resourceId}`
}

function tabId(): string {
  if (typeof sessionStorage === 'undefined') return 'unknown'
  let id = sessionStorage.getItem('pc-tab-id')
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('pc-tab-id', id)
  }
  return id
}

type LockRecord = {
  tabId: string
  updatedAtMs: number
}

export function claimTabLock(kind: TabLockKind, resourceId: string): void {
  try {
    const record: LockRecord = { tabId: tabId(), updatedAtMs: Date.now() }
    localStorage.setItem(lockKey(kind, resourceId), JSON.stringify(record))
  } catch {
    /* ignore */
  }
}

export function releaseTabLock(kind: TabLockKind, resourceId: string): void {
  try {
    const raw = localStorage.getItem(lockKey(kind, resourceId))
    if (!raw) return
    const record = JSON.parse(raw) as LockRecord
    if (record.tabId === tabId()) {
      localStorage.removeItem(lockKey(kind, resourceId))
    }
  } catch {
    /* ignore */
  }
}

export function readTabConflict(
  kind: TabLockKind,
  resourceId: string,
): boolean {
  try {
    const raw = localStorage.getItem(lockKey(kind, resourceId))
    if (!raw) return false
    const record = JSON.parse(raw) as LockRecord
    if (record.tabId === tabId()) return false
    return Date.now() - record.updatedAtMs < STALE_MS
  } catch {
    return false
  }
}
