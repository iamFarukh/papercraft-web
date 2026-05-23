import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { QuestionDocument } from '@/types/question'

const COLLECTION = 'questions'
const BATCH_LIMIT = 400

export async function batchImportQuestions(
  docs: Omit<QuestionDocument, 'createdAt' | 'updatedAt'>[],
  createdBy: string,
): Promise<string[]> {
  if (docs.length === 0) return []

  const ids: string[] = []

  for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
    const chunk = docs.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)

    for (const data of chunk) {
      const ref = doc(collection(db, COLLECTION))
      ids.push(ref.id)
      batch.set(ref, {
        ...data,
        status: 'draft',
        source: 'bulk_import',
        createdBy,
        usageCount: data.usageCount ?? 0,
        importedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }

    await batch.commit()
  }

  return ids
}
