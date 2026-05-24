import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { mapQuestionDoc } from '@/lib/question-mapper'
import type {
  CurriculumInsights,
  CurriculumTreeNode,
} from '@/lib/curriculum-workspace'
import {
  nameKey,
  validateTaxonomyName,
} from '@/lib/curriculum-normalize'
import { db } from '@/lib/firebase'
import { listRecentPapers } from '@/services/firebase/papers'
import type { CurriculumNodeType } from '@/lib/curriculum-workspace'
import type {
  CurriculumChapterDoc,
  CurriculumClassDoc,
  CurriculumLifecycleStatus,
  CurriculumSubjectDoc,
  CurriculumTopicDoc,
} from '@/types/curriculum'
import type { QuestionDocument } from '@/types/question'
import {
  ensureCurriculumSeeded,
  LEGACY_SUBJECT_IDS,
  subjectIdsForLookup,
} from '@/services/firebase/curriculum'

const CLASSES = 'curriculum_classes'
const SUBJECTS = 'curriculum_subjects'
const CHAPTERS = 'curriculum_chapters'
const TOPICS = 'curriculum_topics'

function isActive(doc: { status?: CurriculumLifecycleStatus }): boolean {
  return doc.status !== 'archived'
}

function docStatus(doc: { status?: CurriculumLifecycleStatus }): CurriculumLifecycleStatus {
  return doc.status === 'archived' ? 'archived' : 'active'
}

function questionsReadableQuery(isAdmin: boolean) {
  const base = collection(db, 'questions')
  return isAdmin
    ? query(base)
    : query(
        base,
        where('status', '==', 'published'),
        where('deletedAt', '==', null),
      )
}

export async function loadCurriculumTree(options?: {
  includeArchived?: boolean
}): Promise<CurriculumTreeNode[]> {
  await ensureCurriculumSeeded()
  const includeArchived = options?.includeArchived ?? true

  const [classSnap, subjectSnap, chapterSnap, topicSnap] = await Promise.all([
    getDocs(collection(db, CLASSES)),
    getDocs(collection(db, SUBJECTS)),
    getDocs(collection(db, CHAPTERS)),
    getDocs(collection(db, TOPICS)),
  ])

  const subjects = subjectSnap.docs
    .map((d) => ({ id: d.id, data: d.data() as CurriculumSubjectDoc }))
    .filter((s) => !LEGACY_SUBJECT_IDS.has(s.id))
    .filter((s) => includeArchived || isActive(s.data))

  const chapters = chapterSnap.docs
    .map((d) => ({ id: d.id, data: d.data() as CurriculumChapterDoc }))
    .filter((c) => includeArchived || isActive(c.data))

  const topics = topicSnap.docs
    .map((d) => ({ id: d.id, data: d.data() as CurriculumTopicDoc }))
    .filter((t) => includeArchived || isActive(t.data))

  const topicsByChapter = new Map<string, typeof topics>()
  for (const t of topics) {
    const list = topicsByChapter.get(t.data.chapterId) ?? []
    list.push(t)
    topicsByChapter.set(t.data.chapterId, list)
  }

  const chaptersBySubjectClass = new Map<string, typeof chapters>()
  for (const c of chapters) {
    const key = `${c.data.classNumber}|${c.data.subjectId}`
    const list = chaptersBySubjectClass.get(key) ?? []
    list.push(c)
    chaptersBySubjectClass.set(key, list)
  }

  const subjectsByClass = new Map<number, typeof subjects>()
  for (const s of subjects) {
    for (const cn of s.data.classNumbers ?? []) {
      const list = subjectsByClass.get(cn) ?? []
      if (!list.some((x) => x.data.nameKey === s.data.nameKey)) {
        list.push(s)
      }
      subjectsByClass.set(cn, list)
    }
  }

  const tree: CurriculumTreeNode[] = classSnap.docs
    .map((d) => {
      const data = d.data() as CurriculumClassDoc
      const classNumber = data.number
      const classSubjects = (subjectsByClass.get(classNumber) ?? []).sort((a, b) =>
        a.data.name.localeCompare(b.data.name),
      )

      const subjectNodes: CurriculumTreeNode[] = classSubjects.map((s) => {
        const subjectIds = subjectIdsForLookup(s.id)
        const chapterList = subjectIds.flatMap((sid) => {
          const key = `${classNumber}|${sid}`
          return chaptersBySubjectClass.get(key) ?? []
        })
        const uniqueChapters = new Map<string, (typeof chapterList)[0]>()
        for (const ch of chapterList) {
          if (!uniqueChapters.has(ch.id)) uniqueChapters.set(ch.id, ch)
        }

        const chapterNodes: CurriculumTreeNode[] = [...uniqueChapters.values()]
          .sort((a, b) => a.data.name.localeCompare(b.data.name))
          .map((ch) => {
            const topicList = (topicsByChapter.get(ch.id) ?? []).sort((a, b) =>
              a.data.name.localeCompare(b.data.name),
            )
            return {
              id: ch.id,
              type: 'chapter' as const,
              label: ch.data.name,
              status: docStatus(ch.data),
              classNumber,
              subjectId: s.id,
              chapterId: ch.id,
              children: topicList.map((t) => ({
                id: t.id,
                type: 'topic' as const,
                label: t.data.name,
                status: docStatus(t.data),
                classNumber,
                subjectId: s.id,
                chapterId: ch.id,
                children: [],
              })),
            }
          })

        return {
          id: s.id,
          type: 'subject' as const,
          label: s.data.name,
          status: docStatus(s.data),
          classNumber,
          subjectId: s.id,
          children: chapterNodes,
        }
      })

      return {
        id: d.id,
        type: 'class' as const,
        label: data.name,
        status: 'active' as const,
        classNumber,
        children: subjectNodes,
      }
    })
    .sort((a, b) => a.classNumber - b.classNumber)

  return tree
}

