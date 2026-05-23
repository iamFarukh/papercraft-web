import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  NotificationDocument,
  NotificationEntityKind,
  NotificationRecord,
  NotificationType,
} from '@/types/notification'

const COLLECTION = 'notifications'

function mapNotification(id: string, data: NotificationDocument): NotificationRecord {
  const created = data.createdAt as { toMillis?: () => number } | undefined
  return {
    id,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    entityId: data.entityId ?? null,
    entityKind: data.entityKind ?? null,
    read: Boolean(data.read),
    createdAtMs: created?.toMillis?.() ?? Date.now(),
  }
}

export async function createNotification(input: {
  userId: string
  type: NotificationType
  title: string
  message: string
  entityId?: string | null
  entityKind?: NotificationEntityKind | null
}): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    entityId: input.entityId ?? null,
    entityKind: input.entityKind ?? null,
    read: false,
    createdAt: serverTimestamp(),
  } satisfies NotificationDocument)
  return ref.id
}

export async function listAdminUserIds(): Promise<string[]> {
  const snap = await getDocs(query(collection(db, 'users'), where('role', '==', 'admin')))
  return snap.docs.map((d) => d.id)
}

export async function notifyAdmins(input: Omit<Parameters<typeof createNotification>[0], 'userId'>) {
  const adminIds = await listAdminUserIds()
  await Promise.all(
    adminIds.map((userId) =>
      createNotification({ ...input, userId }).catch(() => {
        /* best effort */
      }),
    ),
  )
}

export function subscribeNotifications(
  userId: string,
  onData: (rows: NotificationRecord[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => mapNotification(d.id, d.data() as NotificationDocument)))
    },
    (err) => onError?.(err),
  )
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { read: true })
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id))
}
