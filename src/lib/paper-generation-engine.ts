import type { BlueprintDifficultyMix, BlueprintQuestionType } from '@/types/blueprint'
import type { PaperBlueprintSnapshot, PaperBlueprintSectionSnapshot } from '@/types/paper'
import type { PaperComposition, PaperSectionDef, PaperSectionId } from '@/lib/paper-builder'
import type { PaperMedium } from '@/lib/paper-medium'
import { questionMatchesPaperMedium } from '@/lib/paper-medium'
import type { QuestionRecord } from '@/types/question'
import type { QuestionType } from '@/types/question'

export type GenerationScope =
  | 'full_syllabus'
  | 'selected_chapters'
  | 'selected_topics'
  | 'recent_units'
  | 'weak_chapters'
  | 'custom'

export type GenerationPreset =
  | 'balanced'
  | 'easy_focused'
  | 'board_level'
  | 'practice'
  | 'revision'
  | 'quick_test'

export type GenerationConfig = {
  scope: GenerationScope
  selectedChapters: string[]
  selectedTopics: string[]
  preset: GenerationPreset
  targetSectionId?: PaperSectionId
}

export type GeneratedSlot = {
  question: QuestionRecord | null
  fitnessScore: number
  reasons: string[]
  unfilled?: boolean
}

export type SectionGenerationResult = {
  sectionId: PaperSectionId
  sectionTitle: string
  plannedCount: number
  generatedCount: number
  slots: GeneratedSlot[]
  warnings: string[]
}

export type PaperGenerationResult = {
  sections: SectionGenerationResult[]
  warnings: string[]
  presetLabel: string
  difficultySummary: string
  totalGenerated: number
  totalPlanned: number
  scopeSummary: string
}

export type ScoredQuestion = {
  question: QuestionRecord
  fitnessScore: number
  reasons: string[]
}

export type AvailabilitySummary = {
  total: number
  byChapter: Record<string, number>
  byTopic: Record<string, number>
}

export const GENERATION_PRESET_META: Record<
  GenerationPreset,
  { label: string; hint: string }
> = {
  balanced: {
    label: 'Balanced',
    hint: 'Follows blueprint difficulty mix with even chapter spread.',
  },
  easy_focused: {
    label: 'Easy-focused',
    hint: 'Emphasises easy and medium questions for lighter assessments.',
  },
  board_level: {
    label: 'Board-level',
    hint: 'Strict blueprint alignment with medium–hard emphasis.',
  },
  practice: {
    label: 'Practice',
    hint: 'Broader mark tolerance; prioritises syllabus coverage.',
  },
  revision: {
    label: 'Revision',
    hint: 'Prefers low-usage questions across selected syllabus.',
  },
  quick_test: {
    label: 'Quick test',
    hint: 'Shorter, accessible mix for rapid checks.',
  },
}

export const GENERATION_SCOPE_META: Record<
  GenerationScope,
  { label: string; hint: string; future?: boolean }
> = {
  full_syllabus: {
    label: 'Full syllabus',
    hint: 'All published chapters for this class and subject.',
  },
  selected_chapters: {
    label: 'Selected chapters',
    hint: 'Limit generation to chapters you choose.',
  },
  selected_topics: {
    label: 'Selected topics',
    hint: 'Filter by topic within the syllabus.',
  },
  recent_units: {
    label: 'Recent units',
    hint: 'Chapters with the most recently updated questions.',
  },
  weak_chapters: {
    label: 'Weak chapters',
    hint: 'Chapters with the lowest average question usage (coverage gaps).',
    future: true,
  },
  custom: {
    label: 'Custom selection',
    hint: 'Combine chapter and topic filters manually.',
  },
}

type DifficultyBucket = 'easy' | 'medium' | 'hard'

function questionTypeToBlueprint(type: QuestionType | string): BlueprintQuestionType | null {
  switch (type) {
    case 'mcq':
    case 'true_false':
    case 'fill_blank':
      return 'mcq'
    case 'very_short':
      return 'very_short'
    case 'short':
      return 'short_answer'
    case 'long':
      return 'long_answer'
    case 'assertion_reason':
      return 'assertion_reason'
    default:
      return null
  }
}

