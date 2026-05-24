import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { blueprintDocFromSeed, DEFAULT_BLUEPRINT_SEEDS } from '@/lib/blueprint-defaults'
import { duplicateBlueprintDraft } from '@/lib/blueprint-utils'
import { db } from '@/lib/firebase'
import { getUserDisplayMap } from '@/services/firebase/users'
import type {
  BlueprintDocument,
  BlueprintDraft,
  BlueprintListItem,
  SaveBlueprintInput,
} from '@/types/blueprint'

const COLLECTION = 'blueprints'

function toListItem(
  id: string,
  data: BlueprintDocument,
  createdByLabel: string,
): BlueprintListItem {
  return {
    id,
    name: data.name,
    examType: data.examType,
    description: data.description,
    totalMarks: data.totalMarks,
    durationMinutes: data.durationMinutes,
    sectionCount: data.sections.length,
    recommendedClasses: data.recommendedClasses,
    recommendedSubjects: data.recommendedSubjects,
    isSystem: data.isSystem,
    archived: data.archived,
    createdBy: data.createdBy,
    createdByLabel,
    updatedAtMs: data.updatedAt?.toMillis?.() ?? 0,
    usagePaperCount: data.usageStats?.paperCount ?? 0,
    lastUsedAtMs: data.usageStats?.lastUsedAtMs ?? null,
  }
}

export async function getBlueprintById(id: string): Promise<(BlueprintDocument & { id: string }) | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as BlueprintDocument) }
}

export async function listBlueprints(opts?: {
  includeArchived?: boolean
}): Promise<BlueprintListItem[]> {
  const includeArchived = opts?.includeArchived ?? false
  const q = includeArchived
    ? query(collection(db, COLLECTION))
    : query(collection(db, COLLECTION), where('archived', '==', false))

  const snap = await getDocs(q)
  const rows = snap.docs.map((d) => ({
    id: d.id,
    data: d.data() as BlueprintDocument,
  }))

  const uids = rows.map((r) => r.data.createdBy)
  const labels = await getUserDisplayMap(uids)

  const items = rows.map(({ id, data }) =>
    toListItem(
      id,
      data,
      data.isSystem ? 'PaperCraft' : labels.get(data.createdBy) ?? 'Unknown',
    ),
  )

  items.sort((a, b) => {
    if (a.isSystem !== b.isSystem) return a.isSystem ? -1 : 1
    return b.updatedAtMs - a.updatedAtMs
  })

  return items
}

export async function countSystemBlueprints(): Promise<number> {
  const q = query(collection(db, COLLECTION), where('isSystem', '==', true))
  const snap = await getDocs(q)
  return snap.size
}

export async function seedDefaultBlueprints(): Promise<void> {
  const existing = await countSystemBlueprints()
  if (existing >= DEFAULT_BLUEPRINT_SEEDS.length) return

  const batch = writeBatch(db)
  for (const seed of DEFAULT_BLUEPRINT_SEEDS) {
    const ref = doc(collection(db, COLLECTION))
    batch.set(ref, {
      ...blueprintDocFromSeed(seed),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

export async function createBlueprint(
  data: SaveBlueprintInput,
  createdBy: string,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    isSystem: data.isSystem ?? false,
    archived: data.archived ?? false,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateBlueprint(
  id: string,
  data: Partial<SaveBlueprintInput>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function archiveBlueprint(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    archived: true,
    updatedAt: serverTimestamp(),
  })
}

export async function duplicateBlueprint(
  sourceId: string,
  createdBy: string,
  name?: string,
): Promise<string> {
  const source = await getBlueprintById(sourceId)
  if (!source) throw new Error('Blueprint not found.')

  const draft: BlueprintDraft = {
    name: source.name,
    examType: source.examType,
    description: source.description,
    instructions: source.instructions,
    recommendedClasses: source.recommendedClasses,
    recommendedSubjects: source.recommendedSubjects,
    durationMinutes: source.durationMinutes,
    totalMarks: source.totalMarks,
    sections: source.sections,
    difficultyDistribution: source.difficultyDistribution,
    chapterCoverage: source.chapterCoverage,
  }

  const copy = duplicateBlueprintDraft(draft, name ?? `${draft.name} (copy)`)
  return createBlueprint(copy, createdBy)
}

export function parseBlueprintError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : ''
  if (code === 'permission-denied') {
    return 'You do not have permission to modify blueprints.'
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

/** Increment usage when a paper is first saved from this blueprint. */
export async function recordBlueprintUsage(
  blueprintId: string,
  classLabel: string,
): Promise<void> {
  const ref = doc(db, COLLECTION, blueprintId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const data = snap.data() as BlueprintDocument
  const prev = data.usageStats ?? {
    paperCount: 0,
    lastUsedAtMs: null,
    popularClasses: [],
  }
  const classes = new Set(prev.popularClasses)
  if (classLabel) classes.add(classLabel)

  await updateDoc(ref, {
    usageStats: {
      paperCount: prev.paperCount + 1,
      lastUsedAtMs: Date.now(),
      popularClasses: [...classes].slice(0, 8),
    },
    updatedAt: serverTimestamp(),
  })
}
