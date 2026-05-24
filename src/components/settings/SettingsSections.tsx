import { Camera, Trash2 } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { PAPER_MEDIUM_OPTIONS } from '@/lib/paper-medium'
import { MARGIN_PRESETS } from '@/lib/paper-format-config'
import { INSTITUTION } from '@/lib/institution'
import { NAV_ROUTES } from '@/config/nav-routes'
import {
  removeSchoolLogo,
  uploadSchoolLogo,
} from '@/services/firebase/workspace-settings'
import type { WorkspaceSettings } from '@/types/workspace-settings'
import { useAuth } from '@/context/AuthContext'

type SectionProps = {
  draft: WorkspaceSettings
  onPatch: (patch: Partial<WorkspaceSettings>) => void
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="pc-settings-field-grid">{children}</div>
}

function Field({
  label,
  children,
  span,
}: {
  label: string
  children: ReactNode
  span?: boolean
}) {
  return (
    <label className={'pc-settings-field' + (span ? ' is-span' : '')}>
      <span>{label}</span>
      {children}
    </label>
  )
}

export function SchoolIdentitySection({ draft, onPatch }: SectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [logoBusy, setLogoBusy] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const id = draft.identity

  function patchIdentity(patch: Partial<typeof id>) {
    onPatch({ identity: { ...id, ...patch } })
  }

  async function onLogoFile(file: File | undefined) {
    if (!file) return
    setLogoBusy(true)
    setLogoError(null)
    try {
      const url = await uploadSchoolLogo(file)
      patchIdentity({ logoURL: url })
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLogoBusy(false)
    }
  }

  async function onRemoveLogo() {
    setLogoBusy(true)
    setLogoError(null)
    try {
      await removeSchoolLogo()
      patchIdentity({ logoURL: null })
    } catch (err) {
      setLogoError(err instanceof Error ? err.message : 'Could not remove logo.')
    } finally {
      setLogoBusy(false)
    }
  }

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Configure how your school appears on every examination paper and export.
      </p>
      <div className="pc-settings-logo-row">
        <div className="pc-settings-logo-preview">
          {id.logoURL ? (
            <img src={id.logoURL} alt="" />
          ) : (
            <span className="pc-settings-logo-fallback">
              {id.schoolName.trim().charAt(0).toUpperCase() || 'S'}
            </span>
          )}
        </div>
        <div className="pc-settings-logo-actions">
          <button
            type="button"
            className="pc-btn is-sm is-ghost"
            disabled={logoBusy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera size={14} strokeWidth={1.6} />
            {id.logoURL ? 'Change logo' : 'Upload logo'}
          </button>
          {id.logoURL ? (
            <button
              type="button"
              className="pc-btn is-sm is-ghost"
              disabled={logoBusy}
              onClick={() => void onRemoveLogo()}
            >
              <Trash2 size={14} strokeWidth={1.6} />
              Remove
            </button>
          ) : null}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="pc-profile-photo-input"
            onChange={(e) => {
              void onLogoFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {logoError ? <p className="pc-settings-inline-error">{logoError}</p> : null}

      <FieldGrid>
        <Field label="School name" span>
          <input
            value={id.schoolName}
            onChange={(e) => patchIdentity({ schoolName: e.target.value })}
          />
        </Field>
        <Field label="Tagline" span>
          <input
            value={id.tagline}
            onChange={(e) => patchIdentity({ tagline: e.target.value })}
            placeholder="Senior Secondary · Estd. 1962"
          />
        </Field>
        <Field label="Board affiliation" span>
          <input
            value={id.boardAffiliation}
            onChange={(e) => patchIdentity({ boardAffiliation: e.target.value })}
          />
        </Field>
        <Field label="Academic year">
          <input
            value={id.academicYear}
            onChange={(e) => patchIdentity({ academicYear: e.target.value })}
          />
        </Field>
        <Field label="Principal">
          <input
            value={id.principalName}
            onChange={(e) => patchIdentity({ principalName: e.target.value })}
          />
        </Field>
        <Field label="Address" span>
          <textarea
            rows={2}
            value={id.address}
            onChange={(e) => patchIdentity({ address: e.target.value })}
          />
        </Field>
        <Field label="Phone">
          <input
            type="tel"
            value={id.phone}
            onChange={(e) => patchIdentity({ phone: e.target.value })}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            value={id.email}
            onChange={(e) => patchIdentity({ email: e.target.value })}
          />
        </Field>
      </FieldGrid>
    </div>
  )
}

export function AcademicDefaultsSection({ draft, onPatch }: SectionProps) {
  const a = draft.academic
  const patch = (p: Partial<typeof a>) => onPatch({ academic: { ...a, ...p } })

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Defaults for new papers, repository filters, and blueprint selection.
      </p>
      <FieldGrid>
        <Field label="Default language">
          <select
            value={a.defaultLanguage}
            onChange={(e) =>
              patch({ defaultLanguage: e.target.value === 'hi' ? 'hi' : 'en' })
            }
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </Field>
        <Field label="Default medium">
          <select
            value={a.defaultMedium}
            onChange={(e) =>
              patch({
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
        </Field>
        <Field label="Default blueprint">
          <input
            value={a.defaultBlueprintId}
            onChange={(e) => patch({ defaultBlueprintId: e.target.value })}
            placeholder="Blueprint ID (optional)"
          />
        </Field>
        <Field label="Default template">
          <input
            value={a.defaultTemplateId}
            onChange={(e) => patch({ defaultTemplateId: e.target.value })}
            placeholder="Reserved for future templates"
            disabled
          />
        </Field>
        <Field label="Grading style">
          <select
            value={a.gradingStyle}
            onChange={(e) =>
              patch({
                gradingStyle:
                  e.target.value === 'percentage' || e.target.value === 'grade'
                    ? e.target.value
                    : 'marks',
              })
            }
          >
            <option value="marks">Marks-based</option>
            <option value="percentage">Percentage</option>
            <option value="grade">Letter grades</option>
          </select>
        </Field>
        <Field label="Difficulty balance">
          <select
            value={a.difficultyBalance}
            onChange={(e) =>
              patch({
                difficultyBalance:
                  e.target.value === 'easy' || e.target.value === 'rigorous'
                    ? e.target.value
                    : 'balanced',
              })
            }
          >
            <option value="easy">Easier emphasis</option>
            <option value="balanced">Balanced mix</option>
            <option value="rigorous">Rigorous emphasis</option>
          </select>
        </Field>
      </FieldGrid>
    </div>
  )
}

export function PaperDefaultsSection({ draft, onPatch }: SectionProps) {
  const p = draft.paper
  const patch = (part: Partial<typeof p>) => onPatch({ paper: { ...p, ...part } })

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Default typography and layout for the paper editor and print output.
      </p>
      <FieldGrid>
        <Field label="Font style">
          <select
            value={p.fontStyle}
            onChange={(e) =>
              patch({ fontStyle: e.target.value === 'sans' ? 'sans' : 'serif' })
            }
          >
            <option value="serif">Serif (editorial)</option>
            <option value="sans">Sans-serif</option>
          </select>
        </Field>
        <Field label="Layout mode">
          <select
            value={p.layoutMode}
            onChange={(e) =>
              patch({
                layoutMode:
                  e.target.value === 'compact' || e.target.value === 'spacious'
                    ? e.target.value
                    : 'standard',
              })
            }
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="spacious">Spacious</option>
          </select>
        </Field>
        <Field label="Header preset">
          <select
            value={p.headerPreset}
            onChange={(e) =>
              patch({
                headerPreset:
                  e.target.value === 'spacious' || e.target.value === 'standard'
                    ? e.target.value
                    : 'compact',
              })
            }
          >
            <option value="compact">Compact header</option>
            <option value="standard">Standard header</option>
            <option value="spacious">Spacious header</option>
          </select>
        </Field>
        <Field label="Section numbering">
          <select
            value={p.sectionNumbering}
            onChange={(e) =>
              patch({
                sectionNumbering:
                  e.target.value === 'numeric' || e.target.value === 'roman'
                    ? e.target.value
                    : 'alpha',
              })
            }
          >
            <option value="alpha">A, B, C</option>
            <option value="numeric">1, 2, 3</option>
            <option value="roman">I, II, III</option>
          </select>
        </Field>
        <Field label="Default spacing">
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={p.defaultSpacing}
            onChange={(e) => patch({ defaultSpacing: Number(e.target.value) })}
          />
        </Field>
        <Field label="Page density">
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={p.pageDensity}
            onChange={(e) => patch({ pageDensity: Number(e.target.value) })}
          />
        </Field>
        <Field label="Watermark text" span>
          <input
            value={p.watermarkText}
            onChange={(e) => patch({ watermarkText: e.target.value })}
            disabled={!p.watermarkEnabled}
          />
        </Field>
      </FieldGrid>
      <label className="pc-settings-check">
        <input
          type="checkbox"
          checked={p.footerVisible}
          onChange={(e) => patch({ footerVisible: e.target.checked })}
        />
        <span>Show page footer on printed papers</span>
      </label>
      <label className="pc-settings-check">
        <input
          type="checkbox"
          checked={p.watermarkEnabled}
          onChange={(e) => patch({ watermarkEnabled: e.target.checked })}
        />
        <span>Enable institutional watermark</span>
      </label>
    </div>
  )
}

export function NotificationSettingsSection({ draft, onPatch }: SectionProps) {
  const n = draft.notifications
  const patch = (p: Partial<typeof n>) => onPatch({ notifications: { ...n, ...p } })

  const rows: { key: keyof typeof n; label: string; hint: string }[] = [
    {
      key: 'approvalAlerts',
      label: 'Approval alerts',
      hint: 'When a paper enters the approval queue.',
    },
    {
      key: 'submissionAlerts',
      label: 'Submission alerts',
      hint: 'When teachers submit papers for review.',
    },
    {
      key: 'generationComplete',
      label: 'Generation complete',
      hint: 'When auto-generation finishes a paper draft.',
    },
    {
      key: 'importComplete',
      label: 'Import complete',
      hint: 'When bulk question import finishes.',
    },
  ]

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        In-app notification toggles for operational workflows.
      </p>
      <ul className="pc-settings-toggle-list">
        {rows.map((row) => (
          <li key={row.key}>
            <label className="pc-settings-toggle-row">
              <input
                type="checkbox"
                checked={n[row.key]}
                onChange={(e) => patch({ [row.key]: e.target.checked })}
              />
              <span>
                <strong>{row.label}</strong>
                <small>{row.hint}</small>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function WorkspacePreferencesSection({ draft, onPatch }: SectionProps) {
  const w = draft.workspace
  const patch = (p: Partial<typeof w>) => onPatch({ workspace: { ...w, ...p } })

  const landingOptions: { id: typeof w.defaultLandingPage; label: string }[] = [
    { id: 'home', label: 'Control Center' },
    { id: 'repo', label: 'Question Repository' },
    { id: 'papers', label: 'Paper Library' },
    { id: 'builder', label: 'Paper Builder' },
  ]

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Personalize how the workspace opens and feels day to day.
      </p>
      <label className="pc-settings-check">
        <input
          type="checkbox"
          checked={w.sidebarCollapsedDefault}
          onChange={(e) => patch({ sidebarCollapsedDefault: e.target.checked })}
        />
        <span>Start with sidebar collapsed</span>
      </label>
      <FieldGrid>
        <Field label="Default landing page">
          <select
            value={w.defaultLandingPage}
            onChange={(e) => {
              const v = e.target.value
              patch({
                defaultLandingPage:
                  v === 'repo' || v === 'papers' || v === 'builder' ? v : 'home',
              })
            }}
          >
            {landingOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Animation intensity">
          <select
            value={w.animationIntensity}
            onChange={(e) =>
              patch({
                animationIntensity:
                  e.target.value === 'minimal' ? 'minimal' : 'standard',
              })
            }
          >
            <option value="minimal">Minimal</option>
            <option value="standard">Standard</option>
          </select>
        </Field>
        <Field label="Density">
          <select
            value={w.densityPreference}
            onChange={(e) =>
              patch({
                densityPreference:
                  e.target.value === 'compact' ? 'compact' : 'comfortable',
              })
            }
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </Field>
      </FieldGrid>
      <p className="pc-settings-hint">
        Landing routes: {Object.values(NAV_ROUTES).slice(0, 4).join(' · ')}…
      </p>
    </div>
  )
}

export function ExportPrintSection({ draft, onPatch }: SectionProps) {
  const e = draft.export
  const patch = (p: Partial<typeof e>) => onPatch({ export: { ...e, ...p } })

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Defaults for PDF export, print margins, and institutional footers.
      </p>
      <FieldGrid>
        <Field label="PDF naming">
          <select
            value={e.pdfNamingStyle}
            onChange={(ev) =>
              patch({
                pdfNamingStyle:
                  ev.target.value === 'title-date' ||
                  ev.target.value === 'session-title'
                    ? ev.target.value
                    : 'class-subject-date',
              })
            }
          >
            <option value="class-subject-date">Class · Subject · Date</option>
            <option value="title-date">Title · Date</option>
            <option value="session-title">Session · Title</option>
          </select>
        </Field>
        <Field label="Print margins">
          <select
            value={e.printMarginPreset}
            onChange={(ev) =>
              patch({
                printMarginPreset:
                  ev.target.value === 'tight' ||
                  ev.target.value === 'wide' ||
                  ev.target.value === 'custom'
                    ? ev.target.value
                    : 'normal',
              })
            }
          >
            {Object.entries(MARGIN_PRESETS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Export footer" span>
          <textarea
            rows={2}
            value={e.exportFooterText}
            onChange={(ev) => patch({ exportFooterText: ev.target.value })}
          />
        </Field>
      </FieldGrid>
      <label className="pc-settings-check">
        <input
          type="checkbox"
          checked={e.grayscaleMode}
          onChange={(ev) => patch({ grayscaleMode: ev.target.checked })}
        />
        <span>Default to grayscale PDF export</span>
      </label>
      <label className="pc-settings-check">
        <input
          type="checkbox"
          checked={e.institutionalFooter}
          onChange={(ev) => patch({ institutionalFooter: ev.target.checked })}
        />
        <span>Include institutional footer on exports</span>
      </label>
    </div>
  )
}

export function SessionAccessSection({ draft, onPatch }: SectionProps) {
  const { user, profile } = useAuth()
  const s = draft.session
  const patch = (p: Partial<typeof s>) => onPatch({ session: { ...s, ...p } })

  const lastSignIn = user?.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : '—'

  return (
    <div className="pc-settings-section">
      <p className="pc-settings-section-lead">
        Session preferences and institution access overview. Security controls
        are not configured in this pass.
      </p>
      <dl className="pc-settings-access-list">
        <div>
          <dt>Active role</dt>
          <dd>{profile?.role === 'admin' ? 'Administrator' : 'Teacher'}</dd>
        </div>
        <div>
          <dt>Institution</dt>
          <dd>{INSTITUTION.name}</dd>
        </div>
        <div>
          <dt>Signed in as</dt>
          <dd>{profile?.email ?? user?.email ?? '—'}</dd>
        </div>
        <div>
          <dt>Last sign-in</dt>
          <dd>{lastSignIn}</dd>
        </div>
      </dl>
      <Field label="Session timeout preference">
        <select
          value={s.sessionTimeoutMinutes}
          onChange={(e) => {
            const v = Number(e.target.value)
            if (v === 30 || v === 60 || v === 120 || v === 480) {
              patch({ sessionTimeoutMinutes: v })
            }
          }}
        >
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={480}>8 hours</option>
        </select>
      </Field>
      <p className="pc-settings-hint">
        Timeout preference is stored for future session policy integration.
      </p>
    </div>
  )
}
