import { sectionLetter } from '@/lib/blueprint-utils'
import {
  type PaperComposition,
  type PaperSectionDef,
  type PaperSectionId,
  type PaperSetupState,
  type PaperStats,
  DEFAULT_SECTIONS,
} from '@/lib/paper-builder'
import { defaultPaperInstanceLayer } from '@/lib/paper-instance'
import { formatBlueprintDuration } from '@/lib/blueprint-utils'
import type { BlueprintDocument, BlueprintQuestionType } from '@/types/blueprint'
import type { PaperBlueprintSnapshot, PaperBlueprintSectionSnapshot } from '@/types/paper'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { QuestionType } from '@/types/question'

const PAPER_SECTION_IDS: PaperSectionId[] = ['A', 'B', 'C']
const MAX_BUILDER_SECTIONS = 3

export type BlueprintPaperBootstrap = {
  setup: PaperSetupState
  instanceLayer: PaperInstanceLayer
}

export type BlueprintMatchIssue = {
  kind: 'missing' | 'overweight' | 'distribution' | 'guidance'
  message: string
}

export type BlueprintMatchResult = {
  score: number
  issues: BlueprintMatchIssue[]
  missing: string[]
  overweight: string[]
  distribution: string[]
}

function classLabelFromBlueprint(classes: string[]): string {
  const first = classes[0]
  if (!first || first === 'All classes') return 'Class X'
  if (/^Class\s/i.test(first)) return first
  if (/^(V|VI|VII|VIII|IX|X|XI|XII)$/.test(first)) return `Class ${first}`
  return first
}

function subjectFromBlueprint(subjects: string[]): string {
  const first = subjects.find((s) => s !== 'All subjects')
  return first ?? 'Mathematics'
}

export function buildBlueprintSnapshot(
  blueprint: Pick<
    BlueprintDocument,
    | 'name'
    | 'examType'
    | 'totalMarks'
    | 'durationMinutes'
    | 'instructions'
    | 'difficultyDistribution'
    | 'chapterCoverage'
    | 'sections'
  >,
): PaperBlueprintSnapshot {
  const mapped = blueprint.sections.slice(0, MAX_BUILDER_SECTIONS)
  const truncated = Math.max(0, blueprint.sections.length - MAX_BUILDER_SECTIONS)

  return {
    name: blueprint.name,
    examType: blueprint.examType,
    totalMarks: blueprint.totalMarks,
    durationMinutes: blueprint.durationMinutes,
    instructions: blueprint.instructions,
    difficultyDistribution: { ...blueprint.difficultyDistribution },
    chapterCoverage: {
      mode: blueprint.chapterCoverage.mode,
      chapters: blueprint.chapterCoverage.chapters.map((c) => ({
        chapterName: c.chapterName,
        marksWeight: c.marksWeight,
        mandatory: c.mandatory,
        included: c.included,
      })),
    },
    truncatedSectionCount: truncated || undefined,
    sections: mapped.map((section, index): PaperBlueprintSectionSnapshot => ({
      blueprintSectionId: section.id,
      paperSectionId: PAPER_SECTION_IDS[index]!,
      title: section.title,
      description: section.description,
      questionCount: section.questionCount,
      marksPerQuestion: section.marksPerQuestion,
      marksAllocation: section.marksAllocation,
      allowedQuestionTypes: [...section.allowedQuestionTypes],
      internalChoice: section.internalChoice
        ? { ...section.internalChoice }
        : undefined,
      instructions: section.instructions ?? section.description,
      compulsory: true,
      minMarks: section.questionCount * section.marksPerQuestion,
      maxMarks: section.marksAllocation,
    })),
  }
}

export function blueprintToPaperBootstrap(
  blueprint: BlueprintDocument,
  blueprintId: string,
  overrides?: Partial<Pick<PaperSetupState, 'classLabel' | 'subject' | 'medium' | 'examinationName'>>,
): BlueprintPaperBootstrap {
  const snapshot = buildBlueprintSnapshot(blueprint)
  const sectionCount = Math.min(
    MAX_BUILDER_SECTIONS,
    Math.max(1, snapshot.sections.length),
  ) as 1 | 2 | 3

  const setup: PaperSetupState = {
    examinationName: overrides?.examinationName ?? blueprint.name,
    academicSession: '2025–26 · Term II',
    classLabel: overrides?.classLabel ?? classLabelFromBlueprint(blueprint.recommendedClasses),
    subject: overrides?.subject ?? subjectFromBlueprint(blueprint.recommendedSubjects),
    medium: overrides?.medium ?? 'english',
    examType: blueprint.examType,
    totalMarks: blueprint.totalMarks,
    durationLabel: formatBlueprintDuration(blueprint.durationMinutes),
    sectionCount,
    structureNotes: snapshot.truncatedSectionCount
      ? `Blueprint defines ${blueprint.sections.length} sections — builder uses the first ${MAX_BUILDER_SECTIONS}.`
      : blueprint.description ?? '',
    generalInstructions:
      blueprint.instructions?.trim() ||
      'Answer all questions. Figures to the right indicate full marks.',
    blueprintId,
    blueprintVersion: blueprint.updatedAt?.toMillis?.() ?? Date.now(),
    blueprintSnapshot: snapshot,
  }

  const instanceLayer = instanceLayerFromBlueprintSnapshot(snapshot)
  return { setup, instanceLayer }
}

