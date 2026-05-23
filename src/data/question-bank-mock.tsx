import type { ReactNode } from 'react'

export type QuestionFlag = 'new' | 'review' | 'bilingual'

export type QuestionRecord = {
  id: string
  chapter: string
  topic: string
  type: string
  marks: number
  difficulty: 1 | 2 | 3 | 4
  classLabel: string
  subject: string
  usage: number
  status: 'Approved' | 'Draft' | 'In Review' | 'Archived'
  body: ReactNode
  hindi?: string
  flags: QuestionFlag[]
}

/** RBSE · Classes V–VIII — visual mock data only (Pass 1) */
export const QUESTION_BANK: QuestionRecord[] = [
  {
    id: 'Q-RBSE-1204',
    classLabel: 'Class VI',
    subject: 'Mathematics',
    chapter: 'Knowing Our Numbers',
    topic: 'Estimation',
    type: 'Short Answer',
    marks: 2,
    difficulty: 2,
    usage: 6,
    status: 'Approved',
    body: (
      <>
        Estimate the following by rounding off to the nearest hundreds:{' '}
        <span className="pc-math">(a) 7,293</span> and{' '}
        <span className="pc-math">(b) 14,856</span>. Write the estimated sum.
      </>
    ),
    hindi:
      'सैंकड़ों तक पूर्णांकन करके निम्न का अनुमान लगाइए: (क) 7,293 और (ख) 14,856। अनुमानित योग लिखिए।',
    flags: ['bilingual'],
  },
  {
    id: 'Q-RBSE-1205',
    classLabel: 'Class VI',
    subject: 'Mathematics',
    chapter: 'Fractions',
    topic: 'Operations',
    type: 'Long Answer',
    marks: 3,
    difficulty: 3,
    usage: 4,
    status: 'Approved',
    body: (
      <>
        Shyam ate <span className="pc-math">3/8</span> of a cake and Geeta ate{' '}
        <span className="pc-math">1/4</span> of the same cake. Who ate more? How much
        cake is left?
      </>
    ),
    flags: [],
  },
  {
    id: 'Q-RBSE-0892',
    classLabel: 'Class VII',
    subject: 'Science',
    chapter: 'Nutrition in Plants',
    topic: 'Photosynthesis',
    type: 'Short Answer',
    marks: 3,
    difficulty: 2,
    usage: 9,
    status: 'Approved',
    body: (
      <>
        Explain how green plants prepare their own food. Name the gas released during
        photosynthesis and the pigment that traps sunlight.
      </>
    ),
    hindi:
      'समझाइए कि हरे पौधे अपना भोजन कैसे बनाते हैं। प्रकाश संश्लेषण के दौरान निकलने वाली गैस और सूर्य के प्रकाश को पकड़ने वाले वर्णक का नाम लिखिए।',
    flags: ['bilingual'],
  },
  {
    id: 'Q-RBSE-0893',
    classLabel: 'Class VII',
    subject: 'Science',
    chapter: 'Heat',
    topic: 'Transfer of Heat',
    type: 'MCQ',
    marks: 1,
    difficulty: 1,
    usage: 14,
    status: 'In Review',
    body: (
      <>
        A wooden spoon is dipped in a cup of hot tea. After a few minutes, the handle
        feels warm. This is mainly due to —
        <div className="pc-mcq-options">
          <div>(a) convection</div>
          <div>(b) conduction</div>
          <div>(c) radiation</div>
          <div>(d) evaporation</div>
        </div>
      </>
    ),
    flags: ['review'],
  },
  {
    id: 'Q-RBSE-0641',
    classLabel: 'Class VIII',
    subject: 'Hindi',
    chapter: 'वसंत — ध्वनि',
    topic: 'काव्य खंड',
    type: 'Long Answer',
    marks: 5,
    difficulty: 3,
    usage: 2,
    status: 'Approved',
    body: (
      <>
        ‘ध्वनि’ कविता में कवि ने प्रकृति के किन दृश्यों का वर्णन किया है? किन शब्दों से
        शांत वातावरण का चित्रण होता है? उदाहरण सहित स्पष्ट कीजिए।
      </>
    ),
    flags: [],
  },
  {
    id: 'Q-RBSE-0518',
    classLabel: 'Class VIII',
    subject: 'Mathematics',
    chapter: 'Algebraic Expressions',
    topic: 'Identities',
    type: 'Short Answer',
    marks: 3,
    difficulty: 3,
    usage: 1,
    status: 'Draft',
    body: (
      <>
        Using the identity{' '}
        <span className="pc-math">(a + b)² = a² + 2ab + b²</span>, find the value of{' '}
        <span className="pc-math">(104)²</span> without multiplying directly.
      </>
    ),
    flags: ['new'],
  },
  {
    id: 'Q-RBSE-0412',
    classLabel: 'Class V',
    subject: 'Mathematics',
    chapter: 'Shapes and Angles',
    topic: 'Types of Angles',
    type: 'Very Short',
    marks: 1,
    difficulty: 1,
    usage: 11,
    status: 'Approved',
    body: (
      <>
        Name the type of angle in each case: (a) angle between the hands of a clock at
        3 o’clock, (b) angle of a fully opened book lying flat.
      </>
    ),
    hindi:
      'प्रत्येक में कोण का प्रकार बताइए: (क) 3 बजे घड़ी की सुइयों के बीच का कोण, (ख) खुली किताब का कोण।',
    flags: ['bilingual'],
  },
]

export const REPOSITORY_INTEL = {
  totalQuestions: 1842,
  matchCount: 186,
  qualityScore: 86,
  duplicateWarnings: 4,
  syllabusCoverage: 74,
  lifecycle: {
    approved: 1420,
    draft: 118,
    inReview: 42,
    archived: 262,
  },
  chapterCoverage: [
    { name: 'Knowing Our Numbers', pct: 88 },
    { name: 'Fractions', pct: 72 },
    { name: 'Nutrition in Plants', pct: 65 },
    { name: 'Algebraic Expressions', pct: 54 },
  ],
}
