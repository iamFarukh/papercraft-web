import type { PaperMedium } from '@/lib/paper-medium'
import {
  DEFAULT_WORKSPACE_SETTINGS,
} from '@/lib/workspace-settings-defaults'
import type {
  AcademicDefaultsSettings,
  ExportPrintSettings,
  PaperDefaultsSettings,
  SchoolIdentitySettings,
  SessionAccessSettings,
  WorkspaceNotificationSettings,
  WorkspacePreferencesSettings,
  WorkspaceSettings,
} from '@/types/workspace-settings'
import type { PaperMarginPreset } from '@/types/paper-instance'

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.trim() : fallback
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function medium(value: unknown): PaperMedium {
  if (value === 'hindi' || value === 'bilingual') return value
  return 'english'
}

function parseIdentity(raw: Record<string, unknown>): SchoolIdentitySettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.identity
  return {
    schoolName: str(raw.schoolName, d.schoolName),
    logoURL:
      typeof raw.logoURL === 'string' && raw.logoURL.trim()
        ? raw.logoURL.trim()
        : null,
    tagline: str(raw.tagline, d.tagline),
    boardAffiliation: str(raw.boardAffiliation, d.boardAffiliation),
    address: str(raw.address, d.address),
    phone: str(raw.phone, d.phone),
    email: str(raw.email, d.email),
    principalName: str(raw.principalName, d.principalName),
    academicYear: str(raw.academicYear, d.academicYear),
  }
}

function parseAcademic(raw: Record<string, unknown>): AcademicDefaultsSettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.academic
  const grading = raw.gradingStyle
  const difficulty = raw.difficultyBalance
  return {
    defaultLanguage: raw.defaultLanguage === 'hi' ? 'hi' : 'en',
    defaultMedium: medium(raw.defaultMedium),
    defaultBlueprintId: str(raw.defaultBlueprintId, d.defaultBlueprintId),
    defaultTemplateId: str(raw.defaultTemplateId, d.defaultTemplateId),
    gradingStyle:
      grading === 'percentage' || grading === 'grade' ? grading : 'marks',
    difficultyBalance:
      difficulty === 'easy' || difficulty === 'rigorous'
        ? difficulty
        : 'balanced',
  }
}

function parsePaper(raw: Record<string, unknown>): PaperDefaultsSettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.paper
  const layout = raw.layoutMode
  const numbering = raw.sectionNumbering
  const preset = raw.headerPreset
  return {
    fontStyle: raw.fontStyle === 'sans' ? 'sans' : 'serif',
    layoutMode:
      layout === 'compact' || layout === 'spacious' ? layout : 'standard',
    defaultSpacing: num(raw.defaultSpacing, d.defaultSpacing),
    sectionNumbering:
      numbering === 'numeric' || numbering === 'roman' ? numbering : 'alpha',
    footerVisible: bool(raw.footerVisible, d.footerVisible),
    watermarkEnabled: bool(raw.watermarkEnabled, d.watermarkEnabled),
    watermarkText: str(raw.watermarkText, d.watermarkText),
    pageDensity: num(raw.pageDensity, d.pageDensity),
    headerPreset:
      preset === 'spacious' || preset === 'standard' ? preset : 'compact',
  }
}

function parseNotifications(
  raw: Record<string, unknown>,
): WorkspaceNotificationSettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.notifications
  return {
    approvalAlerts: bool(raw.approvalAlerts, d.approvalAlerts),
    submissionAlerts: bool(raw.submissionAlerts, d.submissionAlerts),
    generationComplete: bool(raw.generationComplete, d.generationComplete),
    importComplete: bool(raw.importComplete, d.importComplete),
  }
}

function parseWorkspacePrefs(
  raw: Record<string, unknown>,
): WorkspacePreferencesSettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.workspace
  const landing = raw.defaultLandingPage
  return {
    sidebarCollapsedDefault: bool(
      raw.sidebarCollapsedDefault,
      d.sidebarCollapsedDefault,
    ),
    defaultLandingPage:
      landing === 'repo' ||
      landing === 'papers' ||
      landing === 'builder'
        ? landing
        : 'home',
    animationIntensity:
      raw.animationIntensity === 'minimal' ? 'minimal' : 'standard',
    densityPreference:
      raw.densityPreference === 'compact' ? 'compact' : 'comfortable',
  }
}

function parseExport(raw: Record<string, unknown>): ExportPrintSettings {
  const d = DEFAULT_WORKSPACE_SETTINGS.export
  const naming = raw.pdfNamingStyle
  const margin = raw.printMarginPreset
  return {
    pdfNamingStyle:
      naming === 'title-date' || naming === 'session-title'
        ? naming
        : 'class-subject-date',
    exportFooterText: str(raw.exportFooterText, d.exportFooterText),
    printMarginPreset:
      margin === 'tight' || margin === 'wide' || margin === 'custom'
        ? (margin as PaperMarginPreset)
        : 'normal',
    grayscaleMode: bool(raw.grayscaleMode, d.grayscaleMode),
    institutionalFooter: bool(raw.institutionalFooter, d.institutionalFooter),
  }
}

function parseSession(raw: Record<string, unknown>): SessionAccessSettings {
  const t = raw.sessionTimeoutMinutes
  if (t === 30 || t === 60 || t === 480) return { sessionTimeoutMinutes: t }
  return DEFAULT_WORKSPACE_SETTINGS.session
}

function section(
  data: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const v = data[key]
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {}
}

export function parseWorkspaceSettings(
  data: Record<string, unknown> | undefined,
): WorkspaceSettings {
  if (!data) return { ...DEFAULT_WORKSPACE_SETTINGS }

  const updated = data.updatedAt as { toMillis?: () => number } | undefined
  const updatedAtMs = updated?.toMillis?.() ?? null

  return {
    identity: parseIdentity(section(data, 'identity')),
    academic: parseAcademic(section(data, 'academic')),
    paper: parsePaper(section(data, 'paper')),
    notifications: parseNotifications(section(data, 'notifications')),
    workspace: parseWorkspacePrefs(section(data, 'workspace')),
    export: parseExport(section(data, 'export')),
    session: parseSession(section(data, 'session')),
    updatedAtMs,
  }
}
