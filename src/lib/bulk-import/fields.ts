/** PaperCraft fields available for column mapping */

export const IMPORT_FIELDS = [
  'questionTextEn',
  'questionTextHi',
  'questionType',
  'class',
  'subject',
  'chapter',
  'topic',
  'difficulty',
  'marks',
  'answer',
  'solution',
  'bloomLevel',
  'estimatedMinutes',
  'tags',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctOption',
] as const

export type ImportField = (typeof IMPORT_FIELDS)[number]

export const REQUIRED_IMPORT_FIELDS: ImportField[] = [
  'questionTextEn',
  'questionType',
  'class',
  'subject',
  'chapter',
  'difficulty',
  'marks',
]

export const OPTIONAL_IMPORT_FIELDS: ImportField[] = IMPORT_FIELDS.filter(
  (f) => !REQUIRED_IMPORT_FIELDS.includes(f),
)

export const FIELD_LABELS: Record<ImportField, string> = {
  questionTextEn: 'Question (English)',
  questionTextHi: 'Question (Hindi)',
  questionType: 'Question type',
  class: 'Class',
  subject: 'Subject',
  chapter: 'Chapter',
  topic: 'Topic',
  difficulty: 'Difficulty',
  marks: 'Marks',
  answer: 'Answer',
  solution: 'Solution',
  bloomLevel: 'Bloom level',
  estimatedMinutes: 'Estimated minutes',
  tags: 'Tags',
  optionA: 'MCQ option A',
  optionB: 'MCQ option B',
  optionC: 'MCQ option C',
  optionD: 'MCQ option D',
  correctOption: 'MCQ correct (a–d)',
}

const ALIASES: Record<ImportField, string[]> = {
  questionTextEn: [
    'questiontexten',
    'questiontext',
    'questionen',
    'question',
    'question text',
    'question text en',
    'question_text',
    'question_text_en',
    'stem',
    'english',
  ],
  questionTextHi: [
    'questiontexthi',
    'questionhi',
    'hindi',
    'question hindi',
    'प्रश्न',
  ],
  questionType: ['questiontype', 'questiontype', 'question_type', 'type', 'qtype', 'format'],
  class: ['class', 'classnumber', 'grade', 'standard'],
  subject: ['subject', 'sub'],
  chapter: ['chapter', 'unit'],
  topic: ['topic', 'subtopic'],
  difficulty: [
    'difficulty',
    'difficultylevel',
    'difficulty_level',
    'level',
    'diff',
  ],
  marks: ['marks', 'mark', 'points'],
  answer: ['answer', 'correctanswer', 'key'],
  solution: ['solution', 'explanation', 'working'],
  bloomLevel: ['bloomlevel', 'bloom', 'blooms'],
  estimatedMinutes: ['estimatedminutes', 'minutes', 'time'],
  tags: ['tags', 'tag', 'labels'],
  optionA: ['optiona', 'a', 'choicea'],
  optionB: ['optionb', 'b', 'choiceb'],
  optionC: ['optionc', 'c', 'choicec'],
  optionD: ['optiond', 'd', 'choiced'],
  correctOption: ['correctoption', 'correct', 'mcqcorrect'],
}

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function autoMapColumns(headers: string[]): Partial<Record<ImportField, string>> {
  const mapping: Partial<Record<ImportField, string>> = {}
  const used = new Set<string>()

  for (const field of IMPORT_FIELDS) {
    const aliases = [field.toLowerCase(), ...ALIASES[field].map(normHeader)]
    for (const header of headers) {
      if (used.has(header)) continue
      const n = normHeader(header)
      if (aliases.includes(n)) {
        mapping[field] = header
        used.add(header)
        break
      }
    }
  }

  return mapping
}

export function unmappedRequired(
  mapping: Partial<Record<ImportField, string>>,
): ImportField[] {
  return REQUIRED_IMPORT_FIELDS.filter((f) => !mapping[f])
}
