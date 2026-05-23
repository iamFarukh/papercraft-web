import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type UserRole = 'admin' | 'teacher'

const ROLE_LOOKUP_MS = 5_000

export async function getUserRole(uid: string): Promise<UserRole> {
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

  const devRole = import.meta.env.VITE_DEV_ROLE
  if (devRole === 'admin' || devRole === 'teacher') return devRole

  return 'admin'
}

/** Create users/{uid} on first login so Firestore rules can resolve isAdmin(). */
export async function ensureUserProfile(
  uid: string,
  email?: string | null,
): Promise<UserRole> {
  const ref = doc(db, 'users', uid)
  try {
    const snap = await getDoc(ref)
    if (snap.exists()) {
      const role = snap.data().role
      if (role === 'admin' || role === 'teacher') return role
    }

    const role: UserRole =
      import.meta.env.VITE_DEV_ROLE === 'teacher' ? 'teacher' : 'admin'

    await setDoc(
      ref,
      {
        role,
        email: email ?? '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    return role
  } catch {
    return getUserRole(uid)
  }
}
