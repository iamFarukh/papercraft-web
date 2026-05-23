/** `full` = entire published repository; `custom` = explicit class–subject pairs. */
export type TeacherAssignmentScope = 'full' | 'custom'

/** Class → subject assignment for a teacher. */
export type TeacherAssignment = {
  classNumber: number
  classLabel: string
  subjectId: string
  subjectLabel: string
}

export type TeacherDocument = {
  email: string
  displayName: string
  role: 'teacher'
  active: boolean
  assignmentScope?: TeacherAssignmentScope
  assignments: TeacherAssignment[]
  createdAt?: unknown
  updatedAt?: unknown
}

export type TeacherPendingDocument = {
  email: string
  displayName: string
  active: boolean
  assignmentScope?: TeacherAssignmentScope
  assignments: TeacherAssignment[]
  createdAt?: unknown
  updatedAt?: unknown
}

export type TeacherListItem = {
  id: string
  email: string
  displayName: string
  active: boolean
  assignmentScope: TeacherAssignmentScope
  assignments: TeacherAssignment[]
  papersCreated: number
  recentActivityMs: number | null
  pendingSignIn: boolean
}

export type TeacherUpsertInput = {
  email: string
  displayName: string
  active: boolean
  assignmentScope: TeacherAssignmentScope
  assignments: TeacherAssignment[]
}
