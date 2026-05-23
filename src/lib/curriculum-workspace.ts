import type { CurriculumLifecycleStatus } from '@/types/curriculum'

export type CurriculumNodeType = 'class' | 'subject' | 'chapter' | 'topic'

export type CurriculumTreeNode = {
  id: string
  type: CurriculumNodeType
  label: string
  status: CurriculumLifecycleStatus
  classNumber: number
  subjectId?: string
  chapterId?: string
  children: CurriculumTreeNode[]
}

export type CurriculumSelection = {
  type: CurriculumNodeType
  id: string
  classNumber: number
  subjectId?: string
  chapterId?: string
  label: string
  status: CurriculumLifecycleStatus
}

export type CurriculumInsights = {
  questionCount: number
  questionsInSelection: number
  paperCount: number
  papersInSelection: number
  activeChapters: number
  archivedChapters: number
  archivedTopics: number
  subjectsWithQuestions: number
  totalChapters: number
  totalTopics: number
}

export function findTreeNode(
  nodes: CurriculumTreeNode[],
  type: CurriculumNodeType,
  id: string,
): CurriculumTreeNode | null {
  for (const node of nodes) {
    if (node.type === type && node.id === id) return node
    const child = findTreeNode(node.children, type, id)
    if (child) return child
  }
  return null
}

export function selectionBreadcrumb(
  tree: CurriculumTreeNode[],
  selection: CurriculumSelection | null,
): string[] {
  if (!selection) return []
  const parts: string[] = []
  const cls = findTreeNode(tree, 'class', String(selection.classNumber))
  if (cls) parts.push(cls.label)

  if (selection.type === 'class') return parts

  const subId = selection.subjectId
  if (subId && cls) {
    const sub = findTreeNode(cls.children, 'subject', subId)
    if (sub) parts.push(sub.label)
  }
  if (selection.type === 'subject') return parts

  const chId = selection.chapterId
  if (chId && subId && cls) {
    const sub = findTreeNode(cls.children, 'subject', subId)
    const ch = sub ? findTreeNode(sub.children, 'chapter', chId) : null
    if (ch) parts.push(ch.label)
  }
  if (selection.type === 'chapter') return parts

  if (selection.type === 'topic' && chId && subId && cls) {
    const sub = findTreeNode(cls.children, 'subject', subId)
    const ch = sub ? findTreeNode(sub.children, 'chapter', chId) : null
    const top = ch ? findTreeNode(ch.children, 'topic', selection.id) : null
    if (top) parts.push(top.label)
  }
  return parts
}

export function childTypeFor(parent: CurriculumNodeType): CurriculumNodeType | null {
  switch (parent) {
    case 'class':
      return 'subject'
    case 'subject':
      return 'chapter'
    case 'chapter':
      return 'topic'
    default:
      return null
  }
}

export function childLabelFor(type: CurriculumNodeType): string {
  switch (type) {
    case 'subject':
      return 'Subject'
    case 'chapter':
      return 'Chapter'
    case 'topic':
      return 'Topic'
    default:
      return 'Entry'
  }
}
