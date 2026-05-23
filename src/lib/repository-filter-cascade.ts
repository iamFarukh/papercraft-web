import type {
  ClassTreeNode,
  SubjectTreeNode,
} from '@/lib/repository-filter-tree'
import type { RepositoryFilters } from '@/lib/repository-workspace'

export type TriState = 'on' | 'off' | 'mixed'

export type SyllabusToggleTarget =
  | { level: 'class'; classLabel: string }
  | { level: 'subject'; classLabel: string; subject: string }
  | { level: 'chapter'; classLabel: string; subject: string; chapter: string }

export function isFilterOn(
  group: Record<string, boolean>,
  key: string,
): boolean {
  return group[key] !== false
}

function setOn(
  group: Record<string, boolean>,
  key: string,
  on: boolean,
): Record<string, boolean> {
  return { ...group, [key]: on }
}

function findClass(
  tree: ClassTreeNode[],
  classLabel: string,
): ClassTreeNode | undefined {
  return tree.find((c) => c.classLabel === classLabel)
}

function findSubject(
  cls: ClassTreeNode,
  subject: string,
): SubjectTreeNode | undefined {
  return cls.subjects.find((s) => s.subject === subject)
}

function subjectNodeHasChapterOn(
  filters: RepositoryFilters,
  sub: SubjectTreeNode,
): boolean {
  return sub.chapters.some((ch) => isFilterOn(filters.chapters, ch.chapter))
}

function classNodeHasContentOn(
  filters: RepositoryFilters,
  cls: ClassTreeNode,
): boolean {
  for (const sub of cls.subjects) {
    if (subjectNodeHasChapterOn(filters, sub)) return true
    if (isFilterOn(filters.subjects, sub.subject) && sub.chapters.length === 0) {
      return true
    }
  }
  return false
}

export function subjectTriState(
  sub: SubjectTreeNode,
  filters: RepositoryFilters,
): TriState {
  if (sub.chapters.length === 0) {
    return isFilterOn(filters.subjects, sub.subject) ? 'on' : 'off'
  }

  let on = 0
  for (const ch of sub.chapters) {
    if (isFilterOn(filters.chapters, ch.chapter)) on++
  }
  if (on === 0) return 'off'
  if (on === sub.chapters.length) return 'on'
  return 'mixed'
}

export function classTriState(
  cls: ClassTreeNode,
  filters: RepositoryFilters,
): TriState {
  if (cls.subjects.length === 0) {
    return isFilterOn(filters.classes, cls.classLabel) ? 'on' : 'off'
  }

  let allOn = true
  let allOff = true

  for (const sub of cls.subjects) {
    const st = subjectTriState(sub, filters)
    if (st !== 'on') allOn = false
    if (st !== 'off') allOff = false
  }

  if (allOn) return 'on'
  if (allOff) return 'off'
  return 'mixed'
}

export function cascadeSyllabusToggle(
  filters: RepositoryFilters,
  tree: ClassTreeNode[],
  target: SyllabusToggleTarget,
): RepositoryFilters {
  const cls = findClass(tree, target.classLabel)
  if (!cls) return filters

  let next: RepositoryFilters = {
    ...filters,
    classes: { ...filters.classes },
    subjects: { ...filters.subjects },
    chapters: { ...filters.chapters },
  }

  if (target.level === 'class') {
    const turnOn = classTriState(cls, filters) !== 'on'
    next.classes = setOn(next.classes, cls.classLabel, turnOn)
    for (const sub of cls.subjects) {
      next.subjects = setOn(next.subjects, sub.subject, turnOn)
      for (const ch of sub.chapters) {
        next.chapters = setOn(next.chapters, ch.chapter, turnOn)
      }
    }
    return next
  }

  if (target.level === 'subject') {
    const sub = findSubject(cls, target.subject)
    if (!sub) return filters

    const turnOn = subjectTriState(sub, filters) !== 'on'
    next.subjects = setOn(next.subjects, sub.subject, turnOn)
    for (const ch of sub.chapters) {
      next.chapters = setOn(next.chapters, ch.chapter, turnOn)
    }
    if (turnOn) {
      next.classes = setOn(next.classes, cls.classLabel, true)
    } else if (!classNodeHasContentOn(next, cls)) {
      next.classes = setOn(next.classes, cls.classLabel, false)
    }
    return next
  }

  const sub = findSubject(cls, target.subject)
  if (!sub) return filters

  const turnOn = !isFilterOn(filters.chapters, target.chapter)
  next.chapters = setOn(next.chapters, target.chapter, turnOn)

  if (turnOn) {
    next.subjects = setOn(next.subjects, sub.subject, true)
    next.classes = setOn(next.classes, cls.classLabel, true)
    return next
  }

  if (!subjectNodeHasChapterOn(next, sub)) {
    next.subjects = setOn(next.subjects, sub.subject, false)
  }
  if (!classNodeHasContentOn(next, cls)) {
    next.classes = setOn(next.classes, cls.classLabel, false)
  }

  return next
}
