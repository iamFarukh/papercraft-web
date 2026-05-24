import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { fileToCompressedDataUrl } from '@/lib/image-data-url'
import { db } from '@/lib/firebase'
import type { ProfileSettings } from '@/types/profile-settings'

export type ProfileActivityStats = {
  papersCreated: number
  approvalsCompleted: number
  questionsAuthored: number
  lastActiveMs: number | null
}

export type ProfileSavePayload = {
  displayName?: string
  settings?: Partial<ProfileSettings>
  photoURL?: string | null
}

export async function updateProfileDocument(
  uid: string,
  payload: ProfileSavePayload,
): Promise<void> {
  const patch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  }

  if (payload.displayName !== undefined) {
    patch.displayName = payload.displayName.trim()
  }

  if (payload.photoURL !== undefined) {
    patch.photoURL = payload.photoURL
  }

  if (payload.settings) {
    patch.settings = payload.settings
  }

  await updateDoc(doc(db, 'users', uid), patch)
}

/** Profile photo stored in Firestore as a compressed data URL (no Cloud Storage). */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const dataUrl = await fileToCompressedDataUrl(file, {
    maxEdgePx: 256,
    maxBytes: 90_000,
  })
  await updateProfileDocument(uid, { photoURL: dataUrl })
  return dataUrl
}

export async function removeProfilePhoto(uid: string): Promise<void> {
  await updateProfileDocument(uid, { photoURL: null })
}

export async function fetchProfileActivityStats(
  uid: string,
  role: 'admin' | 'teacher',
): Promise<ProfileActivityStats> {
  const papersSnap = await getDocs(
    query(collection(db, 'papers'), where('createdBy', '==', uid)),
  )

  let papersCreated = 0
  let approvalsCompleted = 0
  let lastActiveMs: number | null = null

  for (const d of papersSnap.docs) {
    const data = d.data()
    papersCreated += 1
    const updated = data.updatedAt as { toMillis?: () => number } | undefined
    const ms = updated?.toMillis?.() ?? 0
    if (ms) {
      lastActiveMs = lastActiveMs === null ? ms : Math.max(lastActiveMs, ms)
    }
    if (role === 'admin' && data.approvedBy === uid) {
      approvalsCompleted += 1
    }
    if (role === 'teacher' && data.submittedBy === uid && data.status !== 'draft') {
      approvalsCompleted += 1
    }
  }

  let questionsAuthored = 0
  if (role === 'admin') {
    try {
      const qSnap = await getDocs(
        query(collection(db, 'questions'), where('createdBy', '==', uid)),
      )
      questionsAuthored = qSnap.size
    } catch {
      questionsAuthored = 0
    }
  }

  return {
    papersCreated,
    approvalsCompleted,
    questionsAuthored,
    lastActiveMs,
  }
}
