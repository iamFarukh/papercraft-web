import {
  Archive,
  BookOpen,
  FileText,
  GraduationCap,
  History,
  Layers,
  Target,
  Users,
} from 'lucide-react'
import {
  buildStaticCommandResults,
  matchStaticResults,
  pinnedCommands,
} from '@/lib/command-center/registry'
import { loadCommandRecents, rememberCommandVisit } from '@/lib/command-center/recents'
import { listBlueprints } from '@/services/firebase/blueprints'
import { listClasses, listChapters, listSubjectsForClass } from '@/services/firebase/curriculum'
import { listRecentPapers } from '@/services/firebase/papers'
import { getQuestions } from '@/services/firebase/questions'
import { listTeachers } from '@/services/firebase/teachers'
import type { CommandResult } from '@/types/command-center'
import { COMMAND_GROUP_ORDER } from '@/types/command-center'

export { rememberCommandVisit }

type SearchOpts = {
  query: string
  isAdmin: boolean
  userId: string
}

function includes(hay: string, q: string): boolean {
  return hay.toLowerCase().includes(q)
}

function scoreMatch(text: string, q: string): number {
  const t = text.toLowerCase()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 50
  return 0
}

export async function searchCommandCenter(opts: SearchOpts): Promise<CommandResult[]> {
  const q = opts.query.trim().toLowerCase()
  const staticAll = buildStaticCommandResults({ isAdmin: opts.isAdmin })

  if (!q) {
    const recents = hydrateRecents(loadCommandRecents(), staticAll)
    const pinned = pinnedCommands(staticAll).filter(
      (p) => !recents.some((r) => r.href === p.href),
    )
    return [...recents, ...pinned, ...staticAll.slice(0, 6)]
  }

  const results: CommandResult[] = []
  results.push(...matchStaticResults(staticAll, q))

  const [papers, questions, blueprints, teachers, curriculum] = await Promise.all([
    searchPapers(opts, q),
    searchQuestions(opts, q),
    searchBlueprints(q),
    opts.isAdmin ? searchTeachers(q) : Promise.resolve([]),
    searchCurriculum(q),
  ])

  results.push(...papers, ...questions, ...blueprints, ...teachers, ...curriculum)

  const deduped = dedupeById(results)
  deduped.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
  return deduped.slice(0, 40)
}

function hydrateRecents(
  stored: import('@/lib/command-center/recents').StoredCommandRecent[],
  staticAll: CommandResult[],
): CommandResult[] {
  return stored.map((s) => {
    const match = staticAll.find((x) => x.href === s.href)
    return {
      ...s,
      group: 'recent',
      kind: 'recent',
      icon: match?.icon ?? History,
    }
  })
}

async function searchPapers(opts: SearchOpts, q: string): Promise<CommandResult[]> {
  try {
    const rows = await listRecentPapers({
      userId: opts.userId,
      isAdmin: opts.isAdmin,
      max: 40,
    })
    return rows
      .filter((p) =>
        includes(`${p.title} ${p.subject} ${p.classLabel} ${p.examType} ${p.status}`, q),
      )
      .map((p) => ({
        id: `paper-${p.id}`,
        kind: 'paper' as const,
        group: 'papers' as const,
        title: p.title,
        subtitle: `Paper · ${p.classLabel} · ${p.subject}`,
        badge: p.status.charAt(0).toUpperCase() + p.status.slice(1),
        href: `/app/builder/${p.id}`,
        icon: FileText,
        meta: p.examType,
        score: scoreMatch(p.title, q),
      }))
  } catch {
    return []
  }
}

async function searchQuestions(opts: SearchOpts, q: string): Promise<CommandResult[]> {
  try {
    const page = await getQuestions({
      filters: {
        classNumbers: [],
        subjectIds: [],
        chapterIds: [],
        difficulties: [],
        types: [],
        statuses: opts.isAdmin ? [] : ['published'],
      },
      isAdmin: opts.isAdmin,
      pageSize: 60,
    })
    return page.items
      .filter(({ data }) => {
        const text = data.questionText ?? ''
        return includes(
          `${text} ${data.chapterName} ${data.topicName} Class ${data.classNumber}`,
          q,
        )
      })
      .slice(0, 12)
      .map(({ id, data }) => {
        const preview = (data.questionText ?? 'Question')
          .replace(/<[^>]+>/g, '')
          .slice(0, 72)
        return {
          id: `question-${id}`,
          kind: 'question' as const,
          group: 'questions' as const,
          title: preview || 'Question',
          subtitle: `Question · Class ${data.classNumber} · ${data.chapterName}`,
          badge: 'Repository',
          href: opts.isAdmin ? `/app/repository/${id}/edit` : `/app/repository`,
          icon: Archive,
          score: scoreMatch(preview, q),
        }
      })
  } catch {
    return []
  }
}

