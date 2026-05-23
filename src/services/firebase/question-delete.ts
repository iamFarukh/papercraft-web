import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  canRestoreDelete,
  DELETE_RETENTION_MS,
  isSoftDeleted,
} from '@/lib/question-delete'
import { getQuestionById } from '@/services/firebase/questions'
import type { QuestionDocument, QuestionStatus } from '@/types/question'

const COLLECTION = 'questions'
const BATCH_LIMIT = 400

export type DeleteQuestionResult = {
  ok: boolean
  message: string
}

export type BulkDeleteResult = {
  deleted: string[]
  skipped: { id: string; reason: string }[]
}

function questionRef(id: string) {
  return doc(db, COLLECTION, id)
}

async function assertCanSoftDelete(id: string): Promise<{
  ok: boolean
  message: string
  status?: QuestionStatus
}> {
  const doc = await getQuestionById(id)
  if (!doc) {
    return { ok: false, message: 'Question not found.' }
  }
  if (isSoftDeleted(doc.deletedAt)) {
    return { ok: false, message: 'Already in trash.' }
  }
  return { ok: true, message: '', status: doc.status }
}

export async function softDeleteQuestion(
  id: string,
  deletedBy: string,
): Promise<DeleteQuestionResult> {
  const check = await assertCanSoftDelete(id)
  if (!check.ok) return { ok: false, message: check.message }

  await updateDoc(questionRef(id), {
    deletedAt: serverTimestamp(),
    deletedBy,
    statusBeforeDelete: check.status ?? 'draft',
    updatedAt: serverTimestamp(),
  })

  return { ok: true, message: 'Moved to trash. Recoverable for 12 hours.' }
}

export async function softDeleteQuestions(
  ids: string[],
  deletedBy: string,
): Promise<BulkDeleteResult> {
  const deleted: string[] = []
  const skipped: { id: string; reason: string }[] = []

  for (const id of ids) {
    const check = await assertCanSoftDelete(id)
    if (!check.ok) {
      skipped.push({ id, reason: check.message })
      continue
    }

    try {
      await updateDoc(questionRef(id), {
        deletedAt: serverTimestamp(),
        deletedBy,
        statusBeforeDelete: check.status ?? 'draft',
        updatedAt: serverTimestamp(),
      })
      deleted.push(id)
    } catch {
      skipped.push({ id, reason: 'Could not delete this question.' })
    }
  }

  return { deleted, skipped }
}

export async function restoreDeletedQuestion(id: string): Promise<DeleteQuestionResult> {
  const doc = await getQuestionById(id)
  if (!doc) return { ok: false, message: 'Question not found.' }
  if (!isSoftDeleted(doc.deletedAt)) {
    return { ok: false, message: 'This question is not in trash.' }
  }
  if (!canRestoreDelete(doc.deletedAt)) {
    return {
      ok: false,
      message: 'Recovery window expired. This question will be removed permanently.',
    }
  }

  await updateDoc(questionRef(id), {
    deletedAt: null,
    deletedBy: null,
    statusBeforeDelete: null,
    status: doc.statusBeforeDelete ?? doc.status ?? 'draft',
    updatedAt: serverTimestamp(),
  })

  return { ok: true, message: 'Question restored.' }
}

export async function restoreDeletedQuestions(ids: string[]): Promise<BulkDeleteResult> {
  const deleted: string[] = []
  const skipped: { id: string; reason: string }[] = []

  for (const id of ids) {
    const res = await restoreDeletedQuestion(id)
    if (res.ok) deleted.push(id)
    else skipped.push({ id, reason: res.message })
  }

  return { deleted, skipped }
}

/** Permanently remove questions whose trash retention has expired. */
export async function purgeExpiredDeletedQuestions(): Promise<number> {
  const cutoff = Timestamp.fromMillis(Date.now() - DELETE_RETENTION_MS)

  let snap
  try {
    snap = await getDocs(
      query(collection(db, COLLECTION), where('deletedAt', '<', cutoff)),
    )
  } catch {
    return 0
  }

  if (snap.empty) return 0

  let purged = 0
  const docs = [...snap.docs]

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const chunk = docs.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const d of chunk) {
      batch.delete(d.ref)
      purged++
    }
    await batch.commit()
  }

  return purged
}

export async function permanentlyDeleteQuestion(
  id: string,
): Promise<DeleteQuestionResult> {
  const doc = await getQuestionById(id)
  if (!doc) return { ok: false, message: 'Question not found.' }
  if (!isSoftDeleted(doc.deletedAt)) {
    return { ok: false, message: 'Only trashed questions can be purged early.' }
  }

  await deleteDoc(questionRef(id))
  return { ok: true, message: 'Question permanently deleted.' }
}
