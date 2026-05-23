/** RBSE V–VIII chapters & topics derived from repository seed */

export type CurriculumTopic = { id: string; name: string }
export type CurriculumChapter = { id: string; name: string; topics: CurriculumTopic[] }
export type CurriculumGroup = {
  classNumber: number
  subjectId: string
  chapters: CurriculumChapter[]
}

export const CURRICULUM_GROUPS: CurriculumGroup[] = [
  {
    "classNumber": 5,
    "subjectId": "hindi",
    "chapters": [
      {
        "id": "rimjhim-bharat",
        "name": "रिमझिम — भारत",
        "topics": [
          {
            "id": "creative-writing",
            "name": "रचनात्मक लेखन"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 5,
    "subjectId": "mathematics",
    "chapters": [
      {
        "id": "knowing-numbers",
        "name": "Knowing Our Numbers",
        "topics": [
          {
            "id": "formation-of-numbers",
            "name": "Formation of Numbers"
          }
        ]
      },
      {
        "id": "perimeter-and-area",
        "name": "Perimeter and Area",
        "topics": [
          {
            "id": "rectangle",
            "name": "Rectangle"
          }
        ]
      },
      {
        "id": "shapes-and-angles",
        "name": "Shapes and Angles",
        "topics": [
          {
            "id": "types-of-angles",
            "name": "Types of Angles"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 6,
    "subjectId": "hindi",
    "chapters": [
      {
        "id": "vyakaran-sangya",
        "name": "व्याकरण — संज्ञा",
        "topics": [
          {
            "id": "sangya-sarvanam",
            "name": "संज्ञा–सर्वनाम"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 6,
    "subjectId": "mathematics",
    "chapters": [
      {
        "id": "fractions",
        "name": "Fractions",
        "topics": [
          {
            "id": "addition",
            "name": "Addition of Fractions"
          },
          {
            "id": "operations",
            "name": "Operations"
          },
          {
            "id": "types-of-fractions",
            "name": "Types of Fractions"
          }
        ]
      },
      {
        "id": "integers",
        "name": "Integers",
        "topics": [
          {
            "id": "ordering",
            "name": "Ordering Integers"
          }
        ]
      },
      {
        "id": "knowing-numbers",
        "name": "Knowing Our Numbers",
        "topics": [
          {
            "id": "estimation",
            "name": "Estimation"
          },
          {
            "id": "units-of-length",
            "name": "Units of Length"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 7,
    "subjectId": "hindi",
    "chapters": [
      {
        "id": "bal-mahabharat",
        "name": "बाल महाभारत — अंश",
        "topics": [
          {
            "id": "comprehension",
            "name": "गद्यांश"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 7,
    "subjectId": "mathematics",
    "chapters": [
      {
        "id": "integers",
        "name": "Integers",
        "topics": [
          {
            "id": "powers",
            "name": "Powers of Integers"
          }
        ]
      },
      {
        "id": "perimeter-and-area",
        "name": "Perimeter and Area",
        "topics": [
          {
            "id": "triangle-area",
            "name": "Area of Triangle"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 7,
    "subjectId": "science",
    "chapters": [
      {
        "id": "fibre-to-fabric",
        "name": "Fibre to Fabric",
        "topics": [
          {
            "id": "natural-fibres",
            "name": "Natural Fibres"
          }
        ]
      },
      {
        "id": "heat",
        "name": "Heat",
        "topics": [
          {
            "id": "temperature",
            "name": "Temperature"
          },
          {
            "id": "temperature-conversion",
            "name": "Temperature Conversion"
          },
          {
            "id": "transfer-of-heat",
            "name": "Transfer of Heat"
          }
        ]
      },
      {
        "id": "nutrition-in-animals",
        "name": "Nutrition in Animals",
        "topics": [
          {
            "id": "digestive-system",
            "name": "Digestive System"
          }
        ]
      },
      {
        "id": "nutrition-in-plants",
        "name": "Nutrition in Plants",
        "topics": [
          {
            "id": "photosynthesis",
            "name": "Photosynthesis"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 8,
    "subjectId": "hindi",
    "chapters": [
      {
        "id": "vasant-agla-bhag",
        "name": "वसंत — अगला भाग",
        "topics": [
          {
            "id": "patra-lekhan",
            "name": "पत्र–लेखन"
          }
        ]
      },
      {
        "id": "vasant-dhvani",
        "name": "वसंत — ध्वनि",
        "topics": [
          {
            "id": "kavya-khand",
            "name": "काव्य खंड"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 8,
    "subjectId": "mathematics",
    "chapters": [
      {
        "id": "algebraic-expressions",
        "name": "Algebraic Expressions",
        "topics": [
          {
            "id": "factorisation",
            "name": "Factorisation"
          },
          {
            "id": "identities",
            "name": "Identities"
          }
        ]
      },
      {
        "id": "linear-equations",
        "name": "Linear Equations in One Variable",
        "topics": [
          {
            "id": "solving-equations",
            "name": "Solving Equations"
          }
        ]
      },
      {
        "id": "rational-numbers",
        "name": "Rational Numbers",
        "topics": [
          {
            "id": "operations",
            "name": "Operations"
          }
        ]
      }
    ]
  },
  {
    "classNumber": 8,
    "subjectId": "science",
    "chapters": [
      {
        "id": "chemical-effects",
        "name": "Chemical Effects of Electric Current",
        "topics": [
          {
            "id": "acids-bases",
            "name": "Acids and Bases"
          }
        ]
      },
      {
        "id": "chemical-reactions",
        "name": "Chemical Reactions and Equations",
        "topics": [
          {
            "id": "reaction-types",
            "name": "Types of Reactions"
          }
        ]
      },
      {
        "id": "reproduction-in-plants",
        "name": "Reproduction in Plants",
        "topics": [
          {
            "id": "pollination",
            "name": "Pollination"
          }
        ]
      }
    ]
  }
]

export const CLASS_NUMBERS = [5, 6, 7, 8] as const

export const SUBJECT_IDS = ['mathematics', 'science', 'hindi'] as const

export function curriculumFor(classNumber: number, subjectId: string): CurriculumGroup | undefined {
  return CURRICULUM_GROUPS.find(
    (g) => g.classNumber === classNumber && g.subjectId === subjectId,
  )
}

export function chapterById(
  classNumber: number,
  subjectId: string,
  chapterId: string,
): CurriculumChapter | undefined {
  return curriculumFor(classNumber, subjectId)?.chapters.find((c) => c.id === chapterId)
}
