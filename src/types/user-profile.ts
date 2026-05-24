import type { PaperMedium } from '@/lib/paper-medium'
import type { ProfileSettings } from '@/types/profile-settings'
import type { TeacherAssignment, TeacherAssignmentScope } from '@/types/teacher'
import type { UserRole } from '@/services/firebase/users'

export type UserProfile = {
  uid: string
  email: string
  displayName: string
  role: UserRole
  active: boolean
  assignmentScope: TeacherAssignmentScope
  assignments: TeacherAssignment[]
  photoURL: string | null
  joinedAtMs: number | null
  lastActiveAtMs: number | null
  settings: ProfileSettings
}
