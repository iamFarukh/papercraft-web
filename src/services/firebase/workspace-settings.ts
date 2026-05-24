import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { fileToCompressedDataUrl } from '@/lib/image-data-url'
import { db } from '@/lib/firebase'
import { parseWorkspaceSettings } from '@/lib/workspace-settings-parse'
import {
  DEFAULT_WORKSPACE_SETTINGS,
  schoolBrandingFromSettings,
  WORKSPACE_SETTINGS_DOC_ID,
} from '@/lib/workspace-settings-defaults'
import type { SchoolBranding } from '@/lib/paper-builder'
import type { WorkspaceSettings } from '@/types/workspace-settings'

const COLLECTION = 'workspace_settings'

export async function fetchWorkspaceSettings(): Promise<WorkspaceSettings> {
  const snap = await getDoc(doc(db, COLLECTION, WORKSPACE_SETTINGS_DOC_ID))
  if (!snap.exists()) return { ...DEFAULT_WORKSPACE_SETTINGS }
  return parseWorkspaceSettings(snap.data())
}

export async function fetchSchoolBranding(): Promise<SchoolBranding> {
  const settings = await fetchWorkspaceSettings()
  return schoolBrandingFromSettings(settings)
}

export function subscribeWorkspaceSettings(
  onData: (settings: WorkspaceSettings) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, COLLECTION, WORKSPACE_SETTINGS_DOC_ID),
    (snap) => {
      if (!snap.exists()) {
        onData({ ...DEFAULT_WORKSPACE_SETTINGS })
        return
      }
      onData(parseWorkspaceSettings(snap.data()))
    },
    (err) => onError?.(err),
  )
}

export async function saveWorkspaceSettings(
  settings: WorkspaceSettings,
): Promise<void> {
  const { updatedAtMs: _, ...payload } = settings
  await setDoc(
    doc(db, COLLECTION, WORKSPACE_SETTINGS_DOC_ID),
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

/**
 * School logo stored in workspace_settings as a compressed data URL (Spark plan).
 * Caller should patch identity.logoURL and autosave.
 */
export async function uploadSchoolLogo(file: File): Promise<string> {
  return fileToCompressedDataUrl(file, {
    maxEdgePx: 320,
    maxBytes: 110_000,
  })
}

/** No remote file to delete — clear logoURL in settings instead. */
export async function removeSchoolLogo(): Promise<void> {
  /* no-op */
}
