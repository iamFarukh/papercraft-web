import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { provisionTeacherAuthAccount } from '@/services/firebase/teacher-auth'
import {
  emailToPendingDocId,
  normalizeAssignmentScope,
  normalizeTeacherEmail,
} from '@/lib/teacher-assignments'
import type {
  TeacherAssignment,
  TeacherListItem,
  TeacherPendingDocument,
  TeacherUpsertInput,
} from '@/types/teacher'
const PENDING = 'teacher_pending'
const USERS = 'users'

function mapUserToListItem(
  id: string,
  data: Record<string, unknown>,
  stats: { papers: number; recentMs: number | null },
  pendingSignIn: boolean,
): TeacherListItem {
  const assignments = Array.isArray(data.assignments)
    ? (data.assignments as TeacherAssignment[])
    : []
  const assignmentScope = normalizeAssignmentScope(data.assignmentScope, assignments)
  return {
    id,
    email: typeof data.email === 'string' ? data.email : '',
    displayName:
      typeof data.displayName === 'string' && data.displayName.trim()
        ? data.displayName.trim()
        : typeof data.email === 'string'
          ? data.email.split('@')[0] ?? 'Teacher'
          : 'Teacher',
    active: data.active !== false,
    assignmentScope,
    assignments,
    papersCreated: stats.papers,
    recentActivityMs: stats.recentMs,
    pendingSignIn,
  }
}

function isPermissionDenied(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  return code === 'permission-denied'
}

const ADMIN_SETUP_HINT =
  'Firestore denied access. Ensure your user document has role "admin" (users/{your uid} in the Firebase console) and deploy the latest firestore.rules (firebase deploy --only firestore:rules).'

export async function listTeachers(): Promise<TeacherListItem[]> {
  let userSnap
  let pendingSnap
  try {
    ;[userSnap, pendingSnap] = await Promise.all([
      getDocs(query(collection(db, USERS), where('role', '==', 'teacher'))),
      getDocs(collection(db, PENDING)),
    ])
  } catch (err) {
    if (isPermissionDenied(err)) {
      throw new Error(ADMIN_SETUP_HINT)
    }
    throw err
  }

  const paperStats = new Map<string, { papers: number; recentMs: number | null }>()
  try {
    const papersSnap = await getDocs(
      query(collection(db, 'papers'), orderBy('updatedAt', 'desc')),
    )
    for (const d of papersSnap.docs) {
    const data = d.data()
    const uid = typeof data.createdBy === 'string' ? data.createdBy : ''
    if (!uid) continue
    const updated = data.updatedAt as { toMillis?: () => number } | undefined
    const ms = updated?.toMillis?.() ?? 0
    const prev = paperStats.get(uid) ?? { papers: 0, recentMs: null }
      paperStats.set(uid, {
        papers: prev.papers + 1,
        recentMs: prev.recentMs === null ? ms : Math.max(prev.recentMs, ms),
      })
    }
  } catch {
    /* Paper counts optional — teachers list still loads */
  }

  const items: TeacherListItem[] = userSnap.docs.map((d) => {
    const stats = paperStats.get(d.id) ?? { papers: 0, recentMs: null }
    return mapUserToListItem(d.id, d.data(), stats, false)
  })

  const linkedEmails = new Set(items.map((t) => normalizeTeacherEmail(t.email)))

  for (const d of pendingSnap.docs) {
    const data = d.data() as TeacherPendingDocument
    const email = normalizeTeacherEmail(data.email)
    if (linkedEmails.has(email)) continue
    items.push(
      mapUserToListItem(
        d.id,
        {
          email: data.email,
          displayName: data.displayName,
          active: data.active,
          assignments: data.assignments,
        },
        { papers: 0, recentMs: null },
        true,
      ),
    )
  }

  return items.sort((a, b) => a.displayName.localeCompare(b.displayName))
}

export async function getTeacherProfileEmail(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, USERS, uid))
  if (!snap.exists()) return null
  const raw = snap.data().email
  return typeof raw === 'string' && raw.trim() ? normalizeTeacherEmail(raw) : null
}

export async function getTeacherPending(
  email: string,
): Promise<TeacherPendingDocument | null> {
  const snap = await getDoc(doc(db, PENDING, emailToPendingDocId(email)))
  if (!snap.exists()) return null
  return snap.data() as TeacherPendingDocument
}

export async function upsertTeacherPending(input: TeacherUpsertInput): Promise<void> {
  const email = normalizeTeacherEmail(input.email)
  const id = emailToPendingDocId(email)
  const ref = doc(db, PENDING, id)
  const existing = await getDoc(ref)
  await setDoc(
    ref,
    {
      email,
      displayName: input.displayName.trim(),
      active: input.active,
      assignmentScope: input.assignmentScope,
      assignments: input.assignmentScope === 'full' ? [] : input.assignments,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    } satisfies TeacherPendingDocument,
    { merge: true },
  )
}

export async function updateTeacherUser(
  uid: string,
  input: TeacherUpsertInput,
): Promise<void> {
  await updateDoc(doc(db, USERS, uid), {
    email: normalizeTeacherEmail(input.email),
    displayName: input.displayName.trim(),
    active: input.active,
    assignmentScope: input.assignmentScope,
    assignments: input.assignmentScope === 'full' ? [] : input.assignments,
    role: 'teacher',
    updatedAt: serverTimestamp(),
  })
}

function teacherUserPayload(input: TeacherUpsertInput) {
  return {
    role: 'teacher' as const,
    email: normalizeTeacherEmail(input.email),
    displayName: input.displayName.trim(),
    active: input.active,
    assignmentScope: input.assignmentScope,
    assignments: input.assignmentScope === 'full' ? [] : input.assignments,
    updatedAt: serverTimestamp(),
  }
}

export async function saveTeacher(
  input: TeacherUpsertInput,
  opts: {
    uid?: string
    pendingSignIn?: boolean
    initialPassword?: string
  },
): Promise<void> {
  const email = normalizeTeacherEmail(input.email)
  const password = opts.initialPassword?.trim() ?? ''
  const isNewOrPending = !opts.uid || opts.pendingSignIn

  if (!isNewOrPending) {
    await updateTeacherUser(opts.uid!, input)
    return
  }

  if (password.length < 6) {
    throw new Error(
      'Set an initial password (at least 6 characters). Share it with the teacher so they can sign in.',
    )
  }

  let uid: string
  try {
    uid = await provisionTeacherAuthAccount(email, password)
    await setDoc(
      doc(db, USERS, uid),
      {
        ...teacherUserPayload(input),
        createdAt: serverTimestamp(),
      },
      { merge: true },
    )
    await deleteTeacherPending(email).catch(() => undefined)
  } catch (err) {
    if (isPermissionDenied(err)) {
      throw new Error(
        `${ADMIN_SETUP_HINT} After deploying rules, save the teacher again with the same initial password to link their login.`,
      )
    }
    throw err
  }
}

export async function deleteTeacherPending(email: string): Promise<void> {
  await deleteDoc(doc(db, PENDING, emailToPendingDocId(email)))
}

export async function applyPendingTeacherProfile(
  uid: string,
  email: string,
): Promise<boolean> {
  const pending = await getTeacherPending(email)
  if (!pending) return false

  await setDoc(
    doc(db, USERS, uid),
    {
      role: 'teacher',
      email: normalizeTeacherEmail(email),
      displayName: pending.displayName,
      active: pending.active,
      assignmentScope: pending.assignmentScope ?? 'custom',
      assignments: pending.assignments ?? [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
  await deleteTeacherPending(email)
  return true
}