function blueprintTypeOf(q: QuestionRecord): BlueprintQuestionType | null {
  if (q.typeRaw) return questionTypeToBlueprint(q.typeRaw)
  const normalized = q.type.trim().toLowerCase()
  if (normalized.includes('mcq') || normalized.includes('true') || normalized.includes('fill')) {
    return 'mcq'
  }
  if (normalized.includes('very short')) return 'very_short'
  if (normalized.includes('short')) return 'short_answer'
  if (normalized.includes('long')) return 'long_answer'
  if (normalized.includes('assertion')) return 'assertion_reason'
  return null
}

function difficultyBucket(level: QuestionRecord['difficulty']): DifficultyBucket {
  if (level <= 2) return 'easy'
  if (level === 3) return 'medium'
  return 'hard'
}

function difficultyLabel(level: QuestionRecord['difficulty']): string {
  const b = difficultyBucket(level)
  if (b === 'easy') return 'Easy difficulty'
  if (b === 'medium') return 'Medium difficulty'
  return 'Hard difficulty'
}

function adjustDifficultyMix(
  base: BlueprintDifficultyMix,
  preset: GenerationPreset,
): BlueprintDifficultyMix {
  let { easy, medium, hard } = { ...base }
  switch (preset) {
    case 'easy_focused':
      easy = Math.min(100, easy + 15)
      hard = Math.max(0, hard - 10)
      break
    case 'board_level':
      medium = Math.min(100, medium + 5)
      easy = Math.max(0, easy - 5)
      break
    case 'practice':
      easy = Math.min(100, easy + 5)
      break
    case 'revision':
      medium = Math.min(100, medium + 3)
      break
    case 'quick_test':
      easy = Math.min(100, easy + 20)
      hard = Math.max(0, hard - 15)
      break
    default:
      break
  }
  const sum = easy + medium + hard || 1
  return {
    easy: Math.round((easy / sum) * 100),
    medium: Math.round((medium / sum) * 100),
    hard: Math.round((hard / sum) * 100),
  }
}

function planSlotDifficulties(
  count: number,
  mix: BlueprintDifficultyMix,
): DifficultyBucket[] {
  if (count <= 0) return []
  const easyN = Math.round((mix.easy / 100) * count)
  const hardN = Math.round((mix.hard / 100) * count)
  const mediumN = Math.max(0, count - easyN - hardN)
  const slots: DifficultyBucket[] = [
    ...Array(easyN).fill('easy' as const),
    ...Array(mediumN).fill('medium' as const),
    ...Array(hardN).fill('hard' as const),
  ]
  while (slots.length < count) slots.push('medium')
  while (slots.length > count) slots.pop()
  // Interleave for spread: easy, medium, hard pattern
  const order: DifficultyBucket[] = ['easy', 'medium', 'hard']
  const grouped: Record<DifficultyBucket, DifficultyBucket[]> = {
    easy: slots.filter((s) => s === 'easy'),
    medium: slots.filter((s) => s === 'medium'),
    hard: slots.filter((s) => s === 'hard'),
  }
  const interleaved: DifficultyBucket[] = []
  let i = 0
  while (interleaved.length < count) {
    const bucket = order[i % 3]!
    if (grouped[bucket].length > 0) {
      interleaved.push(grouped[bucket].shift()!)
    }
    i += 1
    if (grouped.easy.length + grouped.medium.length + grouped.hard.length === 0) break
  }
  return interleaved.length === count ? interleaved : slots.slice(0, count)
}