export type RenameTaxonomyResult =
  | { ok: true }
  | { ok: false; message: string }

export async function renameTaxonomyNode(
  type: CurriculumNodeType,
  id: string,
  rawName: string,
  context?: { classNumber?: number; subjectId?: string; chapterId?: string },
): Promise<RenameTaxonomyResult> {
  const validated = validateTaxonomyName(rawName)
  if (!validated.ok) return { ok: false, message: validated.message }

  if (type === 'class') {
    await updateDoc(doc(db, CLASSES, id), {
      name: validated.name,
      nameKey: validated.nameKey,
      updatedAt: serverTimestamp(),
    })
    return { ok: true }
  }

  if (type === 'subject') {
    await updateDoc(doc(db, SUBJECTS, id), {
      name: validated.name,
      nameKey: validated.nameKey,
      updatedAt: serverTimestamp(),
    })
    return { ok: true }
  }

  if (type === 'chapter' && context?.classNumber && context?.subjectId) {
    const dup = await getDocs(
      query(
        collection(db, CHAPTERS),
        where('classNumber', '==', context.classNumber),
        where('subjectId', '==', context.subjectId),
        where('nameKey', '==', validated.nameKey),
      ),
    )
    const other = dup.docs.find((d) => d.id !== id)
    if (other) {
      return {
        ok: false,
        message: 'A chapter with this name already exists for this subject.',
      }
    }
    await updateDoc(doc(db, CHAPTERS, id), {
      name: validated.name,
      nameKey: validated.nameKey,
      updatedAt: serverTimestamp(),
    })
    return { ok: true }
  }

  if (type === 'topic' && context?.chapterId) {
    const dup = await getDocs(
      query(
        collection(db, TOPICS),
        where('chapterId', '==', context.chapterId),
        where('nameKey', '==', validated.nameKey),
      ),
    )
    const other = dup.docs.find((d) => d.id !== id)
    if (other) {
      return {
        ok: false,
        message: 'A topic with this name already exists for this chapter.',
      }
    }
    await updateDoc(doc(db, TOPICS, id), {
      name: validated.name,
      nameKey: validated.nameKey,
      updatedAt: serverTimestamp(),
    })
    return { ok: true }
  }

  return { ok: false, message: 'Could not rename this entry.' }
}

