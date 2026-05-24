import type {
  BlueprintDifficultyMix,
  BlueprintDraft,
  BlueprintQuestionType,
  BlueprintSection,
} from '@/types/blueprint'
import { BLUEPRINT_QUESTION_TYPE_LABELS } from '@/types/blueprint'

export function sectionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

export function computeSectionMarks(section: BlueprintSection): number {
  return section.questionCount * section.marksPerQuestion
}

export function computeAllocatedMarks(sections: BlueprintSection[]): number {
  return sections.reduce((sum, s) => sum + computeSectionMarks(s), 0)
}

export function formatBlueprintDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return hrs === 1 ? '1 hr' : `${hrs} hr`
  return `${hrs} hr ${mins} min`
}

export function formatClassRange(classes: string[]): string {
  if (classes.length === 0) return '—'
  if (classes.length === 1) return classes[0]
  if (classes.length <= 3) return classes.join(', ')
  return `${classes[0]}–${classes[classes.length - 1]}`
}

export function formatSubjectList(subjects: string[]): string {
  if (subjects.length === 0) return '—'
  if (subjects.length <= 2) return subjects.join(', ')
  return `${subjects[0]} +${subjects.length - 1}`
}

export function difficultyMixValid(mix: BlueprintDifficultyMix): boolean {
  const total = mix.easy + mix.medium + mix.hard
  return total === 100 && mix.easy >= 0 && mix.medium >= 0 && mix.hard >= 0
}

export function sectionNamesUnique(sections: BlueprintSection[]): boolean {
  const names = sections.map((s) => s.title.trim().toLowerCase())
  return new Set(names).size === names.length
}

export type BlueprintValidationIssue = {
  field: string
  message: string
}

export function validateBlueprintDraft(draft: BlueprintDraft): BlueprintValidationIssue[] {
  const issues: BlueprintValidationIssue[] = []

  if (!draft.name.trim()) {
    issues.push({ field: 'name', message: 'Blueprint name is required.' })
  }
  if (!draft.examType.trim()) {
    issues.push({ field: 'examType', message: 'Exam type is required.' })
  }
  if (draft.totalMarks <= 0) {
    issues.push({ field: 'totalMarks', message: 'Total marks must be greater than zero.' })
  }
  if (draft.durationMinutes <= 0) {
    issues.push({ field: 'durationMinutes', message: 'Duration must be greater than zero.' })
  }
  if (draft.recommendedClasses.length === 0) {
    issues.push({ field: 'recommendedClasses', message: 'Select at least one class.' })
  }
  if (draft.recommendedSubjects.length === 0) {
    issues.push({ field: 'recommendedSubjects', message: 'Select at least one subject.' })
  }
  if (draft.sections.length === 0) {
    issues.push({ field: 'sections', message: 'Add at least one section.' })
  }
  if (!sectionNamesUnique(draft.sections)) {
    issues.push({ field: 'sections', message: 'Section names must be unique.' })
  }

  for (const section of draft.sections) {
    if (!section.title.trim()) {
      issues.push({ field: `section-${section.id}`, message: 'Every section needs a title.' })
    }
    if (section.questionCount <= 0) {
      issues.push({
        field: `section-${section.id}`,
        message: `${section.title || 'Section'} must have at least one question.`,
      })
    }
    if (section.marksPerQuestion <= 0) {
      issues.push({
        field: `section-${section.id}`,
        message: `${section.title || 'Section'} marks per question must be positive.`,
      })
    }
    if (section.allowedQuestionTypes.length === 0) {
      issues.push({
        field: `section-${section.id}`,
        message: `${section.title || 'Section'} needs at least one question type.`,
      })
    }
    const unsupported = section.allowedQuestionTypes.filter(
      (t) => !(t in BLUEPRINT_QUESTION_TYPE_LABELS),
    )
    if (unsupported.length > 0) {
      issues.push({
        field: `section-${section.id}`,
        message: `Unsupported question type in ${section.title || 'section'}.`,
      })
    }
  }

  const allocated = computeAllocatedMarks(draft.sections)
  if (allocated !== draft.totalMarks) {
    issues.push({
      field: 'marks',
      message: `Section marks (${allocated}) must equal total marks (${draft.totalMarks}).`,
    })
  }

  if (!difficultyMixValid(draft.difficultyDistribution)) {
    issues.push({
      field: 'difficulty',
      message: 'Difficulty distribution must total 100%.',
    })
  }

  if (draft.chapterCoverage.mode === 'selected_chapters') {
    const included = draft.chapterCoverage.chapters.filter((c) => c.included !== false)
    if (included.length === 0) {
      issues.push({
        field: 'chapters',
        message: 'Select at least one chapter for selected-chapter coverage.',
      })
    }
    const chapterMarks = included.reduce((sum, c) => sum + c.marksWeight, 0)
    if (chapterMarks !== draft.totalMarks) {
      issues.push({
        field: 'chapters',
        message: `Chapter weighting (${chapterMarks}) must equal total marks (${draft.totalMarks}).`,
      })
    }
  }

  return issues
}

export function validateBlueprintStep(
  draft: BlueprintDraft,
  step: 1 | 2 | 3 | 4,
): BlueprintValidationIssue[] {
  const all = validateBlueprintDraft(draft)
  const stepFields: Record<number, string[]> = {
    1: ['name', 'examType', 'totalMarks', 'durationMinutes', 'recommendedClasses', 'recommendedSubjects'],
    2: ['sections', 'marks'],
    3: ['difficulty', 'chapters'],
    4: [],
  }
  const prefixes = stepFields[step]
  if (step === 4) return all
  return all.filter(
    (issue) =>
      prefixes.includes(issue.field) ||
      (step === 2 && issue.field.startsWith('section-')),
  )
}

export function structurePreviewLine(section: BlueprintSection): string {
  const types = section.allowedQuestionTypes
    .map((t) => BLUEPRINT_QUESTION_TYPE_LABELS[t as BlueprintQuestionType] ?? t)
    .join(', ')
  const countLabel =
    section.questionCount === 1
      ? `1 question`
      : `${section.questionCount} questions`
  const marksLabel =
    section.marksPerQuestion === 1
      ? '1 mark each'
      : `${section.marksPerQuestion} marks each`
  return `${countLabel} · ${marksLabel}${types ? ` · ${types}` : ''}`
}

export function newSectionId(): string {
  return `sec-${crypto.randomUUID().slice(0, 8)}`
}

export function duplicateBlueprintDraft(draft: BlueprintDraft, name?: string): BlueprintDraft {
  return {
    ...draft,
    name: name ?? `${draft.name} (copy)`,
    sections: draft.sections.map((s) => ({
      ...s,
      id: newSectionId(),
      allowedQuestionTypes: [...s.allowedQuestionTypes],
      internalChoice: s.internalChoice ? { ...s.internalChoice } : { enabled: false },
      sectionDifficulty: s.sectionDifficulty ? { ...s.sectionDifficulty } : undefined,
    })),
    recommendedClasses: [...draft.recommendedClasses],
    recommendedSubjects: [...draft.recommendedSubjects],
    difficultyDistribution: { ...draft.difficultyDistribution },
    chapterCoverage: {
      ...draft.chapterCoverage,
      chapters: draft.chapterCoverage.chapters.map((c) => ({ ...c })),
    },
  }
}