function resolveScopeChapters(
  scope: GenerationScope,
  pool: QuestionRecord[],
  selectedChapters: string[],
): string[] {
  const allChapters = [...new Set(pool.map((q) => q.chapter).filter(Boolean))].sort()
  if (scope === 'full_syllabus') return allChapters
  if (scope === 'selected_chapters' || scope === 'custom') {
    return selectedChapters.length > 0 ? selectedChapters : allChapters
  }
  if (scope === 'recent_units') {
    const byChapter = new Map<string, number>()
    for (const q of pool) {
      const prev = byChapter.get(q.chapter) ?? 0
      byChapter.set(q.chapter, Math.max(prev, q.updatedAtMs))
    }
    return [...byChapter.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, Math.min(3, allChapters.length))
      .map(([ch]) => ch)
  }
  if (scope === 'weak_chapters') {
    const usageByChapter = new Map<string, { sum: number; n: number }>()
    for (const q of pool) {
      const entry = usageByChapter.get(q.chapter) ?? { sum: 0, n: 0 }
      entry.sum += q.usage
      entry.n += 1
      usageByChapter.set(q.chapter, entry)
    }
    return [...usageByChapter.entries()]
      .map(([ch, { sum, n }]) => ({ ch, avg: sum / Math.max(n, 1) }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, Math.min(3, allChapters.length))
      .map((x) => x.ch)
  }
  return allChapters
}

function questionInScope(
  q: QuestionRecord,
  config: GenerationConfig,
  scopeChapters: string[],
): boolean {
  if (config.scope === 'selected_topics' || config.scope === 'custom') {
    if (config.selectedTopics.length > 0) {
      const topicMatch = config.selectedTopics.some(
        (t) => t.toLowerCase() === q.topic.toLowerCase(),
      )
      if (!topicMatch) return false
    }
  }
  if (
    config.scope === 'selected_chapters' ||
    config.scope === 'custom' ||
    config.scope === 'recent_units' ||
    config.scope === 'weak_chapters'
  ) {
    return scopeChapters.includes(q.chapter)
  }
  return true
}

function baseEligible(
  q: QuestionRecord,
  classLabel: string,
  subject: string,
  medium: PaperMedium,
): boolean {
  return (
    q.statusRaw === 'published' &&
    !q.isInTrash &&
    q.classLabel === classLabel &&
    q.subject === subject &&
    questionMatchesPaperMedium(q, medium)
  )
}

export function countAvailableQuestions(
  pool: QuestionRecord[],
  config: GenerationConfig,
  classLabel: string,
  subject: string,
  medium: PaperMedium,
  snapshot?: PaperBlueprintSnapshot | null,
): AvailabilitySummary {
  const eligible = pool.filter((q) => baseEligible(q, classLabel, subject, medium))
  const scopeChapters = resolveScopeChapters(config.scope, eligible, config.selectedChapters)
  const scoped = eligible.filter((q) => questionInScope(q, config, scopeChapters))

  const byChapter: Record<string, number> = {}
  const byTopic: Record<string, number> = {}
  for (const q of scoped) {
    byChapter[q.chapter] = (byChapter[q.chapter] ?? 0) + 1
    if (q.topic) byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1
  }

  void snapshot
  return { total: scoped.length, byChapter, byTopic }
}

type ScoreContext = {
  targetMarks: number
  targetDifficulty: DifficultyBucket
  allowedTypes: BlueprintQuestionType[]
  preset: GenerationPreset
  scopeChapters: string[]
  chapterPickCounts: Map<string, number>
  usedIds: Set<string>
  marksTolerance: number
}

function scoreQuestion(
  q: QuestionRecord,
  ctx: ScoreContext,
): ScoredQuestion | null {
  if (ctx.usedIds.has(q.id)) return null

  const bpType = blueprintTypeOf(q)
  if (!bpType || !ctx.allowedTypes.includes(bpType)) return null

  const marksDelta = Math.abs(q.marks - ctx.targetMarks)
  if (marksDelta > ctx.marksTolerance) return null

  const reasons: string[] = []
  let score = 0

  // Marks fit (30%)
  const marksScore =
    marksDelta === 0 ? 100 : marksDelta === 1 ? 70 : marksDelta === 2 ? 40 : 0
  score += marksScore * 0.3
  if (marksDelta === 0) reasons.push(`${q.marks} marks — exact fit`)
  else reasons.push(`${q.marks} marks — close fit`)

  // Difficulty fit (25%)
  const bucket = difficultyBucket(q.difficulty)
  const diffScore =
    bucket === ctx.targetDifficulty ? 100 : bucket === 'medium' ? 60 : 30
  score += diffScore * 0.25
  reasons.push(difficultyLabel(q.difficulty))

  // Type alignment (20%)
  score += 20
  reasons.push(`Type matches section (${bpType.replace('_', ' ')})`)

  // Freshness (15%)
  const usagePenalty = Math.min(q.usage * 6, 50)
  const freshnessScore = Math.max(0, 100 - usagePenalty)
  score += freshnessScore * 0.15
  if (q.usage <= 2) reasons.push('Low recent usage')
  else if (q.usage >= 8) reasons.push('Higher usage — deprioritised')

  // Chapter relevance (10%)
  let chapterScore = ctx.scopeChapters.includes(q.chapter) ? 100 : 40
  const chapterUses = ctx.chapterPickCounts.get(q.chapter) ?? 0
  chapterScore -= chapterUses * 25
  score += Math.max(0, chapterScore) * 0.1
  if (chapterUses === 0) reasons.push(`${q.chapter} match`)
  else if (chapterUses >= 2) reasons.push('Chapter diversity — spread syllabus')

  if (ctx.preset === 'revision' && q.usage <= 3) {
    score += 5
    reasons.push('Revision preset — underused question')
  }

  const fitnessScore = Math.min(100, Math.round(score))
  return { question: q, fitnessScore, reasons: reasons.slice(0, 4) }
}

function marksToleranceForPreset(preset: GenerationPreset): number {
  if (preset === 'practice') return 1
  return 0
}

function generateSection(
  sectionSnap: PaperBlueprintSectionSnapshot,
  sectionDef: PaperSectionDef,
  pool: QuestionRecord[],
  config: GenerationConfig,
  difficultyMix: BlueprintDifficultyMix,
  usedIds: Set<string>,
): SectionGenerationResult {
  const scopeChapters = resolveScopeChapters(config.scope, pool, config.selectedChapters)
  const scopedPool = pool.filter((q) => questionInScope(q, config, scopeChapters))
  const slotDifficulties = planSlotDifficulties(sectionSnap.questionCount, difficultyMix)
  const chapterPickCounts = new Map<string, number>()
  const marksTolerance = marksToleranceForPreset(config.preset)
  const slots: GeneratedSlot[] = []
  const warnings: string[] = []
  const localUsed = new Set(usedIds)

  for (let i = 0; i < sectionSnap.questionCount; i += 1) {
    const targetDifficulty = slotDifficulties[i] ?? 'medium'
    const ctx: ScoreContext = {
      targetMarks: sectionSnap.marksPerQuestion,
      targetDifficulty,
      allowedTypes: sectionSnap.allowedQuestionTypes,
      preset: config.preset,
      scopeChapters,
      chapterPickCounts,
      usedIds: localUsed,
      marksTolerance,
    }

    const candidates = scopedPool
      .map((q) => scoreQuestion(q, ctx))
      .filter((s): s is ScoredQuestion => s !== null)
      .sort((a, b) => {
        if (b.fitnessScore !== a.fitnessScore) return b.fitnessScore - a.fitnessScore
        return a.question.id.localeCompare(b.question.id)
      })

    const pick = candidates[0]
    if (!pick) {
      slots.push({
        question: null,
        fitnessScore: 0,
        reasons: [],
        unfilled: true,
      })
      continue
    }

    localUsed.add(pick.question.id)
    chapterPickCounts.set(
      pick.question.chapter,
      (chapterPickCounts.get(pick.question.chapter) ?? 0) + 1,
    )
    slots.push({
      question: pick.question,
      fitnessScore: pick.fitnessScore,
      reasons: pick.reasons,
    })
  }

  const generatedCount = slots.filter((s) => s.question).length
  const unfilled = sectionSnap.questionCount - generatedCount
  if (unfilled > 0) {
    warnings.push(
      `${unfilled} of ${sectionSnap.questionCount} slots could not be filled for Section ${sectionDef.letter}.`,
    )
  }

  const hardNeeded = slotDifficulties.filter((d) => d === 'hard').length
  const hardFilled = slots.filter(
    (s) => s.question && difficultyBucket(s.question.difficulty) === 'hard',
  ).length
  if (hardNeeded > hardFilled && hardNeeded - hardFilled >= 1) {
    warnings.push(
      `Not enough hard questions available for Section ${sectionDef.letter} (${hardFilled}/${hardNeeded}).`,
    )
  }

  return {
    sectionId: sectionDef.id,
    sectionTitle: sectionSnap.title,
    plannedCount: sectionSnap.questionCount,
    generatedCount,
    slots,
    warnings,
  }
}

export function generatePaperDraft(
  snapshot: PaperBlueprintSnapshot,
  sections: PaperSectionDef[],
  pool: QuestionRecord[],
  config: GenerationConfig,
  classLabel: string,
  subject: string,
  medium: PaperMedium,
  existingComposition?: PaperComposition,
): PaperGenerationResult {
  const eligible = pool.filter((q) => baseEligible(q, classLabel, subject, medium))
  const difficultyMix = adjustDifficultyMix(snapshot.difficultyDistribution, config.preset)
  const usedIds = new Set<string>()

  if (existingComposition && config.targetSectionId) {
    for (const section of sections) {
      if (section.id === config.targetSectionId) continue
      for (const q of existingComposition[section.id]) usedIds.add(q.id)
    }
  } else if (existingComposition && !config.targetSectionId) {
    // Full regen — still avoid duplicates within new draft
    void existingComposition
  }

  const sectionSnaps = snapshot.sections.filter((s) => {
    if (!config.targetSectionId) return true
    return s.paperSectionId === config.targetSectionId
  })

  const sectionResults: SectionGenerationResult[] = []
  const globalWarnings: string[] = []

  for (const sectionSnap of sectionSnaps) {
    const sectionDef = sections.find((s) => s.id === sectionSnap.paperSectionId)
    if (!sectionDef) continue
    const result = generateSection(
      sectionSnap,
      sectionDef,
      eligible,
      config,
      difficultyMix,
      usedIds,
    )
    for (const slot of result.slots) {
      if (slot.question) usedIds.add(slot.question.id)
    }
    sectionResults.push(result)
    globalWarnings.push(...result.warnings)
  }

  const scopeChapters = resolveScopeChapters(config.scope, eligible, config.selectedChapters)
  const scopeSummary =
    config.scope === 'full_syllabus'
      ? 'Full syllabus'
      : `${scopeChapters.length} chapter${scopeChapters.length === 1 ? '' : 's'}`

  const totalGenerated = sectionResults.reduce((s, r) => s + r.generatedCount, 0)
  const totalPlanned = sectionResults.reduce((s, r) => s + r.plannedCount, 0)

  if (totalGenerated < totalPlanned) {
    globalWarnings.push(
      'Repository lacks enough matching questions — partial draft generated. Review warnings per section.',
    )
  }

  return {
    sections: sectionResults,
    warnings: [...new Set(globalWarnings)],
    presetLabel: GENERATION_PRESET_META[config.preset].label,
    difficultySummary: `${difficultyMix.easy}% easy · ${difficultyMix.medium}% medium · ${difficultyMix.hard}% hard`,
    totalGenerated,
    totalPlanned,
    scopeSummary,
  }
}

export function applyGenerationToComposition(
  composition: PaperComposition,
  result: PaperGenerationResult,
  mode: 'full' | 'section',
  sectionId?: PaperSectionId,
): PaperComposition {
  const next = { ...composition }
  for (const sectionResult of result.sections) {
    if (mode === 'section' && sectionResult.sectionId !== sectionId) continue
    const questions = sectionResult.slots
      .map((s) => s.question)
      .filter((q): q is QuestionRecord => q !== null)
    next[sectionResult.sectionId] = questions
  }
  return next
}

export function getReplacementCandidates(
  source: QuestionRecord,
  pool: QuestionRecord[],
  usedIds: Set<string>,
  classLabel: string,
  subject: string,
  medium: PaperMedium,
  sectionSnap?: PaperBlueprintSectionSnapshot,
  limit = 5,
): ScoredQuestion[] {
  const eligible = pool.filter((q) => baseEligible(q, classLabel, subject, medium))
  const targetBucket = difficultyBucket(source.difficulty)
  const allowedTypes = sectionSnap?.allowedQuestionTypes ?? null

  const ctx: ScoreContext = {
    targetMarks: source.marks,
    targetDifficulty: targetBucket,
    allowedTypes: allowedTypes ?? ['mcq', 'very_short', 'short_answer', 'long_answer', 'assertion_reason'],
    preset: 'balanced',
    scopeChapters: [],
    chapterPickCounts: new Map(),
    usedIds: new Set([...usedIds].filter((id) => id !== source.id)),
    marksTolerance: 0,
  }

  return eligible
    .filter((q) => q.id !== source.id)
    .map((q) => scoreQuestion(q, ctx))
    .filter((s): s is ScoredQuestion => s !== null)
    .filter((s) => {
      const bp = blueprintTypeOf(s.question)
      if (allowedTypes && bp && !allowedTypes.includes(bp)) return false
      return (
        s.question.marks === source.marks &&
        (s.question.type === source.type ||
          s.question.typeRaw === source.typeRaw ||
          difficultyBucket(s.question.difficulty) === targetBucket)
      )
    })
    .sort((a, b) => {
      if (b.fitnessScore !== a.fitnessScore) return b.fitnessScore - a.fitnessScore
      return a.question.id.localeCompare(b.question.id)
    })
    .slice(0, limit)
}
