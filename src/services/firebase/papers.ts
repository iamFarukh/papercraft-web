import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getUserDisplayMap } from '@/services/firebase/users'
import type {
  ApprovalQueueItem,
  PaperDocument,
  PaperListItem,
  PaperStatus,
  SavePaperInput,
} from '@/types/paper'

const COLLECTION = 'papers'

export async function getPaperById(id: string): Promise<PaperDocument | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return snap.data() as PaperDocument
}

export async function createPaper(
  data: SavePaperInput,
  createdBy: string,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: data.status ?? 'draft',
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updatePaper(
  id: string,
  data: Partial<SavePaperInput> & { status?: PaperStatus },
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function submitPaperForApproval(
  id: string,
  data: SavePaperInput,
  submittedBy: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    status: 'submitted',
    submittedBy,
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

/** Admin: return a submitted or approved paper to draft for further editing. */
export async function reopenPaperAsDraft(
  id: string,
  data: SavePaperInput,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    status: 'draft',
    updatedAt: serverTimestamp(),
  })
}

export async function approvePaper(
  id: string,
  data: SavePaperInput,
  approvedBy: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    status: 'approved',
    approvedBy,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

type QueueRow = { id: string; data: PaperDocument }

function isMissingIndexError(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  return code === 'failed-precondition'
}

/**
 * Targeted, status-scoped queries so NO submitted paper is ever dropped from
 * the queue (the previous updatedAt+limit(150) scan silently lost any submitted
 * paper outside the 150 most-recently-updated docs). Requires composite indexes
 * on (status, submittedAt) and (status, approvedAt) — see firestore.indexes.json.
 * Falls back to the legacy scan if those indexes aren't deployed yet.
 */
export async function listApprovalQueue(max = 80): Promise<ApprovalQueueItem[]> {
  let rows: QueueRow[]
  try {
    const [submittedSnap, approvedSnap] = await Promise.all([
      getDocs(
        query(
          collection(db, COLLECTION),
          where('status', '==', 'submitted'),
          orderBy('submittedAt', 'desc'),
          limit(max),
        ),
      ),
      getDocs(
        query(
          collection(db, COLLECTION),
          where('status', '==', 'approved'),
          orderBy('approvedAt', 'desc'),
          limit(max),
        ),
      ),
    ])
    rows = [...submittedSnap.docs, ...approvedSnap.docs].map((d) => ({
      id: d.id,
      data: d.data() as PaperDocument,
    }))
  } catch (err) {
    if (!isMissingIndexError(err)) throw err
    // Index not deployed yet — fall back to the legacy single-collection scan.
    const snap = await getDocs(
      query(collection(db, COLLECTION), orderBy('updatedAt', 'desc'), limit(150)),
    )
    rows = snap.docs
      .map((d) => ({ id: d.id, data: d.data() as PaperDocument }))
      .filter(
        (r) => r.data.status === 'submitted' || r.data.status === 'approved',
      )
  }

  rows = rows
    .sort((a, b) => {
      const aMs =
        a.data.submittedAt?.toMillis?.() ?? a.data.updatedAt?.toMillis?.() ?? 0
      const bMs =
        b.data.submittedAt?.toMillis?.() ?? b.data.updatedAt?.toMillis?.() ?? 0
      return bMs - aMs
    })
    .slice(0, max)

  const uids = rows.flatMap((r) => [
    r.data.submittedBy ?? r.data.createdBy,
    r.data.createdBy,
  ])
  const labels = await getUserDisplayMap(uids)

  return rows.map(({ id, data }) => ({
    id,
    title: data.title,
    classLabel: data.classLabel,
    subject: data.subject,
    examType: data.examType,
    status: data.status ?? 'submitted',
    createdBy: data.createdBy,
    submittedBy: data.submittedBy ?? null,
    submittedAtMs: data.submittedAt?.toMillis?.() ?? null,
    approvedAtMs: data.approvedAt?.toMillis?.() ?? null,
    totalMarks: data.totalMarks,
    teacherLabel:
      labels.get(data.submittedBy ?? data.createdBy) ??
      labels.get(data.createdBy) ??
      'Teacher',
  }))
}

export async function listRecentPapers(opts: {
  userId: string
  isAdmin: boolean
  max?: number
}): Promise<PaperListItem[]> {
  const max = opts.max ?? 24
  const constraints = opts.isAdmin
    ? [orderBy('updatedAt', 'desc'), limit(max)]
    : [
        where('createdBy', '==', opts.userId),
        orderBy('updatedAt', 'desc'),
        limit(max),
      ]

  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints))
  return snap.docs.map((d) => {
    const data = d.data() as PaperDocument
    return {
      id: d.id,
      title: data.title,
      subject: data.subject,
      classLabel: data.classLabel,
      examType: data.examType,
      status: data.status ?? 'draft',
      updatedAtMs: data.updatedAt?.toMillis?.() ?? 0,
      submittedAtMs: data.submittedAt?.toMillis?.() ?? null,
      approvedAtMs: data.approvedAt?.toMillis?.() ?? null,
    }
  })
}

export function firebaseErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    return String((err as { code: string }).code)
  }
  return ''
}

export function parsePaperError(err: unknown): string {
  const code = firebaseErrorCode(err)
  const message = err instanceof Error ? err.message : ''
  if (code === 'permission-denied') {
    return 'You no longer have access to modify this paper.'
  }
  if (code === 'not-found') return 'Paper not found.'
  if (code === 'failed-precondition' && message.includes('index')) {
    return 'Database index is still building. Try again in a minute, or deploy Firestore indexes.'
  }
  if (message) return message
  return 'Something went wrong while saving.'
}
