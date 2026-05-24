import type { BlueprintDocument, BlueprintDraft, BlueprintSection } from '@/types/blueprint'

const SYSTEM_AUTHOR = 'system'

function section(
  letter: string,
  title: string,
  questionCount: number,
  marksPerQuestion: number,
  allowedQuestionTypes: BlueprintSection['allowedQuestionTypes'],
  opts?: Partial<BlueprintSection>,
): BlueprintSection {
  return {
    id: `sec-${letter.toLowerCase()}`,
    title,
    questionCount,
    marksPerQuestion,
    marksAllocation: questionCount * marksPerQuestion,
    allowedQuestionTypes,
    internalChoice: { enabled: false },
    ...opts,
  }
}

const DEFAULT_DIFFICULTY = { easy: 30, medium: 50, hard: 20 }

function baseBlueprint(
  name: string,
  examType: string,
  totalMarks: number,
  durationMinutes: number,
  sections: BlueprintSection[],
  description: string,
  classes: string[],
): BlueprintDraft {
  return {
    name,
    examType,
    description,
    instructions: '',
    recommendedClasses: classes,
    recommendedSubjects: ['All subjects'],
    durationMinutes,
    totalMarks,
    sections,
    difficultyDistribution: { ...DEFAULT_DIFFICULTY },
    chapterCoverage: { mode: 'full_syllabus', chapters: [] },
  }
}

/** Canonical system blueprints — seeded into Firestore on first admin visit. */
export const DEFAULT_BLUEPRINT_SEEDS: BlueprintDraft[] = [
  baseBlueprint(
    'Unit Test',
    'Unit Test',
    25,
    60,
    [
      section('A', 'Objective', 10, 1, ['mcq', 'very_short']),
      section('B', 'Short answer', 5, 3, ['short_answer']),
    ],
    'Short, single-chapter assessment for quick unit checks.',
    ['VI', 'VII', 'VIII', 'IX', 'X'],
  ),
  baseBlueprint(
    'Periodic Test',
    'Periodic Test',
    40,
    90,
    [
      section('A', 'Objective', 10, 1, ['mcq']),
      section('B', 'Short answer', 6, 3, ['short_answer', 'very_short']),
      section('C', 'Long answer', 2, 5, ['long_answer']),
    ],
    'Mid-term cycle assessment spanning two chapters.',
    ['VI', 'VII', 'VIII', 'IX', 'X'],
  ),
  baseBlueprint(
    'Half-Yearly',
    'Half-Yearly',
    80,
    180,
    [
      section('A', 'Compulsory · objective', 16, 1, ['mcq', 'very_short']),
      section('B', 'Short answer', 8, 3, ['short_answer'], {
        internalChoice: { enabled: true, attemptCount: 6 },
        description: 'Internal choice in 2 questions.',
      }),
      section('C', 'Long answer', 8, 5, ['long_answer', 'case_study'], {
        internalChoice: { enabled: true, attemptCount: 6 },
      }),
    ],
    'Full syllabus to date · official three-section format.',
    ['IX', 'X', 'XI', 'XII'],
  ),
  baseBlueprint(
    'Annual Examination',
    'Annual Examination',
    80,
    180,
    [
      section('A', 'Objective', 16, 1, ['mcq']),
      section('B', 'Short answer', 8, 3, ['short_answer'], {
        internalChoice: { enabled: true, attemptCount: 6 },
      }),
      section('C', 'Long answer', 4, 5, ['long_answer']),
      section('D', 'Application', 4, 5, ['case_study', 'long_answer']),
    ],
    'Year-end examination covering the full syllabus.',
    ['IX', 'X', 'XI', 'XII'],
  ),
  baseBlueprint(
    'Pre-Board',
    'Pre-Board',
    80,
    180,
    [
      section('A', 'Compulsory · objective', 16, 1, ['mcq']),
      section('B', 'Short answer', 8, 3, ['short_answer'], {
        internalChoice: { enabled: true, attemptCount: 6 },
      }),
      section('C', 'Long answer', 4, 5, ['long_answer']),
      section('D', 'Case study', 4, 5, ['case_study']),
    ],
    'Mock board paper matching the official paper-1 pattern.',
    ['X', 'XII'],
  ),
  baseBlueprint(
    'Practice Worksheet',
    'Practice Worksheet',
    30,
    45,
    [section('A', 'Mixed practice', 10, 3, ['mcq', 'short_answer', 'very_short'])],
    'Untimed practice with flexible structure.',
    ['All classes'],
  ),
]

export function createEmptyBlueprintDraft(): BlueprintDraft {
  return {
    name: '',
    examType: '',
    description: '',
    instructions: '',
    recommendedClasses: [],
    recommendedSubjects: [],
    durationMinutes: 60,
    totalMarks: 40,
    sections: [
      section('A', 'Section A', 5, 1, ['mcq']),
    ],
    difficultyDistribution: { ...DEFAULT_DIFFICULTY },
    chapterCoverage: { mode: 'full_syllabus', chapters: [] },
  }
}

export function blueprintDocFromSeed(seed: BlueprintDraft): Omit<BlueprintDocument, 'createdAt' | 'updatedAt'> {
  return {
    ...seed,
    isSystem: true,
    archived: false,
    createdBy: SYSTEM_AUTHOR,
  }
}
