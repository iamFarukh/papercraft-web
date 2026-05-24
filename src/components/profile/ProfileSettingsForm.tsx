import { ProfileCard } from '@/components/profile/ProfileCard'
import { ProfileRow } from '@/components/profile/ProfileRow'
import { PAPER_MEDIUM_OPTIONS } from '@/lib/paper-medium'
import type { ProfileDraft } from '@/hooks/useProfileEditor'
import type { ProfileSettings } from '@/types/profile-settings'
import type { UserRole } from '@/services/firebase/users'

type Props = {
  role: UserRole
  draft: ProfileDraft
  onDisplayName: (value: string) => void
  onSettings: (patch: Partial<ProfileSettings>) => void
}

const LANGUAGE_OPTIONS = [
  { id: 'en' as const, label: 'English' },
  { id: 'hi' as const, label: 'Hindi' },
]

const PAPER_STYLE_OPTIONS = [
  { id: 'compact' as const, label: 'Compact' },
  { id: 'standard' as const, label: 'Standard' },
  { id: 'spacious' as const, label: 'Spacious' },
]

const AUTHORING_OPTIONS = [
  { id: 'structured' as const, label: 'Structured sections' },
  { id: 'flexible' as const, label: 'Flexible layout' },
]

const BLUEPRINT_PRESETS = [
  'Term examination',
  'Unit test',
  'Annual assessment',
]

export function ProfileSettingsForm({
  role,
  draft,
  onDisplayName,
  onSettings,
}: Props) {
  const isTeacher = role === 'teacher'
  const { settings } = draft

  function toggleSubject(subject: string) {
    const set = new Set(settings.preferredSubjects)
    if (set.has(subject)) set.delete(subject)
    else set.add(subject)
    onSettings({ preferredSubjects: [...set] })
  }

  function toggleBlueprintPreset(preset: string) {
    const set = new Set(settings.preferredBlueprintPresets)
    if (set.has(preset)) set.delete(preset)
    else set.add(preset)
    onSettings({ preferredBlueprintPresets: [...set] })
  }

  const subjectOptions = [
    'Mathematics',
    'Science',
    'English',
    'Hindi',
    'Social Studies',
  ]

  return (
    <>
      <ProfileCard
        title="Account details"
        subtitle="How you appear to colleagues in approvals and comments."
      >
        <div className="pc-profile-rows">
          <ProfileRow label="Display name" hint="Shown across the workspace.">
            <input
              className="pc-profile-input"
              type="text"
              value={draft.displayName}
              onChange={(e) => onDisplayName(e.target.value)}
              autoComplete="name"
            />
          </ProfileRow>
          <ProfileRow label="Phone" hint="Optional contact number.">
            <input
              className="pc-profile-input"
              type="tel"
              value={settings.phone}
              onChange={(e) => onSettings({ phone: e.target.value })}
              placeholder="+91 …"
              autoComplete="tel"
            />
          </ProfileRow>
          <ProfileRow label="Designation" hint="Your formal title within the school.">
            <input
              className="pc-profile-input"
              type="text"
              value={settings.designation}
              onChange={(e) => onSettings({ designation: e.target.value })}
              placeholder={
                isTeacher ? 'e.g. PGT Mathematics' : 'e.g. Vice Principal'
              }
            />
          </ProfileRow>
          <ProfileRow label="About" hint="A short note for colleagues and approvers.">
            <textarea
              className="pc-profile-input"
              rows={3}
              value={settings.bio}
              onChange={(e) => onSettings({ bio: e.target.value })}
            />
          </ProfileRow>
        </div>
      </ProfileCard>

      <ProfileCard title="Preferences" subtitle="Language and examination defaults.">
        <div className="pc-profile-rows">
          <ProfileRow label="Preferred language">
            <select
              className="pc-profile-input"
              value={settings.preferredLanguage}
              onChange={(e) =>
                onSettings({
                  preferredLanguage: e.target.value === 'hi' ? 'hi' : 'en',
                })
              }
            >
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </ProfileRow>
          <ProfileRow label="Default medium">
            <select
              className="pc-profile-input"
              value={settings.defaultMedium}
              onChange={(e) =>
                onSettings({
                  defaultMedium:
                    e.target.value === 'hindi'
                      ? 'hindi'
                      : e.target.value === 'bilingual'
                        ? 'bilingual'
                        : 'english',
                })
              }
            >
              {PAPER_MEDIUM_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </ProfileRow>
        </div>
      </ProfileCard>

      {isTeacher ? (
        <ProfileCard
          title="Academic preferences"
          subtitle="Defaults applied when you open the paper builder and repository."
        >

          <fieldset className="pc-profile-fieldset">
            <legend>Preferred subjects</legend>
            <div className="pc-profile-toggle-group">
              {subjectOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={
                    'pc-profile-toggle' +
                    (settings.preferredSubjects.includes(s) ? ' is-on' : '')
                  }
                  onClick={() => toggleSubject(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="pc-profile-fieldset">
            <legend>Blueprint presets</legend>
            <div className="pc-profile-toggle-group">
              {BLUEPRINT_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    'pc-profile-toggle' +
                    (settings.preferredBlueprintPresets.includes(p)
                      ? ' is-on'
                      : '')
                  }
                  onClick={() => toggleBlueprintPreset(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="pc-profile-field-grid">
            <label className="pc-profile-field">
              <span>Default paper style</span>
              <select
                className="pc-profile-input"
                value={settings.defaultPaperStyle}
                onChange={(e) =>
                  onSettings({
                    defaultPaperStyle:
                      e.target.value === 'compact'
                        ? 'compact'
                        : e.target.value === 'spacious'
                          ? 'spacious'
                          : 'standard',
                  })
                }
              >
                {PAPER_STYLE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="pc-profile-field">
              <span>Question authoring</span>
              <select
                className="pc-profile-input"
                value={settings.questionAuthoringPreference}
                onChange={(e) =>
                  onSettings({
                    questionAuthoringPreference:
                      e.target.value === 'flexible' ? 'flexible' : 'structured',
                  })
                }
              >
                {AUTHORING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </ProfileCard>
      ) : (
        <ProfileCard
          title="Institutional controls"
          subtitle="Visibility preferences for your administrator workspace."
        >
          <label className="pc-profile-check">
            <input
              type="checkbox"
              checked={settings.workspaceRoleVisibility}
              onChange={(e) =>
                onSettings({ workspaceRoleVisibility: e.target.checked })
              }
            />
            <span>Show role labels in team views</span>
          </label>
          <label className="pc-profile-check">
            <input
              type="checkbox"
              checked={settings.institutionalControls}
              onChange={(e) =>
                onSettings({ institutionalControls: e.target.checked })
              }
            />
            <span>Highlight institutional policy reminders</span>
          </label>
        </ProfileCard>
      )}
    </>
  )
}
