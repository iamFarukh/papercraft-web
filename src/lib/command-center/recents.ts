import type { CommandResult } from '@/types/command-center'

const STORAGE_KEY = 'pc-command-recents'
const MAX_RECENTS = 8

type StoredRecent = {
  id: string
  kind: string
  group: string
  title: string
  subtitle: string
  badge: string
  href: string
  visitedAt: number
}

export type StoredCommandRecent = Omit<CommandResult, 'icon' | 'group'>

export function loadCommandRecents(): StoredCommandRecent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredRecent[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .sort((a, b) => b.visitedAt - a.visitedAt)
      .slice(0, MAX_RECENTS)
      .map((r) => ({
        id: r.id,
        kind: r.kind as CommandResult['kind'],
        title: r.title,
        subtitle: r.subtitle,
        badge: r.badge,
        href: r.href,
        meta: undefined,
      }))
  } catch {
    return []
  }
}

export function rememberCommandVisit(item: CommandResult): void {
  try {
    const existing = loadStored()
    const next: StoredRecent[] = [
      {
        id: item.id,
        kind: item.kind,
        group: item.group,
        title: item.title,
        subtitle: item.subtitle,
        badge: item.badge,
        href: item.href,
        visitedAt: Date.now(),
      },
      ...existing.filter((e) => e.id !== item.id),
    ].slice(0, MAX_RECENTS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota errors
  }
}

function loadStored(): StoredRecent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredRecent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
