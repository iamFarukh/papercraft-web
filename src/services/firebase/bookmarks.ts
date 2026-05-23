import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  BookmarkFolder,
  BookmarkFolderDocument,
  BookmarkIndexDocument,
  BookmarkItemDocument,
} from '@/types/bookmark'

function foldersCol(userId: string) {
  return collection(db, 'users', userId, 'bookmark_folders')
}

function folderRef(userId: string, folderId: string) {
  return doc(db, 'users', userId, 'bookmark_folders', folderId)
}

function itemsCol(userId: string, folderId: string) {
  return collection(db, 'users', userId, 'bookmark_folders', folderId, 'items')
}

function indexRef(userId: string, questionId: string) {
  return doc(db, 'users', userId, 'bookmark_index', questionId)
}

function mapFolder(id: string, data: BookmarkFolderDocument): BookmarkFolder {
  return {
    id,
    name: data.name,
    questionCount: Math.max(0, data.questionCount ?? 0),
    createdAtMs: data.createdAt?.toMillis?.() ?? Date.now(),
    updatedAtMs: data.updatedAt?.toMillis?.() ?? Date.now(),
  }
}

export function subscribeBookmarkFolders(
  userId: string,
  onData: (folders: BookmarkFolder[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    foldersCol(userId),
    (snap) => {
      const folders = snap.docs
        .map((d) => mapFolder(d.id, d.data() as BookmarkFolderDocument))
        .sort((a, b) => b.updatedAtMs - a.updatedAtMs)
      onData(folders)
    },
    (err) => onError?.(err),
  )
}

export function subscribeBookmarkIndex(
  userId: string,
  questionId: string,
  onFolderIds: (folderIds: string[]) => void,
): Unsubscribe {
  return onSnapshot(indexRef(userId, questionId), (snap) => {
    if (!snap.exists()) {
      onFolderIds([])
      return
    }
    const data = snap.data() as BookmarkIndexDocument
    onFolderIds(data.folderIds ?? [])
  })
}

export async function createBookmarkFolder(
  userId: string,
  name: string,
): Promise<string> {
  const ref = doc(foldersCol(userId))
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Folder name is required')

  await setDoc(ref, {
    name: trimmed,
    questionCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies BookmarkFolderDocument)

  return ref.id
}

export async function renameBookmarkFolder(
  userId: string,
  folderId: string,
  name: string,
): Promise<void> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Folder name is required')
  await updateDoc(folderRef(userId, folderId), {
    name: trimmed,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteBookmarkFolder(
  userId: string,
  folderId: string,
): Promise<void> {
  const itemsSnap = await getDocs(itemsCol(userId, folderId))
  const batch = writeBatch(db)

  for (const itemDoc of itemsSnap.docs) {
    batch.delete(itemDoc.ref)
  }
  batch.delete(folderRef(userId, folderId))
  await batch.commit()

  for (const itemDoc of itemsSnap.docs) {
    const questionId = itemDoc.id
    const idx = await getDoc(indexRef(userId, questionId))
    if (!idx.exists()) continue
    const folderIds = (idx.data() as BookmarkIndexDocument).folderIds ?? []
    const next = folderIds.filter((id) => id !== folderId)
    if (next.length === 0) {
      await deleteDoc(idx.ref)
    } else {
      await updateDoc(idx.ref, {
        folderIds: next,
        updatedAt: serverTimestamp(),
      })
    }
  }
}

export async function addQuestionToBookmarkFolder(
  userId: string,
  folderId: string,
  questionId: string,
): Promise<void> {
  const itemRef = doc(itemsCol(userId, folderId), questionId)
  const existing = await getDoc(itemRef)
  if (existing.exists()) return

  const batch = writeBatch(db)
  batch.set(itemRef, {
    questionId,
    addedAt: serverTimestamp(),
  } satisfies BookmarkItemDocument)
  batch.update(folderRef(userId, folderId), {
    questionCount: increment(1),
    updatedAt: serverTimestamp(),
  })
  batch.set(
    indexRef(userId, questionId),
    {
      folderIds: arrayUnion(folderId),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  await batch.commit()
}

export async function removeQuestionFromBookmarkFolder(
  userId: string,
  folderId: string,
  questionId: string,
): Promise<void> {
  const itemRef = doc(itemsCol(userId, folderId), questionId)
  const existing = await getDoc(itemRef)
  if (!existing.exists()) return

  const batch = writeBatch(db)
  batch.delete(itemRef)
  batch.update(folderRef(userId, folderId), {
    questionCount: increment(-1),
    updatedAt: serverTimestamp(),
  })
  batch.set(
    indexRef(userId, questionId),
    {
      folderIds: arrayRemove(folderId),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  await batch.commit()

  const idx = await getDoc(indexRef(userId, questionId))
  if (idx.exists()) {
    const ids = (idx.data() as BookmarkIndexDocument).folderIds ?? []
    if (ids.length === 0) await deleteDoc(idx.ref)
  }
}

export async function getBookmarkFolderQuestionIds(
  userId: string,
  folderId: string,
): Promise<string[]> {
  const snap = await getDocs(
    query(itemsCol(userId, folderId), orderBy('addedAt', 'desc')),
  )
  return snap.docs.map((d) => d.id)
}

export function subscribeBookmarkFolderQuestionIds(
  userId: string,
  folderId: string,
  onIds: (ids: string[]) => void,
): Unsubscribe {
  const q = query(itemsCol(userId, folderId), orderBy('addedAt', 'desc'))
  return onSnapshot(q, (snap) => {
    onIds(snap.docs.map((d) => d.id))
  })
}
