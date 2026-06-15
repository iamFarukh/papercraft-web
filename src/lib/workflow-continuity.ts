type JsonRecord = Record<string, unknown>

const KEY_PREFIX = 'pc-continuity-v1:'

function key(scope: string, resourceId = 'global'): string {
  return `${KEY_PREFIX}${scope}:${resourceId}`
}

export function readContinuityState<T extends JsonRecord>(
  scope: string,
  resourceId?: string,
): T | null {
  try {
    const raw = localStorage.getItem(key(scope, resourceId))
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeContinuityState(
  scope: string,
  value: JsonRecord,
  resourceId?: string,
): void {
  try {
    localStorage.setItem(key(scope, resourceId), JSON.stringify(value))
  } catch {
    /* ignore private/quota mode */
  }
}

export function readContinuityScroll(scope: string, resourceId?: string): number {
  const state = readContinuityState<{ scrollTop?: number }>(scope, resourceId)
  return Math.max(0, Number(state?.scrollTop ?? 0))
}

export function writeContinuityScroll(
  scope: string,
  scrollTop: number,
  resourceId?: string,
): void {
  writeContinuityState(scope, { scrollTop: Math.max(0, Math.floor(scrollTop)) }, resourceId)
}
