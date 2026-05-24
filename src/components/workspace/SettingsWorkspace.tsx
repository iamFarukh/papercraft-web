import { AnimatePresence, m } from 'framer-motion'
import { useState } from 'react'
import { FadeIn } from '@/components/motion/FadeIn'
import { InlineSaveStatus } from '@/components/settings/InlineSaveStatus'
import { SchoolHeaderPreview } from '@/components/settings/SchoolHeaderPreview'
import { SettingsNav } from '@/components/settings/SettingsNav'
import {
  AcademicDefaultsSection,
  ExportPrintSection,
  NotificationSettingsSection,
  PaperDefaultsSection,
  SchoolIdentitySection,
  SessionAccessSection,
  WorkspacePreferencesSection,
} from '@/components/settings/SettingsSections'
import { useWorkspaceSettings } from '@/context/WorkspaceSettingsContext'
import { useWorkspaceSettingsEditor } from '@/hooks/useWorkspaceSettingsEditor'
import { PC_TRANSITION } from '@/lib/motion/tokens'
import type { SettingsSectionId } from '@/types/workspace-settings'

const SECTION_TITLES: Record<SettingsSectionId, string> = {
  identity: 'School Identity',
  academic: 'Academic Defaults',
  paper: 'Paper Defaults',
  notifications: 'Notifications',
  workspace: 'Workspace Preferences',
  export: 'Export & Print',
  session: 'Session & Access',
}

const PREVIEW_SECTIONS: SettingsSectionId[] = ['identity', 'paper', 'export']

export function SettingsWorkspace() {
  const { settings, ready } = useWorkspaceSettings()
  const { draft, patchSettings, saveState, saveError, savedAt } =
    useWorkspaceSettingsEditor(ready ? settings : null)
  const [section, setSection] = useState<SettingsSectionId>('identity')

  const savingLabel =
    section === 'identity'
      ? 'Updating workspace identity…'
      : 'Saving…'

  const showPreview = PREVIEW_SECTIONS.includes(section)

  function renderSection() {
    if (!draft) return null
    const props = { draft, onPatch: patchSettings }
    switch (section) {
      case 'identity':
        return <SchoolIdentitySection {...props} />
      case 'academic':
        return <AcademicDefaultsSection {...props} />
      case 'paper':
        return <PaperDefaultsSection {...props} />
      case 'notifications':
        return <NotificationSettingsSection {...props} />
      case 'workspace':
        return <WorkspacePreferencesSection {...props} />
      case 'export':
        return <ExportPrintSection {...props} />
      case 'session':
        return <SessionAccessSection {...props} />
      default:
        return null
    }
  }

  return (
    <main className="pc-settings-workspace pc-scroll">
      <FadeIn>
        <header className="pc-settings-head">
          <div>
            <p className="pc-settings-kicker">Organization</p>
            <h1 className="pc-settings-title pc-serif">Workspace settings</h1>
            <p className="pc-settings-lead">
              Configure your school&apos;s academic workspace — branding, defaults,
              and operational preferences.
            </p>
          </div>
          <InlineSaveStatus
            state={saveState}
            savedAt={savedAt}
            error={saveError}
            savingLabel={savingLabel}
          />
        </header>
      </FadeIn>

      <div
        className={
          'pc-settings-layout' + (showPreview ? ' has-preview' : ' no-preview')
        }
      >
        <SettingsNav active={section} onSelect={setSection} />

        <div className="pc-settings-center">
          <m.div
            className="pc-settings-panel"
            key={section}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={PC_TRANSITION.panel}
          >
            <h2 className="pc-settings-panel-title pc-serif">
              {SECTION_TITLES[section]}
            </h2>
            <AnimatePresence mode="wait">
              <m.div
                key={section + (draft ? 'ready' : 'load')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={PC_TRANSITION.fade}
              >
                {draft ? renderSection() : (
                  <div className="pc-settings-loading" aria-busy />
                )}
              </m.div>
            </AnimatePresence>
          </m.div>
        </div>

        {showPreview && draft ? (
          <SchoolHeaderPreview identity={draft.identity} />
        ) : showPreview ? (
          <div className="pc-settings-preview pc-settings-preview--empty" />
        ) : null}
      </div>
    </main>
  )
}
