import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  writeBatch,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ALL_STATUSES } from '@/lib/question-status'
import { QUESTION_SEED } from '@/data/question-seed'
import type {
  QuestionDocument,
  QuestionQueryFilters,
  QuestionStatus,
} from '@/types/question'

const COLLECTION = 'questions'
const PAGE_SIZE = 50
const FETCH_TIMEOUT_MS = 15_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s`)),
        ms,
      )
    }),
  ])
}

function isIndexOrTimeoutError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : ''
  return (
    code === 'failed-precondition' ||
    /index/i.test(msg) ||
    /timed out/i.test(msg)
  )
}

export type GetQuestionsOptions = {
  filters: QuestionQueryFilters
  isAdmin: boolean
  pageSize?: number
  startAfterDoc?: QueryDocumentSnapshot | null
}

export type GetQuestionsPage = {
  items: { id: string; data: QuestionDocument }[]
  lastDoc: QueryDocumentSnapshot | null
  hasMore: boolean
}

function active<T extends string>(values: T[]): T[] {
  return values.filter(Boolean)
}

/**
 * Minimal Firestore query — class, subject, chapter, difficulty, and type
 * are filtered client-side to avoid the 30-disjunction limit.
 */
function buildConstraints(
  options: GetQuestionsOptions,
  useOrderBy = true,
): QueryConstraint[] {
  const { filters, isAdmin } = options
  const constraints: QueryConstraint[] = []

  if (!isAdmin) {
    constraints.push(where('status', '==', 'published'))
  } else {
    const statuses = active(filters.statuses)
    const allStatusesSelected = statuses.length >= ALL_STATUSES.length
    if (!allStatusesSelected && statuses.length === 1) {
      constraints.push(where('status', '==', statuses[0]))
    }
  }

  if (useOrderBy) {
    constraints.push(orderBy('updatedAt', 'desc'))
  }

  return constraints
}

async function runQuestionsQuery(
  options: GetQuestionsOptions,
  useOrderBy: boolean,
): Promise<GetQuestionsPage> {
  const pageSize = options.pageSize ?? PAGE_SIZE
  const constraints = buildConstraints(options, useOrderBy)

  let q = query(collection(db, COLLECTION), ...constraints, limit(pageSize + 1))

  if (options.startAfterDoc) {
    q = query(
      collection(db, COLLECTION),
      ...constraints,
      startAfter(options.startAfterDoc),
      limit(pageSize + 1),
    )
  }

  const snap = await getDocs(q)
  let docs = [...snap.docs]

  if (!useOrderBy) {
    docs.sort(
      (a, b) =>
        (b.data().updatedAt?.toMillis?.() ?? 0) -
        (a.data().updatedAt?.toMillis?.() ?? 0),
    )
  }

  const hasMore = docs.length > pageSize
  const page = hasMore ? docs.slice(0, pageSize) : docs

  return {
    items: page.map((d) => ({
      id: d.id,
      data: d.data() as QuestionDocument,
    })),
    lastDoc: page.length > 0 ? page[page.length - 1]! : null,
    hasMore,
  }
}

export async function getQuestions(
  options: GetQuestionsOptions,
): Promise<GetQuestionsPage> {
  const pageSize = options.pageSize ?? PAGE_SIZE

  try {
    return await withTimeout(
      runQuestionsQuery(options, true),
      FETCH_TIMEOUT_MS,
      'Load questions',
    )
  } catch (err) {
    if (isIndexOrTimeoutError(err)) {
      try {
        return await withTimeout(
          runQuestionsQuery(options, false),
          FETCH_TIMEOUT_MS,
          'Load questions (fallback)',
        )
      } catch {
        // Last resort: plain collection read (empty DB / missing index)
        const snap = await withTimeout(
          getDocs(query(collection(db, COLLECTION), limit(pageSize + 1))),
          FETCH_TIMEOUT_MS,
          'Load questions (simple)',
        )
        const docs = [...snap.docs]
        const hasMore = docs.length > pageSize
        const page = hasMore ? docs.slice(0, pageSize) : docs
        return {
          items: page.map((d) => ({
            id: d.id,
            data: d.data() as QuestionDocument,
          })),
          lastDoc: page.length > 0 ? page[page.length - 1]! : null,
          hasMore,
        }
      }
    }
    throw err
  }
}

export async function getQuestionById(id: string): Promise<QuestionDocument | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return snap.data() as QuestionDocument
}

export async function createQuestion(
  data: Omit<QuestionDocument, 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = doc(collection(db, COLLECTION))
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateQuestion(
  id: string,
  data: Partial<QuestionDocument>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function archiveQuestion(id: string): Promise<void> {
  await updateQuestion(id, { status: 'archived' })
}

export async function updateQuestionStatus(
  id: string,
  status: QuestionStatus,
): Promise<void> {
  await updateQuestion(id, { status })
}

const BATCH_LIMIT = 500

export async function batchUpdateQuestionStatus(
  ids: string[],
  status: QuestionStatus,
): Promise<void> {
  if (ids.length === 0) return

  for (let i = 0; i < ids.length; i += BATCH_LIMIT) {
    const chunk = ids.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    for (const id of chunk) {
      batch.update(doc(db, COLLECTION, id), {
        status,
        updatedAt: serverTimestamp(),
      })
    }
    await batch.commit()
  }
}

/** Seed RBSE sample questions (admin-only in production rules) */
export async function seedQuestions(): Promise<number> {
  const existing = await getDocs(
    query(collection(db, COLLECTION), limit(1)),
  )
  if (!existing.empty) {
    return 0
  }

  const batch = writeBatch(db)
  for (const item of QUESTION_SEED) {
    const ref = doc(collection(db, COLLECTION))
    batch.set(ref, {
      ...item,
      usageCount: item.usageCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return QUESTION_SEED.length
}

export function parseFirestoreError(err: unknown): {
  kind: 'network' | 'permission' | 'unknown'
  message: string
} {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''

  if (code === 'permission-denied') {
    return {
      kind: 'permission',
      message:
        'You do not have permission to view these questions. Contact your administrator.',
    }
  }
  if (
    code === 'unavailable' ||
    code === 'deadline-exceeded' ||
    code === 'failed-precondition'
  ) {
    return {
      kind: 'network',
      message: 'Unable to reach the repository. Check your connection and try again.',
    }
  }

  const msg =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : 'Something went wrong loading questions.'

  if (/index/i.test(msg)) {
    return {
      kind: 'unknown',
      message:
        'A Firestore index is required for this filter combination. See the browser console for the index link.',
    }
  }

  if (/timed out/i.test(msg)) {
    return {
      kind: 'network',
      message:
        'Firestore is not responding. Check your network, disable ad blockers for this site, and confirm Firestore rules are deployed.',
    }
  }

  if (/disjunction/i.test(msg)) {
    return {
      kind: 'unknown',
      message:
        'Too many filters active for Firestore. Reload the page — filters now run locally after load.',
    }
  }

  return { kind: 'unknown', message: msg }
}

export { ALL_STATUSES }
