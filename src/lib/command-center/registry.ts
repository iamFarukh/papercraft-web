import {
  Archive,
  Bookmark,
  Check,
  FileText,
  Home,
  Layers,
  Pencil,
  Plus,
  Settings,
  Sparkles,
  Target,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { NAV_ROUTES } from '@/config/nav-routes'
import type { CommandResult } from '@/types/command-center'

type RegistryOpts = {
  isAdmin: boolean
}

function nav(
  id: string,
  title: string,
  subtitle: string,
  href: string,
  icon: LucideIcon,
): CommandResult {
  return {
    id: `nav-${id}`,
    kind: 'navigation',
    group: 'navigation',
    title,
    subtitle,
    badge: 'Go to',
    href,
    icon,
  }
}

function cmd(
  id: string,
  title: string,
  subtitle: string,
  href: string,
  icon: LucideIcon,
): CommandResult {
  return {
    id: `cmd-${id}`,
    kind: 'command',
    group: 'commands',
    title,
    subtitle,
    badge: 'Action',
    href,
    icon,
  }
}

export function buildStaticCommandResults(opts: RegistryOpts): CommandResult[] {
  const { isAdmin } = opts
  const navigation: CommandResult[] = [
    nav('home', 'Control Center', 'Overview and activity', NAV_ROUTES.home, Home),
    nav('repo', 'Question Repository', 'Browse and author questions', NAV_ROUTES.repo, Archive),
    nav('papers', 'Paper Library', 'Recent examination papers', NAV_ROUTES.papers, FileText),
    nav('builder', 'Paper Builder', 'Compose examination papers', NAV_ROUTES.builder, Pencil),
    nav('bookmarks', 'Bookmarks', 'Saved questions', NAV_ROUTES.bookmarks, Bookmark),
    nav('curriculum', 'Curriculum', 'Classes, subjects, chapters', NAV_ROUTES.curriculum, Layers),
    nav('blueprint', 'Blueprints', 'Examination structures', NAV_ROUTES.blueprint, Target),
    nav('profile', 'My Profile', 'Account and preferences', NAV_ROUTES.profile, User),
  ]

  if (isAdmin) {
    navigation.push(
      nav('approval', 'Approvals', 'Review submitted papers', NAV_ROUTES.approval, Check),
      nav('teachers', 'Teachers', 'Faculty and assignments', NAV_ROUTES.teachers, Users),
      nav('settings', 'Workspace settings', 'School identity and defaults', NAV_ROUTES.settings, Settings),
    )
  }

  const commands: CommandResult[] = [
    cmd('create-paper', 'Create paper', 'Start a new examination paper', '/app/builder/new', Plus),
    cmd('open-repo', 'Open repository', 'Question bank', NAV_ROUTES.repo, Archive),
    cmd(
      'generate-blueprint',
      'Generate from blueprint',
      'Browse blueprint presets',
      NAV_ROUTES.blueprint,
      Sparkles,
    ),
    cmd('open-profile', 'Open profile', 'Your account workspace', NAV_ROUTES.profile, User),
  ]

  if (isAdmin) {
    commands.push(
      cmd('open-approvals', 'Open approvals', 'Review submission queue', NAV_ROUTES.approval, Check),
      cmd('create-blueprint', 'Create blueprint', 'New examination structure', '/app/blueprints/new', Plus),
      cmd('open-settings', 'Open settings', 'School workspace configuration', NAV_ROUTES.settings, Settings),
      cmd('new-question', 'New question', 'Compose in repository', '/app/repository/new', Pencil),
    )
  }

  return [...commands, ...navigation]
}

export const PINNED_COMMAND_IDS = [
  'cmd-create-paper',
  'cmd-open-repo',
  'cmd-generate-blueprint',
  'cmd-open-approvals',
] as const

export function pinnedCommands(all: CommandResult[]): CommandResult[] {
  return PINNED_COMMAND_IDS.map((id) => all.find((c) => c.id === id)).filter(
    (c): c is CommandResult => Boolean(c),
  )
}

export function matchStaticResults(
  items: CommandResult[],
  query: string,
): CommandResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => {
    const hay = `${item.title} ${item.subtitle} ${item.badge}`.toLowerCase()
    return hay.includes(q)
  })
}
