import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { applyPendingTeacherProfile } from '@/services/firebase/teachers'

export type UserRole = 'admin' | 'teacher'

const ROLE_LOOKUP_MS = 5_000

/**
 * Dev-only role escape hatch. Returns the configured VITE_DEV_ROLE ONLY in a
 * development build (`import.meta.env.DEV`). In any production build this always
 * returns null, so a leaked/misconfigured VITE_DEV_ROLE can never elevate a
 * real user — guarding against the client-side admin-escalation path.
 */
function devRoleOverride(): UserRole | null {
  if (!import.meta.env.DEV) return null
  const devRole = import.meta.env.VITE_DEV_ROLE
  return devRole === 'admin' || devRole === 'teacher' ? devRole : null
}

function isPermissionDenied(err: unknown): boolean {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  return code === 'permission-denied'
}

/** Read role from Firestore only — never guess admin when the doc is missing. */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    const snap = await Promise.race([
      getDoc(doc(db, 'users', uid)),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('role lookup timeout')), ROLE_LOOKUP_MS),
      ),
    ])
    if (snap.exists()) {
      const role = snap.data().role
      if (role === 'admin' || role === 'teacher') return role
    }
  } catch {
    // fall through
  }

  return devRoleOverride()
}

/**
 * Ensures users/{uid} exists with the correct role.
 * Never auto-promotes unknown accounts to admin (that caused teacher permission bugs).
 */
export async function ensureUserProfile(
  uid: string,
  email?: string | null,
): Promise<UserRole | null> {
  const ref = doc(db, 'users', uid)
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const role = snap.data().role
      if (role === 'admin' || role === 'teacher') return role
    }

    if (email) {
      try {
        const applied = await applyPendingTeacherProfile(uid, email)
        if (applied) return 'teacher'
      } catch (err) {
        if (!isPermissionDenied(err)) throw err
      }
    }

    const devRole = devRoleOverride()
    if (devRole) {
      await setDoc(
        ref,
        {
          role: devRole,
          email: email ?? '',
          active: true,
          assignments: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return devRole
    }

    return null
  } catch {
    return getUserRole(uid)
  }
}

/** Resolve display labels for teacher UIDs (email local-part or short id). */
export async function getUserDisplayMap(uids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(uids.filter(Boolean))]
  const map = new Map<string, string>()
  await Promise.all(
    unique.map(async (uid) => {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (snap.exists()) {
          const data = snap.data()
          const email = typeof data.email === 'string' ? data.email : ''
          const name =
            typeof data.displayName === 'string' && data.displayName.trim()
              ? data.displayName.trim()
              : email
                ? email.split('@')[0]
                : ''
          map.set(uid, name || 'Teacher')
        } else {
          map.set(uid, 'Teacher')
        }
      } catch {
        map.set(uid, 'Teacher')
      }
    }),
  )
  return map
}
