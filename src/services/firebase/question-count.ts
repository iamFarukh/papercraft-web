import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const COLLECTION = 'questions'
const PAGE_SIZE = 250

function questionsCol() {
  return collection(db, COLLECTION)
}

function constraintsForRole(isAdmin: boolean): QueryConstraint[] {
  if (isAdmin) {
    return []
  }
  /** Rules already hide trashed / non-published docs from teachers. */
  return [where('status', '==', 'published')]
}

async function countByPaging(constraints: QueryConstraint[]): Promise<number> {
  let total = 0
  let cursor: QueryDocumentSnapshot | undefined

  for (;;) {
    const pageConstraints = cursor
      ? [...constraints, startAfter(cursor), limit(PAGE_SIZE)]
      : [...constraints, limit(PAGE_SIZE)]
    const snap = await getDocs(query(questionsCol(), ...pageConstraints))
    total += snap.size
    if (snap.size < PAGE_SIZE) break
    cursor = snap.docs[snap.docs.length - 1]
  }

  return total
}

/**
 * Count questions visible to the current role (published for teachers, all for admin).
 */
export async function fetchQuestionCount(isAdmin: boolean): Promise<number> {
  const constraints = constraintsForRole(isAdmin)
  const q = query(questionsCol(), ...constraints)

  try {
    const snap = await getCountFromServer(q)
    return snap.data().count
  } catch {
    return countByPaging(constraints)
  }
}

/**
 * Re-fetch count when the repository changes (listen to latest updated question).
 */
export function subscribeQuestionCountRefresh(
  isAdmin: boolean,
  onRefresh: () => void,
): () => void {
  const constraints = constraintsForRole(isAdmin)
  const q = query(
    questionsCol(),
    ...constraints,
    orderBy('updatedAt', 'desc'),
    limit(1),
  )

  let timer: ReturnType<typeof setTimeout> | undefined

  const schedule = () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(onRefresh, 800)
  }

  return onSnapshot(q, schedule, schedule)
}
