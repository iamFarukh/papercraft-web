import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  allowedClassLabels,
  allowedSubjectsForClass,
  filterQuestionsByAssignments,
  isFullAssignmentScope,
  teacherHasRepositoryAccess,
} from '@/lib/teacher-assignments'
import type { QuestionRecord } from '@/types/question'

export function useTeacherScope() {
  const { isAdmin, profile, assignments } = useAuth()
  const assignmentScope = profile?.assignmentScope ?? 'custom'
  const hasFullAccess = isFullAssignmentScope(assignmentScope)

  const isScoped = !isAdmin && profile?.role === 'teacher'
  const isActive = profile?.active !== false
  const hasAssignments = teacherHasRepositoryAccess(assignmentScope, assignments)

  const classLabels = useMemo(
    () => (isScoped && !hasFullAccess ? allowedClassLabels(assignments, assignmentScope) : []),
    [isScoped, hasFullAccess, assignments, assignmentScope],
  )

  const filterQuestions = useMemo(
    () => (questions: QuestionRecord[]) => {
      if (!isScoped) return questions
      if (!hasAssignments) return []
      return filterQuestionsByAssignments(questions, assignments, assignmentScope)
    },
    [isScoped, hasAssignments, assignments, assignmentScope],
  )

  const subjectsForClass = useMemo(
    () => (classLabel: string) =>
      isScoped && !hasFullAccess
        ? allowedSubjectsForClass(assignments, classLabel, assignmentScope)
        : [],
    [isScoped, hasFullAccess, assignments, assignmentScope],
  )

  return {
    isScoped,
    isActive,
    hasFullAccess,
    hasAssignments,
    assignments,
    assignmentScope,
    classLabels,
    subjectsForClass,
    filterQuestions,
  }
}
