export type MetricTrend = 'up' | 'down' | 'neutral'

export type MetricData = {
  label: string
  value: string
  unit?: string
  hint: string
  trend: MetricTrend
  trendLabel: string
  sparkColor: string
  sparkPoints: number[]
}

export const METRICS: MetricData[] = [
  {
    label: 'Total Questions',
    value: '3,412',
    hint: 'Mathematics · Class X–XII',
    trend: 'up',
    trendLabel: '↑ 42 this week',
    sparkColor: 'var(--pc-primary)',
    sparkPoints: [3180, 3220, 3260, 3290, 3320, 3355, 3380, 3395, 3405, 3412],
  },
  {
    label: 'Pending Approvals',
    value: '7',
    hint: '3 high priority · Class X & XII',
    trend: 'neutral',
    trendLabel: '2 submitted today',
    sparkColor: 'var(--pc-warning)',
    sparkPoints: [4, 5, 4, 6, 5, 7, 6, 8, 7, 7],
  },
  {
    label: 'Active Teachers',
    value: '42',
    unit: '/ 48',
    hint: '6 inactive this week',
    trend: 'up',
    trendLabel: '↑ 2 since Monday',
    sparkColor: 'var(--pc-ink-3)',
    sparkPoints: [38, 39, 40, 40, 41, 41, 42, 42, 42, 42],
  },
  {
    label: 'Syllabus Coverage',
    value: '78',
    unit: '%',
    hint: 'Mathematics · Term II blueprint',
    trend: 'up',
    trendLabel: '↑ 4% vs Term I',
    sparkColor: 'var(--pc-success)',
    sparkPoints: [62, 65, 68, 70, 72, 74, 75, 76, 77, 78],
  },
]

export type PipelineStage = {
  key: string
  name: string
  count: number
  meta: string
  accent: string
  papers: { title: string; detail: string; initials: string; avatar: string }[]
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    key: 'draft',
    name: 'Draft',
    count: 14,
    meta: '6 subjects · avg 1.8d in stage',
    accent: 'var(--pc-ink-5)',
    papers: [
      {
        title: 'Mathematics · Class X · Half-Yearly',
        detail: 'Set A · 80 marks',
        initials: 'PN',
        avatar: 'is-rose',
      },
      {
        title: 'Science · Class VIII · Unit Test',
        detail: 'Set 1 · 40 marks',
        initials: 'RV',
        avatar: 'is-teal',
      },
    ],
  },
  {
    key: 'submitted',
    name: 'Submitted',
    count: 7,
    meta: '3 need review today',
    accent: 'var(--pc-primary)',
    papers: [
      {
        title: 'Mathematics · Class XII · Pre-Board',
        detail: 'Submitted · 2h ago',
        initials: 'PN',
        avatar: 'is-rose',
      },
      {
        title: 'Physics · Class XI · Mid-Term',
        detail: 'Submitted · 4h ago',
        initials: 'SI',
        avatar: 'is-violet',
      },
    ],
  },
  {
    key: 'review',
    name: 'Review',
    count: 4,
    meta: '2 revisions open',
    accent: 'var(--pc-warning)',
    papers: [
      {
        title: 'Chemistry · Class XII · Pre-Board',
        detail: 'Under review · Set B',
        initials: 'AK',
        avatar: 'is-blue',
      },
      {
        title: 'Hindi · Class X · Half-Yearly',
        detail: 'Revisions requested',
        initials: 'AK',
        avatar: 'is-blue',
      },
    ],
  },
  {
    key: 'approved',
    name: 'Approved',
    count: 9,
    meta: 'Ready to lock · 5 this week',
    accent: 'var(--pc-success)',
    papers: [
      {
        title: 'Mathematics · Class IX · Half-Yearly',
        detail: 'Approved · yesterday',
        initials: 'AK',
        avatar: 'is-blue',
      },
    ],
  },
  {
    key: 'locked',
    name: 'Locked',
    count: 32,
    meta: 'Term II · exported & printed',
    accent: 'var(--pc-ink-2)',
    papers: [
      {
        title: 'Mathematics · Class X · Mid-Term',
        detail: 'Locked · printed 12 Oct',
        initials: 'AK',
        avatar: 'is-blue',
      },
    ],
  },
]

export type ActivityItem = {
  id: string
  avatar: string
  avatarClass: string
  name: string
  action: string
  target: string
  time: string
  meta?: string
  tag?: string
  tagTone?: '' | 'is-primary' | 'is-success' | 'is-warning' | 'is-danger' | 'is-ink'
}

export const ACTIVITY_ITEMS: ActivityItem[] = [
  {
    id: '1',
    avatar: 'PN',
    avatarClass: 'is-rose',
    name: 'Priya Nair',
    action: 'submitted',
    target: 'Class XII · Pre-Board · Set A',
    time: '11 minutes ago',
    meta: 'Mathematics · 80 marks',
    tag: 'awaiting review',
    tagTone: 'is-primary',
  },
  {
    id: '2',
    avatar: 'SI',
    avatarClass: 'is-violet',
    name: 'Sahil Iyer',
    action: 'uploaded 18 questions to',
    target: 'Quadratic Equations · Class X',
    time: '42 minutes ago',
    meta: 'Question bank · bulk import',
    tag: 'upload',
    tagTone: '',
  },
  {
    id: '3',
    avatar: 'AK',
    avatarClass: 'is-blue',
    name: 'Aarav Kapoor',
    action: 'approved',
    target: 'Mathematics · Class IX · Half-Yearly',
    time: '2 hours ago',
    meta: 'Examination office',
    tag: 'approved',
    tagTone: 'is-success',
  },
  {
    id: '4',
    avatar: 'MD',
    avatarClass: 'is-amber',
    name: 'Meera Das',
    action: 'requested revisions on',
    target: 'English · Class IX · Half-Yearly',
    time: '3 hours ago',
    meta: '2 sections flagged',
    tag: 'revisions',
    tagTone: 'is-warning',
  },
  {
    id: '5',
    avatar: 'RV',
    avatarClass: 'is-teal',
    name: 'Rohan Verma',
    action: 'locked',
    target: 'Class X · Mid-Term · Mathematics',
    time: 'Yesterday · 4:18 pm',
    meta: 'Exported to print queue',
    tag: 'locked',
    tagTone: 'is-ink',
  },
  {
    id: '6',
    avatar: 'AK',
    avatarClass: 'is-blue',
    name: 'Aarav Kapoor',
    action: 'updated curriculum map for',
    target: 'Statistics · Class X',
    time: 'Yesterday · 11:02 am',
    meta: '4 new topics · Term II',
    tag: 'curriculum',
    tagTone: 'is-primary',
  },
  {
    id: '7',
    avatar: 'PN',
    avatarClass: 'is-rose',
    name: 'Priya Nair',
    action: 'revised',
    target: 'Trigonometry · Q-1042',
    time: '2 days ago',
    meta: 'Duplicate review resolved',
    tag: 'revision',
    tagTone: 'is-warning',
  },
]
