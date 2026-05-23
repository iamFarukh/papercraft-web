import type { TeacherAssignment, TeacherAssignmentScope } from '@/types/teacher'
import type { QuestionRecord } from '@/types/question'
import type { PaperSetupState } from '@/lib/paper-builder'

export function normalizeTeacherEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidSchoolEmail(email: string): boolean {
  const normalized = normalizeTeacherEmail(email)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

export function emailToPendingDocId(email: string): string {
  return normalizeTeacherEmail(email).replace(/[@.]/g, (c) => (c === '@' ? '_at_' : '_'))
}

export function isFullAssignmentScope(scope: TeacherAssignmentScope | undefined): boolean {
  return scope === 'full'
}

export function teacherHasRepositoryAccess(
  scope: TeacherAssignmentScope | undefined,
  assignments: TeacherAssignment[],
): boolean {
  return isFullAssignmentScope(scope) || assignments.length > 0
}

export function questionMatchesAssignments(
  question: QuestionRecord,
  assignments: TeacherAssignment[],
  scope?: TeacherAssignmentScope,
): boolean {
  if (isFullAssignmentScope(scope)) return true
  if (assignments.length === 0) return false
  return assignments.some(
    (a) =>
      a.classNumber === question.classNumber &&
      (a.subjectId === question.subjectId || a.subjectLabel === question.subject),
  )
}

export function filterQuestionsByAssignments(
  questions: QuestionRecord[],
  assignments: TeacherAssignment[],
  scope?: TeacherAssignmentScope,
): QuestionRecord[] {
  if (isFullAssignmentScope(scope)) return questions
  if (assignments.length === 0) return []
  return questions.filter((q) => questionMatchesAssignments(q, assignments, scope))
}

export function allowedClassLabels(
  assignments: TeacherAssignment[],
  scope?: TeacherAssignmentScope,
): string[] {
  if (isFullAssignmentScope(scope)) return []
  return [...new Set(assignments.map((a) => a.classLabel))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  )
}

export function allowedSubjectsForClass(
  assignments: TeacherAssignment[],
  classLabel: string,
  scope?: TeacherAssignmentScope,
): string[] {
  if (isFullAssignmentScope(scope)) return []
  return [
    ...new Set(
      assignments
        .filter((a) => a.classLabel === classLabel)
        .map((a) => a.subjectLabel),
    ),
  ].sort()
}

export function setupMatchesAssignments(
  setup: Pick<PaperSetupState, 'classLabel' | 'subject'>,
  assignments: TeacherAssignment[],
  scope?: TeacherAssignmentScope,
): boolean {
  if (isFullAssignmentScope(scope)) return true
  if (!setup.classLabel || !setup.subject) return false
  return assignments.some(
    (a) => a.classLabel === setup.classLabel && a.subjectLabel === setup.subject,
  )
}

export function formatAssignmentSummary(
  assignments: TeacherAssignment[],
  scope?: TeacherAssignmentScope,
): string {
  if (isFullAssignmentScope(scope)) return 'Full school · all classes & subjects'
  if (assignments.length === 0) return 'No assignments'
  const classes = new Set(assignments.map((a) => a.classLabel)).size
  const subjects = new Set(assignments.map((a) => a.subjectLabel)).size
  if (assignments.length <= 3) {
    return assignments.map((a) => `${a.classLabel} · ${a.subjectLabel}`).join(' · ')
  }
  return `${classes} classes · ${subjects} subjects · ${assignments.length} pairs`
}

export function normalizeAssignmentScope(
  scope: unknown,
  assignments: TeacherAssignment[],
): TeacherAssignmentScope {
  if (scope === 'full') return 'full'
  if (scope === 'custom') return 'custom'
  return assignments.length > 0 ? 'custom' : 'custom'
}
