import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  parseProfileSettings,
  parseProfileTimestamps,
} from '@/lib/profile-settings-parse'
import type { UserProfile } from '@/types/user-profile'
import { normalizeAssignmentScope } from '@/lib/teacher-assignments'
import type { TeacherAssignment } from '@/types/teacher'
import type { UserRole } from '@/services/firebase/users'

function parseProfile(uid: string, data: Record<string, unknown>): UserProfile | null {
  if (data.role !== 'admin' && data.role !== 'teacher') {
    return null
  }
  const role = data.role as UserRole
  const email = typeof data.email === 'string' ? data.email : ''
  const displayName =
    typeof data.displayName === 'string' && data.displayName.trim()
      ? data.displayName.trim()
      : email
        ? email.split('@')[0] ?? ''
        : ''
  const assignments = Array.isArray(data.assignments)
    ? (data.assignments as TeacherAssignment[])
    : []
  const assignmentScope = normalizeAssignmentScope(data.assignmentScope, assignments)

  const { joinedAtMs, lastActiveAtMs } = parseProfileTimestamps(data)
  const photoURL =
    typeof data.photoURL === 'string' && data.photoURL.trim()
      ? data.photoURL.trim()
      : null

  return {
    uid,
    email,
    displayName: displayName || (role === 'admin' ? 'Administrator' : 'Teacher'),
    role,
    active: data.active !== false,
    assignmentScope,
    assignments,
    photoURL,
    joinedAtMs,
    lastActiveAtMs,
    settings: parseProfileSettings(data),
  }
}

export function subscribeUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null)
        return
      }
      onData(parseProfile(uid, snap.data()))
    },
    (err) => onError?.(err),
  )
}
