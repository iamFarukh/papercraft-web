import { FirebaseError, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth'
import { firebaseConfig } from '@/lib/firebase'

const PROVISIONER_APP_NAME = 'PaperCraftTeacherProvisioner'

let provisionerApp: FirebaseApp | undefined

function getProvisionerAuth(): Auth {
  if (!provisionerApp) {
    provisionerApp = initializeApp(firebaseConfig, PROVISIONER_APP_NAME)
  }
  return getAuth(provisionerApp)
}

export function parseProvisionAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'This login ID is already registered. Use the same initial password to link the profile, or reset the account in Firebase Authentication.'
      case 'auth/invalid-email':
        return 'Login ID must look like an email (e.g. name@school.edu).'
      case 'auth/weak-password':
        return 'Password is too weak — use at least 6 characters.'
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is disabled in Firebase. Enable it in Authentication → Sign-in method.'
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'This login ID already exists with a different password. Set the matching password or reset it in Firebase Authentication.'
      default:
        return err.message || 'Could not create login account.'
    }
  }
  if (err instanceof Error) return err.message
  return 'Could not create login account.'
}

/**
 * Creates or links a Firebase Auth user without signing out the current admin session.
 * If the email already exists, signs in with the provided password to obtain the UID.
 */
export async function provisionTeacherAuthAccount(
  loginId: string,
  password: string,
): Promise<string> {
  const auth = getProvisionerAuth()
  const email = loginId.trim()

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const uid = cred.user.uid
    await signOut(auth)
    return uid
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        const uid = cred.user.uid
        await signOut(auth)
        return uid
      } catch (linkErr) {
        throw new Error(parseProvisionAuthError(linkErr), { cause: linkErr })
      }
    }
    throw new Error(parseProvisionAuthError(err), { cause: err })
  }
}
