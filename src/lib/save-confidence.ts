/** Unified save-status labels for operational trust. */

export type ConfidenceSaveStatus =
  | 'saved'
  | 'saving'
  | 'unsaved'
  | 'error'
  | 'local'
  | 'syncing'
  | 'retrying'
  | 'offline'

export type SaveHintOptions = {
  savedAtMs?: number | null
  isDirty?: boolean
}

function formatSavedAt(savedAtMs: number | null | undefined): string {
  if (!savedAtMs) return 'All changes saved'
  const sec = Math.max(0, Math.floor((Date.now() - savedAtMs) / 1000))
  if (sec < 8) return 'All changes saved · just now'
  if (sec < 60) return `All changes saved · ${sec}s ago`
  return `All changes saved · ${Math.floor(sec / 60)}m ago`
}

export function saveConfidenceLabel(
  status: ConfidenceSaveStatus,
  opts: SaveHintOptions = {},
): string {
  switch (status) {
    case 'saving':
      return 'Syncing…'
    case 'syncing':
      return 'Syncing…'
    case 'retrying':
      return 'Retrying…'
    case 'offline':
      return 'Offline — changes saved on this device'
    case 'local':
      return 'Saved locally — will sync when online'
    case 'error':
      return 'Could not sync — your draft is still on this device'
    case 'unsaved':
      return opts.isDirty ? 'Unsaved changes' : 'Unsaved changes'
    case 'saved':
    default:
      return formatSavedAt(opts.savedAtMs)
  }
}

/** Legacy toolbar statuses map into confidence statuses. */
export type SaveUiStatus = ConfidenceSaveStatus
