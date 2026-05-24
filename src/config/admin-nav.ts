import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BarChart3,
  Bookmark,
  Check,
  FileText,
  History,
  Home,
  Layers,
  Pencil,
  Target,
  Settings,
  Users,
} from 'lucide-react'

export type NavItem = {
  key: string
  label: string
  icon: LucideIcon
  badge?: string
  disabled?: boolean
}

export type NavGroup = {
  section: string | null
  items: NavItem[]
}

export const ADMIN_NAV: NavGroup[] = [
  {
    section: null,
    items: [
      { key: 'home', label: 'Control Center', icon: Home },
      { key: 'feed', label: 'Activity Feed', icon: History, badge: '12', disabled: true },
    ],
  },
  {
    section: 'Academic',
    items: [
      { key: 'repo', label: 'Question Repository', icon: Archive, badge: 'dynamic' },
      { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
      { key: 'curriculum', label: 'Curriculum', icon: Layers },
      { key: 'blueprint', label: 'Blueprints', icon: Target },
    ],
  },
  {
    section: 'Papers',
    items: [
      { key: 'papers', label: 'Paper Library', icon: FileText },
      { key: 'builder', label: 'Paper Builder', icon: Pencil },
      { key: 'approval', label: 'Approvals', icon: Check, badge: 'approvals' },
    ],
  },
  {
    section: 'Organization',
    items: [
      { key: 'teachers', label: 'Teachers', icon: Users },
      { key: 'settings', label: 'Workspace settings', icon: Settings },
      { key: 'analytics', label: 'Analytics', icon: BarChart3, disabled: true },
    ],
  },
]

