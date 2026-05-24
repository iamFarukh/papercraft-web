import type { LucideIcon } from 'lucide-react'

export type CommandResultKind =
  | 'paper'
  | 'question'
  | 'teacher'
  | 'blueprint'
  | 'subject'
  | 'chapter'
  | 'navigation'
  | 'command'
  | 'recent'

export type CommandResultGroup =
  | 'recent'
  | 'commands'
  | 'navigation'
  | 'papers'
  | 'questions'
  | 'blueprints'
  | 'teachers'
  | 'curriculum'

export type CommandResult = {
  id: string
  kind: CommandResultKind
  group: CommandResultGroup
  title: string
  subtitle: string
  badge: string
  href: string
  icon: LucideIcon
  meta?: string
  score?: number
}

export const COMMAND_GROUP_LABELS: Record<CommandResultGroup, string> = {
  recent: 'Recent',
  commands: 'Commands',
  navigation: 'Navigation',
  papers: 'Papers',
  questions: 'Questions',
  blueprints: 'Blueprints',
  teachers: 'Teachers',
  curriculum: 'Curriculum',
}

export const COMMAND_GROUP_ORDER: CommandResultGroup[] = [
  'recent',
  'commands',
  'navigation',
  'papers',
  'questions',
  'blueprints',
  'teachers',
  'curriculum',
]