export async function setTaxonomyLifecycle(
  type: CurriculumNodeType,
  id: string,
  status: CurriculumLifecycleStatus,
): Promise<void> {
  if (type === 'class') return

  const col =
    type === 'subject'
      ? SUBJECTS
      : type === 'chapter'
        ? CHAPTERS
        : TOPICS

  await updateDoc(doc(db, col, id), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function computeCurriculumInsights(
  tree: CurriculumTreeNode[],
  selection: {
    type: CurriculumNodeType
    id: string
    classNumber: number
    subjectId?: string
    chapterId?: string
  } | null,
  userId: string,
  isAdmin: boolean,
): Promise<CurriculumInsights> {
  const qSnap = await getDocs(questionsReadableQuery(isAdmin))
  const questions = qSnap.docs
    .map((d) => mapQuestionDoc(d.id, d.data() as QuestionDocument))
    .filter((q) => !q.isInTrash)

  let archivedChapters = 0
  let archivedTopics = 0
  let activeChapters = 0
  let totalChapters = 0
  let totalTopics = 0
  const subjectIdsWithQ = new Set<string>()

  function walk(nodes: CurriculumTreeNode[]) {
    for (const n of nodes) {
      if (n.type === 'chapter') {
        totalChapters++
        if (n.status === 'archived') archivedChapters++
        else activeChapters++
      }
      if (n.type === 'topic') {
        totalTopics++
        if (n.status === 'archived') archivedTopics++
      }
      walk(n.children)
    }
  }
  walk(tree)

  for (const q of questions) {
    if (q.subjectId) subjectIdsWithQ.add(q.subjectId)
  }

  const papers = await listRecentPapers({ userId, isAdmin, max: 200 })

  function matchesQuestion(q: (typeof questions)[0]): boolean {
    if (!selection) return true
    if (selection.type === 'class') {
      return q.classNumber === selection.classNumber
    }
    if (selection.type === 'subject') {
      return (
        q.classNumber === selection.classNumber &&
        subjectIdsForLookup(selection.id).includes(q.subjectId)
      )
    }
    if (selection.type === 'chapter') {
      return q.chapterId === selection.id
    }
    if (selection.type === 'topic') {
      return q.topicId === selection.id
    }
    return false
  }

  function matchesPaper(p: (typeof papers)[0]): boolean {
    if (!selection) return true
    const cls = tree.find((c) => c.classNumber === selection.classNumber)
    const classLabel = cls?.label ?? ''
    if (selection.type === 'class') {
      return p.classLabel === classLabel
    }
    const sub =
      selection.type === 'subject'
        ? cls?.children.find((s) => s.id === selection.id)
        : selection.subjectId
          ? cls?.children.find((s) => s.id === selection.subjectId)
          : undefined
    if (!sub) return p.classLabel === classLabel
    return p.classLabel === classLabel && p.subject === sub.label
  }

  const questionsInSelection = questions.filter(matchesQuestion).length
  const papersInSelection = papers.filter(matchesPaper).length

  return {
    questionCount: questions.length,
    questionsInSelection,
    paperCount: papers.length,
    papersInSelection,
    activeChapters,
    archivedChapters,
    archivedTopics,
    subjectsWithQuestions: subjectIdsWithQ.size,
    totalChapters,
    totalTopics,
  }
}

export async function countLinkedQuestions(
  type: CurriculumNodeType,
  id: string,
  classNumber: number,
  subjectId?: string,
  chapterId?: string,
  isAdmin = false,
): Promise<number> {
  const qSnap = await getDocs(questionsReadableQuery(isAdmin))
  let count = 0
  for (const d of qSnap.docs) {
    const data = d.data()
    if (data.deletedAt) continue
    if (type === 'class' && data.classNumber === classNumber) count++
    else if (type === 'subject' && subjectIdsForLookup(id).includes(data.subjectId)) count++
    else if (type === 'chapter' && data.chapterId === id) count++
    else if (type === 'topic' && data.topicId === id) count++
  }
  return count
}
