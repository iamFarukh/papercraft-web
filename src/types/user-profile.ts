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
}
