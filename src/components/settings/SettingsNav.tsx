import { m } from 'framer-motion'
import {
  Bell,
  Building2,
  CalendarClock,
  FileOutput,
  GraduationCap,
  Layout,
  SlidersHorizontal,
} from 'lucide-react'
import type { SettingsSectionId } from '@/types/workspace-settings'

export type SettingsNavItem = {
  id: SettingsSectionId
  label: string
  description: string
  icon: typeof Building2
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'identity',
    label: 'School Identity',
    description: 'Name, logo, and branding',
    icon: Building2,
  },
  {
    id: 'academic',
    label: 'Academic Defaults',
    description: 'Language, medium, blueprints',
    icon: GraduationCap,
  },
  {
    id: 'paper',
    label: 'Paper Defaults',
    description: 'Typography and layout',
    icon: Layout,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Operational alerts',
    icon: Bell,
  },
  {
    id: 'workspace',
    label: 'Workspace Preferences',
    description: 'Landing page and density',
    icon: SlidersHorizontal,
  },
  {
    id: 'export',
    label: 'Export & Print',
    description: 'PDF and print presets',
    icon: FileOutput,
  },
  {
    id: 'session',
    label: 'Session & Access',
    description: 'Sign-in and timeout',
    icon: CalendarClock,
  },
]

type Props = {
  active: SettingsSectionId
  onSelect: (id: SettingsSectionId) => void
}

export function SettingsNav({ active, onSelect }: Props) {
  return (
    <nav className="pc-settings-nav" aria-label="Settings sections">
      {SETTINGS_NAV.map((item) => {
        const Icon = item.icon
        const isActive = item.id === active
        return (
          <button
            key={item.id}
            type="button"
            className={'pc-settings-nav-item' + (isActive ? ' is-active' : '')}
            onClick={() => onSelect(item.id)}
          >
            {isActive ? (
              <m.span
                className="pc-settings-nav-indicator"
                layoutId="settings-nav-indicator"
                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              />
            ) : null}
            <Icon size={15} strokeWidth={1.6} style={{ position: 'relative', zIndex: 1 }} />
            <span className="pc-settings-nav-text" style={{ position: 'relative', zIndex: 1 }}>
              <span className="pc-settings-nav-label">{item.label}</span>
              <span className="pc-settings-nav-desc">{item.description}</span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
