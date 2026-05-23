import { classLabelFromNumber } from '@/config/curriculum'
import type { QuestionRecord } from '@/types/question'
import type { RepositoryFilters } from '@/lib/repository-workspace'
import { filterQuestionsClient } from '@/lib/repository-workspace'

export type ChapterTreeNode = {
  key: string
  chapter: string
  chapterId: string
  count: number
}

export type SubjectTreeNode = {
  key: string
  subject: string
  subjectId: string
  count: number
  chapters: ChapterTreeNode[]
}

export type ClassTreeNode = {
  key: string
  classLabel: string
  classNumber: number
  count: number
  subjects: SubjectTreeNode[]
}

export function buildCurriculumTree(questions: QuestionRecord[]): ClassTreeNode[] {
  const byClass = new Map<
    number,
    Map<string, { subjectId: string; chapters: Map<string, ChapterTreeNode> }>
  >()

  for (const q of questions) {
    const cn = q.classNumber
    if (!byClass.has(cn)) byClass.set(cn, new Map())
    const subMap = byClass.get(cn)!
    if (!subMap.has(q.subject)) {
      subMap.set(q.subject, { subjectId: q.subjectId, chapters: new Map() })
    }
    const sub = subMap.get(q.subject)!
    const chKey = q.chapter
    if (!sub.chapters.has(chKey)) {
      sub.chapters.set(chKey, {
        key: chKey,
        chapter: q.chapter,
        chapterId: q.chapterId,
        count: 0,
      })
    }
    sub.chapters.get(chKey)!.count++
  }

  const classes: ClassTreeNode[] = []

  for (const classNumber of [...byClass.keys()].sort((a, b) => a - b)) {
    const subMap = byClass.get(classNumber)!
    const classLabel = classLabelFromNumber(classNumber)
    const subjects: SubjectTreeNode[] = []
    let classCount = 0

    for (const [subject, data] of [...subMap.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    )) {
      const chapters = [...data.chapters.values()].sort((a, b) =>
        a.chapter.localeCompare(b.chapter),
      )
      const subCount = chapters.reduce((s, c) => s + c.count, 0)
      classCount += subCount
      subjects.push({
        key: `${classLabel}|${subject}`,
        subject,
        subjectId: data.subjectId,
        count: subCount,
        chapters,
      })
    }

    classes.push({
      key: classLabel,
      classLabel,
      classNumber,
      count: classCount,
      subjects,
    })
  }

  return classes
}

/** Questions matching filters except one group (for facet counts). */
export function filterExceptGroup(
  questions: QuestionRecord[],
  filters: RepositoryFilters,
  query: string,
  except: keyof RepositoryFilters,
): QuestionRecord[] {
  const relaxed = { ...filters }
  const allOn = Object.fromEntries(
    Object.keys(filters[except]).map((k) => [k, true]),
  )
  relaxed[except] = allOn as Record<string, boolean>
  return filterQuestionsClient(questions, relaxed, query)
}

export function matchesFilterSearch(text: string, search: string): boolean {
  if (!search.trim()) return true
  return text.toLowerCase().includes(search.trim().toLowerCase())
}
