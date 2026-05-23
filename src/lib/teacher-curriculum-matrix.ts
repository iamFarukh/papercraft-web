import { listClasses, listSubjectsForClass } from '@/services/firebase/curriculum'
import type { TaxonomyOption } from '@/types/curriculum'
import type { TeacherAssignment } from '@/types/teacher'

export type ClassSubjectMatrix = {
  classOption: TaxonomyOption
  classNumber: number
  subjects: TaxonomyOption[]
}

export function subjectLabelKey(label: string): string {
  return label.trim().toLowerCase()
}

export async function loadClassSubjectMatrix(): Promise<ClassSubjectMatrix[]> {
  const classes = await listClasses()
  const rows = await Promise.all(
    classes.map(async (classOption) => {
      const classNumber = Number(classOption.id)
      if (!Number.isFinite(classNumber)) {
        return { classOption, classNumber: 0, subjects: [] }
      }
      const subjects = await listSubjectsForClass(classNumber)
      return { classOption, classNumber, subjects }
    }),
  )
  return rows.filter((r) => r.classNumber > 0)
}

/**
 * Builds class→subject pairs for every selected class where that class offers
 * a subject whose label matches one of the selected subject names.
 * (Subject IDs differ per class in Firestore; matching is by label.)
 */
export function buildAssignmentsFromMatrix(
  matrix: ClassSubjectMatrix[],
  selectedClassNumbers: Set<number>,
  selectedSubjectLabelKeys: Set<string>,
): TeacherAssignment[] {
  const out: TeacherAssignment[] = []
  const seen = new Set<string>()

  for (const row of matrix) {
    if (!selectedClassNumbers.has(row.classNumber)) continue
    for (const subject of row.subjects) {
      const labelKey = subjectLabelKey(subject.label)
      if (!labelKey || !selectedSubjectLabelKeys.has(labelKey)) continue
      const pairKey = `${row.classNumber}:${labelKey}`
      if (seen.has(pairKey)) continue
      seen.add(pairKey)
      out.push({
        classNumber: row.classNumber,
        classLabel: row.classOption.label,
        subjectId: subject.id,
        subjectLabel: subject.label,
      })
    }
  }

  return out.sort((a, b) => {
    const c = a.classLabel.localeCompare(b.classLabel, undefined, { numeric: true })
    if (c !== 0) return c
    return a.subjectLabel.localeCompare(b.subjectLabel)
  })
}

export function buildAllAssignmentsFromMatrix(
  matrix: ClassSubjectMatrix[],
): TeacherAssignment[] {
  const allLabels = new Set<string>()
  for (const row of matrix) {
    for (const s of row.subjects) {
      const key = subjectLabelKey(s.label)
      if (key) allLabels.add(key)
    }
  }
  return buildAssignmentsFromMatrix(
    matrix,
    new Set(matrix.map((r) => r.classNumber)),
    allLabels,
  )
}

export function uniqueSubjectsInMatrix(matrix: ClassSubjectMatrix[]): TaxonomyOption[] {
  const byLabel = new Map<string, TaxonomyOption>()
  for (const row of matrix) {
    for (const s of row.subjects) {
      const key = subjectLabelKey(s.label)
      if (!key || byLabel.has(key)) continue
      byLabel.set(key, s)
    }
  }
  return [...byLabel.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export function allSubjectLabelKeys(matrix: ClassSubjectMatrix[]): Set<string> {
  const keys = new Set<string>()
  for (const row of matrix) {
    for (const s of row.subjects) {
      const key = subjectLabelKey(s.label)
      if (key) keys.add(key)
    }
  }
  return keys
}
