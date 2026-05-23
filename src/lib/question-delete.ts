/** Soft-delete retention before permanent removal (admin-only recovery window). */
export const DELETE_RETENTION_MS = 12 * 60 * 60 * 1000

export function deletedAtMs(deletedAt?: { toMillis?: () => number }): number | null {
  const ms = deletedAt?.toMillis?.()
  return ms && ms > 0 ? ms : null
}

export function purgeDeadlineMs(deletedAt?: { toMillis?: () => number }): number | null {
  const ms = deletedAtMs(deletedAt)
  return ms ? ms + DELETE_RETENTION_MS : null
}

export function isSoftDeleted(deletedAt?: { toMillis?: () => number }): boolean {
  return deletedAtMs(deletedAt) !== null
}

export function canRestoreDelete(deletedAt?: { toMillis?: () => number }): boolean {
  const deadline = purgeDeadlineMs(deletedAt)
  return deadline !== null && Date.now() < deadline
}

export function isPurgeDue(deletedAt?: { toMillis?: () => number }): boolean {
  const deadline = purgeDeadlineMs(deletedAt)
  return deadline !== null && Date.now() >= deadline
}

export function formatRestoreTimeLeft(deletedAtMs: number): string {
  const left = deletedAtMs + DELETE_RETENTION_MS - Date.now()
  if (left <= 0) return 'expired'
  const hours = Math.floor(left / (60 * 60 * 1000))
  const mins = Math.floor((left % (60 * 60 * 1000)) / (60 * 1000))
  if (hours > 0) return `${hours}h ${mins}m left to restore`
  return `${mins}m left to restore`
}