export function instanceLayerFromBlueprintSnapshot(
  snapshot: PaperBlueprintSnapshot,
): PaperInstanceLayer {
  const layer = defaultPaperInstanceLayer()
  for (const section of snapshot.sections) {
    const id = section.paperSectionId as PaperSectionId
    layer.sections[id] = {
      ...layer.sections[id],
      title: section.title,
      instructions: section.instructions ?? section.description,
    }
  }
  return layer
}

export function sectionsFromBlueprintSnapshot(
  snapshot: PaperBlueprintSnapshot,
): PaperSectionDef[] {
  return snapshot.sections.map((section) => ({
    id: section.paperSectionId as PaperSectionId,
    letter: section.paperSectionId as PaperSectionId,
    name: `${section.title} · ${section.marksPerQuestion} mark${section.marksPerQuestion === 1 ? '' : 's'} each`,
    instructions:
      section.instructions ??
      (section.internalChoice?.enabled
        ? `Internal choice — attempt ${section.internalChoice.attemptCount ?? section.questionCount} of ${section.questionCount}.`
        : 'All questions in this section are compulsory.'),
    emptyHint: `Add ${section.allowedQuestionTypes.map((t) => t.replace('_', ' ')).join(' or ')} questions here`,
    marksEach: section.marksPerQuestion,
    plannedCount: section.questionCount,
  }))
}

export function sectionsForSetupWithBlueprint(setup: PaperSetupState): PaperSectionDef[] {
  if (setup.blueprintSnapshot?.sections?.length) {
    return sectionsFromBlueprintSnapshot(setup.blueprintSnapshot)
  }
  return DEFAULT_SECTIONS.slice(0, setup.sectionCount)
}

