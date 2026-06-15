import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { CURRICULUM_GROUPS } from '@/config/curriculum-catalog'
import {
  findClosestName,
  nameKey,
  slugFromName,
  validateTaxonomyName,
} from '@/lib/curriculum-normalize'
import {
  CATALOG_SYNC_VERSION,
  classLabelForNumber,
  findRbseSubjectByName,
  getRbseSubjectsForClass,
  parseStreamTags,
  RBSE_CLASS_NUMBERS,
  type RbseStreamId,
} from '@/lib/rbse-catalog'
import { subjects as RBSE_SUBJECTS } from '@/data/rbse-subjects'
import { db } from '@/lib/firebase'
import type {
  CurriculumChapterDoc,
  CurriculumClassDoc,
  CurriculumSubjectDoc,
  CurriculumTopicDoc,
  TaxonomyOption,
} from '@/types/curriculum'

const CLASSES = 'curriculum_classes'
const SUBJECTS = 'curriculum_subjects'
const CHAPTERS = 'curriculum_chapters'
const TOPICS = 'curriculum_topics'
const META = 'curriculum_meta'
const META_DOC = 'sync'

/** Old chapter seeds — same subject, different doc id; hide from picker */
export const LEGACY_SUBJECT_IDS = new Set(['mathematics', 'science', 'hindi'])

const CATALOG_TO_LEGACY: Record<string, string> = {
  sub_mathematics: 'mathematics',
  sub_science: 'science',
  sub_hindi: 'hindi',
}

const LEGACY_TO_CATALOG: Record<string, string> = {
  mathematics: 'sub_mathematics',
  science: 'sub_science',
  hindi: 'sub_hindi',
}

/** All Firestore subject ids to match for chapters / questions */
export function subjectIdsForLookup(subjectId: string): string[] {
  const legacy = CATALOG_TO_LEGACY[subjectId]
  if (legacy) return [subjectId, legacy]
  const catalog = LEGACY_TO_CATALOG[subjectId]
  if (catalog) return [catalog, subjectId]
  return [subjectId]
}

let seedPromise: Promise<void> | null = null

function isPermissionDenied(err: unknown): boolean {
  return (
    !!err &&
    typeof err === 'object' &&
    'code' in err &&
    String((err as { code: string }).code) === 'permission-denied'
  )
}

export async function ensureCurriculumSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      /**
       * Teachers have read-only access and cannot run seed writes.
       * Ignore permission failures and continue with existing taxonomy docs.
       */
      if (isPermissionDenied(err)) return
      throw err
    })
  }
  try {
    await seedPromise
  } finally {
    seedPromise = null
  }
}