async function searchBlueprints(q: string): Promise<CommandResult[]> {
  try {
    const rows = await listBlueprints()
    return rows
      .filter((b) =>
        includes(`${b.name} ${b.examType} ${b.recommendedSubjects.join(' ')}`, q),
      )
      .slice(0, 10)
      .map((b) => ({
        id: `blueprint-${b.id}`,
        kind: 'blueprint' as const,
        group: 'blueprints' as const,
        title: b.name,
        subtitle: `Blueprint · ${b.examType} · ${b.totalMarks} marks`,
        badge: b.isSystem ? 'System' : 'Custom',
        href: `/app/blueprints/${b.id}`,
        icon: Target,
        score: scoreMatch(b.name, q),
      }))
  } catch {
    return []
  }
}

async function searchTeachers(q: string): Promise<CommandResult[]> {
  try {
    const rows = await listTeachers()
    return rows
      .filter((t) => includes(`${t.displayName} ${t.email}`, q))
      .slice(0, 8)
      .map((t) => ({
        id: `teacher-${t.id}`,
        kind: 'teacher' as const,
        group: 'teachers' as const,
        title: t.displayName,
        subtitle: `Teacher · ${t.email}`,
        badge: t.active ? 'Active' : 'Inactive',
        href: '/app/teachers',
        icon: Users,
        score: scoreMatch(t.displayName, q),
      }))
  } catch {
    return []
  }
}

function classNumberFromLabel(label: string): number | null {
  const m = label.match(/(\d+)/)
  return m ? Number.parseInt(m[1], 10) : null
}

async function searchCurriculum(q: string): Promise<CommandResult[]> {
  const out: CommandResult[] = []
  try {
    const classes = await listClasses()
    for (const c of classes) {
      const classNumber = classNumberFromLabel(c.label)
      if (includes(c.label, q)) {
        out.push({
          id: `class-${c.id}`,
          kind: 'subject',
          group: 'curriculum',
          title: c.label,
          subtitle: 'Class · Curriculum',
          badge: 'Class',
          href: `/app/curriculum?class=${c.id}`,
          icon: GraduationCap,
          score: scoreMatch(c.label, q),
        })
      }
      if (classNumber === null) continue
      const subjects = await listSubjectsForClass(classNumber)
      for (const s of subjects) {
        if (!includes(`${s.label} ${c.label}`, q)) continue
        out.push({
          id: `subject-${c.id}-${s.id}`,
          kind: 'subject',
          group: 'curriculum',
          title: s.label,
          subtitle: `Subject · ${c.label}`,
          badge: 'Subject',
          href: `/app/curriculum?class=${c.id}&subject=${s.id}`,
          icon: BookOpen,
          score: scoreMatch(s.label, q),
        })
        const chapters = await listChapters(classNumber, s.id)
        for (const ch of chapters) {
          if (!includes(`${ch.label} ${s.label}`, q)) continue
          out.push({
            id: `chapter-${ch.id}`,
            kind: 'chapter',
            group: 'curriculum',
            title: ch.label,
            subtitle: `Chapter · ${s.label} · ${c.label}`,
            badge: 'Chapter',
            href: `/app/curriculum?class=${c.id}&subject=${s.id}&chapter=${ch.id}`,
            icon: Layers,
            score: scoreMatch(ch.label, q),
          })
        }
      }
    }
  } catch {
    // ignore
  }
  return out.slice(0, 12)
}

function dedupeById(items: CommandResult[]): CommandResult[] {
  const seen = new Set<string>()
  const out: CommandResult[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
  }
  return out
}

export function groupCommandResults(items: CommandResult[]): Map<string, CommandResult[]> {
  const map = new Map<string, CommandResult[]>()
  for (const group of COMMAND_GROUP_ORDER) {
    const rows = items.filter((i) => i.group === group)
    if (rows.length > 0) map.set(group, rows)
  }
  const other = items.filter((i) => !COMMAND_GROUP_ORDER.includes(i.group))
  if (other.length > 0) map.set('other', other)
  return map
}