function questionTypeToBlueprint(type: QuestionType): BlueprintQuestionType | null {
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

export function computeBlueprintMatch(
  snapshot: PaperBlueprintSnapshot,
  composition: PaperComposition,
  sections: PaperSectionDef[],
  stats: PaperStats,
): BlueprintMatchResult {
  const issues: BlueprintMatchIssue[] = []
  const missing: string[] = []
  const overweight: string[] = []
  const distribution: string[] = []

  let typeScore = 1

  const marksDelta = Math.abs(stats.totalMarks - snapshot.totalMarks)
  const marksScore = Math.max(0, 1 - marksDelta / Math.max(snapshot.totalMarks, 1))

  let plannedQuestions = 0
  let actualQuestions = 0
  for (const section of snapshot.sections) {
    const def = sections.find((s) => s.id === section.paperSectionId)
    if (!def) {
      // Blueprint expects a section the current paper no longer has (e.g. the
      // section count was reduced). Count its planned questions as fully missing
      // so the match score reflects the gap instead of silently ignoring it.
      plannedQuestions += section.questionCount
      const label = `${section.questionCount} question${section.questionCount === 1 ? '' : 's'} in Section ${section.paperSectionId}`
      missing.push(label)
      issues.push({
        kind: 'missing',
        message: `Section ${section.paperSectionId} is in the blueprint but not in this paper — ${label.toLowerCase()} unplaced.`,
      })
      continue
    }
    const count = stats.sectionCounts[def.id]
    const sectionMarks = stats.sectionMarks[def.id]
    plannedQuestions += section.questionCount
    actualQuestions += count

    const qShort = section.questionCount - count
    if (qShort > 0) {
      const label = `${qShort} question${qShort === 1 ? '' : 's'} in Section ${def.letter}`
      missing.push(label)
      issues.push({ kind: 'missing', message: `Missing ${label.toLowerCase()}.` })
    }

    const marksOver = sectionMarks - section.marksAllocation
    if (marksOver > section.marksPerQuestion) {
      const label = `Section ${def.letter} exceeds planned marks`
      overweight.push(label)
      issues.push({
        kind: 'overweight',
        message: `${label} by ${marksOver} marks.`,
      })
    }

    const allowed = new Set(section.allowedQuestionTypes)
    const wrongTypes = composition[def.id].filter((q) => {
      const mapped = questionTypeToBlueprint(q.type)
      return mapped && !allowed.has(mapped)
    })
    if (wrongTypes.length > 0) {
      distribution.push(
        `${wrongTypes.length} question${wrongTypes.length === 1 ? '' : 's'} in Section ${def.letter} outside allowed types`,
      )
      typeScore -= 0.15
    }

    if (section.internalChoice?.enabled && count > section.questionCount) {
      issues.push({
        kind: 'guidance',
        message: `Section ${def.letter} has internal choice — pool is ${section.questionCount} questions.`,
      })
    }
  }

  const questionScore =
    plannedQuestions > 0 ? Math.min(1, actualQuestions / plannedQuestions) : 1

  const totalQ = Math.max(stats.questionCount, 1)
  const target = snapshot.difficultyDistribution
  const actualEasy = (stats.diffEasy / totalQ) * 100
  const actualMed = (stats.diffMed / totalQ) * 100
  const actualHard = (stats.diffHard / totalQ) * 100
  const diffDelta =
    Math.abs(actualEasy - target.easy) +
    Math.abs(actualMed - target.medium) +
    Math.abs(actualHard - target.hard)
  const difficultyScore = Math.max(0, 1 - diffDelta / 150)

  if (diffDelta > 25 && stats.questionCount >= 3) {
    distribution.push('Difficulty mix differs from blueprint target')
    issues.push({
      kind: 'distribution',
      message: 'Question difficulty balance differs from the blueprint target.',
    })
  }

  if (snapshot.truncatedSectionCount) {
    issues.push({
      kind: 'guidance',
      message: `${snapshot.truncatedSectionCount} blueprint section(s) are not represented in this builder layout.`,
    })
  }

  const score = Math.round(
    (marksScore * 0.35 + questionScore * 0.35 + difficultyScore * 0.2 + typeScore * 0.1) *
      100,
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    issues,
    missing,
    overweight,
    distribution,
  }
}

export function blueprintGuidanceForExamType(
  snapshot: PaperBlueprintSnapshot,
): string[] {
  const hints: string[] = []
  const exam = snapshot.examType.toLowerCase()

  if (exam.includes('unit test')) {
    hints.push('Unit tests typically stay under 30 marks with no long-answer sections.')
    const hasLong = snapshot.sections.some((s) =>
      s.allowedQuestionTypes.includes('long_answer'),
    )
    if (hasLong) {
      hints.push('This blueprint includes long answers — consider whether that fits a unit test.')
    }
  }

  if (exam.includes('pre-board') || exam.includes('annual')) {
    const hasLong = snapshot.sections.some((s) =>
      s.allowedQuestionTypes.includes('long_answer'),
    )
    if (!hasLong) {
      hints.push('Board-style papers usually include long-answer sections.')
    }
  }

  if (snapshot.chapterCoverage.mode === 'full_syllabus') {
    hints.push('Blueprint expects full syllabus coverage across sections.')
  }

  return hints
}

export function formatBlueprintMatchLabel(score: number): string {
  if (score >= 90) return 'Strong match'
  if (score >= 70) return 'Good match'
  if (score >= 50) return 'Partial match'
  return 'Needs attention'
}

/** Marks tree nodes for blueprint detail visualization. */
export type BlueprintMarksNode = {
  id: string
  label: string
  marks: number
  children?: BlueprintMarksNode[]
}

export function buildBlueprintMarksTree(
  snapshot: PaperBlueprintSnapshot,
): BlueprintMarksNode {
  return {
    id: 'root',
    label: snapshot.name,
    marks: snapshot.totalMarks,
    children: snapshot.sections.map((section) => ({
      id: section.paperSectionId,
      label: `Section ${section.paperSectionId} · ${section.title}`,
      marks: section.marksAllocation,
      children: [
        {
          id: `${section.paperSectionId}-pool`,
          label: `${section.questionCount} × ${section.marksPerQuestion}m`,
          marks: section.marksAllocation,
        },
      ],
    })),
  }
}

export function questionTypeCountsFromSnapshot(
  snapshot: PaperBlueprintSnapshot,
): { type: BlueprintQuestionType; count: number; marks: number }[] {
  const map = new Map<BlueprintQuestionType, { count: number; marks: number }>()
  for (const section of snapshot.sections) {
    for (const type of section.allowedQuestionTypes) {
      const prev = map.get(type) ?? { count: 0, marks: 0 }
      map.set(type, {
        count: prev.count + Math.ceil(section.questionCount / section.allowedQuestionTypes.length),
        marks: section.marksPerQuestion,
      })
    }
  }
  return [...map.entries()].map(([type, v]) => ({ type, ...v }))
}

export function sectionLetterFromIndex(index: number): string {
  return sectionLetter(index)
}
