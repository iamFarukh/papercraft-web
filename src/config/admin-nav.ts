import type { LucideIcon } from 'lucide-react'
import {
  Archive,
  BarChart3,
  Check,
  FileText,
  History,
  Home,
  Layers,
  Pencil,
  Target,
  Users,
} from 'lucide-react'

export type NavItem = {
  key: string
  label: string
  icon: LucideIcon
  badge?: string
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
      { key: 'feed', label: 'Activity Feed', icon: History, badge: '12' },
    ],
  },
  {
    section: 'Academic',
    items: [
      { key: 'repo', label: 'Question Repository', icon: Archive, badge: '3.4k' },
      { key: 'curriculum', label: 'Curriculum', icon: Layers },
      { key: 'blueprint', label: 'Blueprints', icon: Target },
    ],
  },
  {
    section: 'Papers',
    items: [
      { key: 'papers', label: 'Paper Library', icon: FileText },
      { key: 'builder', label: 'Paper Builder', icon: Pencil },
      { key: 'approval', label: 'Approvals', icon: Check, badge: '7' },
    ],
  },
  {
    section: 'Organization',
    items: [
      { key: 'teachers', label: 'Teachers', icon: Users },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
]