async function syncRbseCatalog(batch: ReturnType<typeof writeBatch>): Promise<void> {
  for (const n of RBSE_CLASS_NUMBERS) {
    const id = String(n)
    const label = classLabelForNumber(n)
    batch.set(
      doc(db, CLASSES, id),
      {
        number: n,
        name: label,
        nameKey: nameKey(label),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  const writeSubject = (id: string, s: (typeof RBSE_SUBJECTS)[number]) => {
    batch.set(
      doc(db, SUBJECTS, id),
      {
        name: s.name,
        nameKey: nameKey(s.name),
        code: s.code,
        classNumbers: s.classes,
        streams: parseStreamTags(s.stream),
        catalogId: s.id,
        isActive: s.isActive,
        order: s.order,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  }

  for (const s of RBSE_SUBJECTS) {
    writeSubject(s.id, s)
  }

  batch.set(
    doc(db, META, META_DOC),
    {
      catalogVersion: CATALOG_SYNC_VERSION,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

async function seedLegacyChapters(batch: ReturnType<typeof writeBatch>): Promise<void> {
  const existingChapters = await getDocs(collection(db, CHAPTERS))
  if (!existingChapters.empty) return

  for (const g of CURRICULUM_GROUPS) {
    for (const ch of g.chapters) {
      batch.set(doc(db, CHAPTERS, ch.id), {
        classNumber: g.classNumber,
        subjectId: g.subjectId,
        name: ch.name,
        nameKey: nameKey(ch.name),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      } satisfies CurriculumChapterDoc)

      for (const t of ch.topics) {
        batch.set(doc(db, TOPICS, t.id), {
          classNumber: g.classNumber,
          subjectId: g.subjectId,
          chapterId: ch.id,
          name: t.name,
          nameKey: nameKey(t.name),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        } satisfies CurriculumTopicDoc)
      }
    }
  }
}

async function runSeed(): Promise<void> {
  const batch = writeBatch(db)
  syncRbseCatalog(batch)

  const existingChapters = await getDocs(collection(db, CHAPTERS))
  if (existingChapters.empty) {
    await seedLegacyChapters(batch)
  }

  await batch.commit()
}

function subjectAppliesToClass(
  data: CurriculumSubjectDoc,
  classNumber: number,
  stream: RbseStreamId | null,
): boolean {
  const classes = data.classNumbers ?? []
  if (!classes.includes(classNumber)) return false

  if (classNumber < 11) return true

  const tags = data.streams ?? []
  if (!stream) return false
  if (tags.includes('all')) return true
  if (tags.length === 0) return false
  return tags.includes(stream)
}

export async function listClasses(): Promise<TaxonomyOption[]> {
  await ensureCurriculumSeeded()
  const snap = await getDocs(collection(db, CLASSES))
  const items = snap.docs.map((d) => {
    const data = d.data() as CurriculumClassDoc
    return { id: d.id, label: data.name, number: data.number }
  })
  items.sort((a, b) => a.number - b.number)
  return items.map(({ id, label }) => ({ id, label }))
}

export async function listSubjectsForClass(
  classNumber: number,
  stream: RbseStreamId | null = null,
): Promise<TaxonomyOption[]> {
  await ensureCurriculumSeeded()
  const snap = await getDocs(collection(db, SUBJECTS))
  const seen = new Set<string>()
  const options = snap.docs
    .map((d) => {
      const data = d.data() as CurriculumSubjectDoc
      return { id: d.id, label: data.name, data }
    })
    .filter((o) => !LEGACY_SUBJECT_IDS.has(o.id))
    .filter((o) => o.data.status !== 'archived')
    .filter((o) => subjectAppliesToClass(o.data, classNumber, stream))
    .filter((o) => {
      const key = o.data.nameKey ?? nameKey(o.label)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort(
      (a, b) =>
        (a.data.order ?? 99) - (b.data.order ?? 99) ||
        a.label.localeCompare(b.label),
    )
    .map(({ id, label }) => ({ id, label }))

  if (options.length > 0) return options

  return getRbseSubjectsForClass(classNumber, stream, { activeOnly: false }).map(
    (s) => ({
      id: s.id,
      label: s.name,
    }),
  )
}

export async function listChapters(
  classNumber: number,
  subjectId: string,
): Promise<TaxonomyOption[]> {
  await ensureCurriculumSeeded()
  const subjectIds = subjectIdsForLookup(subjectId)
  const byId = new Map<string, TaxonomyOption>()

  for (const sid of subjectIds) {
    const snap = await getDocs(
      query(
        collection(db, CHAPTERS),
        where('classNumber', '==', classNumber),
        where('subjectId', '==', sid),
      ),
    )
    for (const d of snap.docs) {
      const data = d.data() as CurriculumChapterDoc
      if (data.status === 'archived') continue
      byId.set(d.id, {
        id: d.id,
        label: data.name,
      })
    }
  }

  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export async function listTopics(chapterId: string): Promise<TaxonomyOption[]> {
  await ensureCurriculumSeeded()
  const snap = await getDocs(
    query(collection(db, TOPICS), where('chapterId', '==', chapterId)),
  )
  return snap.docs
    .filter((d) => (d.data() as CurriculumTopicDoc).status !== 'archived')
    .map((d) => ({
      id: d.id,
      label: (d.data() as CurriculumTopicDoc).name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

async function findSubjectByNameKey(key: string): Promise<TaxonomyOption | null> {
  const snap = await getDocs(
    query(collection(db, SUBJECTS), where('nameKey', '==', key)),
  )
  const first = snap.docs[0]
  if (!first) return null
  return { id: first.id, label: (first.data() as CurriculumSubjectDoc).name }
}

async function findChapterByNameKey(
  classNumber: number,
  subjectId: string,
  key: string,
): Promise<TaxonomyOption | null> {
  const snap = await getDocs(
    query(
      collection(db, CHAPTERS),
      where('classNumber', '==', classNumber),
      where('subjectId', '==', subjectId),
      where('nameKey', '==', key),
    ),
  )
  const first = snap.docs[0]
  if (!first) return null
  return { id: first.id, label: (first.data() as CurriculumChapterDoc).name }
}

async function findTopicByNameKey(
  chapterId: string,
  key: string,
): Promise<TaxonomyOption | null> {
  const snap = await getDocs(
    query(
      collection(db, TOPICS),
      where('chapterId', '==', chapterId),
      where('nameKey', '==', key),
    ),
  )
  const first = snap.docs[0]
  if (!first) return null
  return { id: first.id, label: (first.data() as CurriculumTopicDoc).name }
}

export type CreateTaxonomyResult =
  | { ok: true; option: TaxonomyOption }
  | { ok: false; message: string; suggestion?: TaxonomyOption }

export async function createClass(rawName: string): Promise<CreateTaxonomyResult> {
  const validated = validateTaxonomyName(rawName)
  if (!validated.ok) return { ok: false, message: validated.message }

  const match = validated.name.match(/(\d+)/)
  const number = match ? Number(match[1]) : NaN
  if (!Number.isFinite(number) || number < 1 || number > 12) {
    return {
      ok: false,
      message: 'Include a valid class number (1–12), e.g. "Class IX" or "9".',
    }
  }

  const id = String(number)
  const existing = await getDoc(doc(db, CLASSES, id))
  if (existing.exists()) {
    const data = existing.data() as CurriculumClassDoc
    return { ok: true, option: { id, label: data.name } }
  }

  await setDoc(doc(db, CLASSES, id), {
    number,
    name: validated.name,
    nameKey: validated.nameKey,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies CurriculumClassDoc)

  return { ok: true, option: { id, label: validated.name } }
}

export async function createSubject(
  rawName: string,
  classNumber: number,
  stream: RbseStreamId | null = null,
): Promise<CreateTaxonomyResult> {
  const validated = validateTaxonomyName(rawName)
  if (!validated.ok) return { ok: false, message: validated.message }

  const catalogHit = findRbseSubjectByName(validated.name, classNumber, stream)
  if (catalogHit) {
    await setDoc(
      doc(db, SUBJECTS, catalogHit.id),
      {
        name: catalogHit.name,
        nameKey: nameKey(catalogHit.name),
        code: catalogHit.code,
        classNumbers: catalogHit.classes,
        streams: parseStreamTags(catalogHit.stream),
        catalogId: catalogHit.id,
        isActive: catalogHit.isActive,
        order: catalogHit.order,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    return { ok: true, option: { id: catalogHit.id, label: catalogHit.name } }
  }

  const dup = await findSubjectByNameKey(validated.nameKey)
  if (dup) return { ok: true, option: dup }

  const existing = await listSubjectsForClass(classNumber, stream)
  const close = findClosestName(validated.name, existing)
  if (close && nameKey(close.label) !== validated.nameKey) {
    return {
      ok: false,
      message: `"${validated.name}" looks like a typo, not a new subject.`,
      suggestion: close,
    }
  }

  const id = slugFromName(validated.name)
  const ref = doc(db, SUBJECTS, id)
  if ((await getDoc(ref)).exists()) {
    const data = (await getDoc(ref)).data() as CurriculumSubjectDoc
    if (data.nameKey === validated.nameKey) {
      return { ok: true, option: { id, label: data.name } }
    }
  }

  await setDoc(ref, {
    name: validated.name,
    nameKey: validated.nameKey,
    classNumbers: [classNumber],
    streams: stream ? [stream] : [],
    isActive: true,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies CurriculumSubjectDoc)

  return { ok: true, option: { id, label: validated.name } }
}

export async function createChapter(
  rawName: string,
  classNumber: number,
  subjectId: string,
): Promise<CreateTaxonomyResult> {
  const validated = validateTaxonomyName(rawName)
  if (!validated.ok) return { ok: false, message: validated.message }

  const dup = await findChapterByNameKey(classNumber, subjectId, validated.nameKey)
  if (dup) return { ok: true, option: dup }

  const existing = await listChapters(classNumber, subjectId)
  const close = findClosestName(validated.name, existing)
  if (close && nameKey(close.label) !== validated.nameKey) {
    return {
      ok: false,
      message: `"${validated.name}" looks like a typo, not a new chapter.`,
      suggestion: close,
    }
  }

  const id = `${slugFromName(validated.name)}-${classNumber}`
  await setDoc(doc(db, CHAPTERS, id), {
    classNumber,
    subjectId,
    name: validated.name,
    nameKey: validated.nameKey,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies CurriculumChapterDoc)

  return { ok: true, option: { id, label: validated.name } }
}

export async function createTopic(
  rawName: string,
  classNumber: number,
  subjectId: string,
  chapterId: string,
): Promise<CreateTaxonomyResult> {
  const validated = validateTaxonomyName(rawName)
  if (!validated.ok) return { ok: false, message: validated.message }

  const dup = await findTopicByNameKey(chapterId, validated.nameKey)
  if (dup) return { ok: true, option: dup }

  const existing = await listTopics(chapterId)
  const close = findClosestName(validated.name, existing)
  if (close && nameKey(close.label) !== validated.nameKey) {
    return {
      ok: false,
      message: `"${validated.name}" looks like a typo, not a new topic.`,
      suggestion: close,
    }
  }

  const id = `${slugFromName(validated.name)}-${chapterId.slice(0, 12)}`
  await setDoc(doc(db, TOPICS, id), {
    classNumber,
    subjectId,
    chapterId,
    name: validated.name,
    nameKey: validated.nameKey,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  } satisfies CurriculumTopicDoc)

  return { ok: true, option: { id, label: validated.name } }
}

export async function resolveTaxonomyLabels(
  classNumber: number,
  subjectId: string,
  chapterId: string,
  topicId: string,
): Promise<{
  subjectName: string
  chapterName: string
  topicName: string
}> {
  const [sub, ch, top] = await Promise.all([
    subjectId ? getDoc(doc(db, SUBJECTS, subjectId)) : null,
    chapterId ? getDoc(doc(db, CHAPTERS, chapterId)) : null,
    topicId ? getDoc(doc(db, TOPICS, topicId)) : null,
  ])

  return {
    subjectName: sub?.exists() ? (sub.data() as CurriculumSubjectDoc).name : '',
    chapterName: ch?.exists() ? (ch.data() as CurriculumChapterDoc).name : '',
    topicName: top?.exists() ? (top.data() as CurriculumTopicDoc).name : '',
  }
}
