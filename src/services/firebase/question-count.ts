import {
  collection,
  getCountFromServer,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'questions'

/**
 * Count questions visible to the current role (published for teachers, all for admin).
 */
export async function fetchQuestionCount(isAdmin: boolean): Promise<number> {
  const col = collection(db, COLLECTION)
  const q = isAdmin
    ? query(col)
    : query(
        col,
        where('status', '==', 'published'),
        where('deletedAt', '==', null),
      )
  const snap = await getCountFromServer(q)
  return snap.data().count
}

/**
 * Re-fetch count when any question document changes (lightweight signal).
 * Uses a single-doc listener on the most recently updated question as a change trigger.
 */
export function subscribeQuestionCountRefresh(
  isAdmin: boolean,
  onRefresh: () => void,
): () => void {
  const col = collection(db, COLLECTION)
  const q = isAdmin
    ? query(col)
    : query(
        col,
        where('status', '==', 'published'),
        where('deletedAt', '==', null),
      )

  let timer: ReturnType<typeof setTimeout> | undefined

  return onSnapshot(
    q,
    () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(onRefresh, 800)
    },
    () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(onRefresh, 800)
    },
  )
}
