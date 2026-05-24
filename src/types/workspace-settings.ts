import type { PaperMedium } from '@/lib/paper-medium'
import type { PaperHeaderPreset, PaperMarginPreset } from '@/types/paper-instance'

export type SettingsSectionId =
  | 'identity'
  | 'academic'
  | 'paper'
  | 'notifications'
  | 'workspace'
  | 'export'
  | 'session'

export type SchoolIdentitySettings = {
  schoolName: string
  logoURL: string | null
  tagline: string
  boardAffiliation: string
  address: string
  phone: string
  email: string
  principalName: string
  academicYear: string
}

export type AcademicDefaultsSettings = {
  defaultLanguage: 'en' | 'hi'
  defaultMedium: PaperMedium
  defaultBlueprintId: string
  defaultTemplateId: string
  gradingStyle: 'percentage' | 'marks' | 'grade'
  difficultyBalance: 'easy' | 'balanced' | 'rigorous'
}

export type PaperDefaultsSettings = {
  fontStyle: 'serif' | 'sans'
  layoutMode: 'compact' | 'standard' | 'spacious'
  defaultSpacing: number
  sectionNumbering: 'alpha' | 'numeric' | 'roman'
  footerVisible: boolean
  watermarkEnabled: boolean
  watermarkText: string
  pageDensity: number
  headerPreset: PaperHeaderPreset
}

export type WorkspaceNotificationSettings = {
  approvalAlerts: boolean
  submissionAlerts: boolean
  generationComplete: boolean
  importComplete: boolean
}

export type WorkspacePreferencesSettings = {
  sidebarCollapsedDefault: boolean
  defaultLandingPage: 'home' | 'repo' | 'papers' | 'builder'
  animationIntensity: 'minimal' | 'standard'
  densityPreference: 'comfortable' | 'compact'
}

export type ExportPrintSettings = {
  pdfNamingStyle: 'title-date' | 'class-subject-date' | 'session-title'
  exportFooterText: string
  printMarginPreset: PaperMarginPreset
  grayscaleMode: boolean
  institutionalFooter: boolean
}

export type SessionAccessSettings = {
  sessionTimeoutMinutes: 30 | 60 | 120 | 480
}

export type WorkspaceSettings = {
  identity: SchoolIdentitySettings
  academic: AcademicDefaultsSettings
  paper: PaperDefaultsSettings
  notifications: WorkspaceNotificationSettings
  workspace: WorkspacePreferencesSettings
  export: ExportPrintSettings
  session: SessionAccessSettings
  updatedAtMs: number | null
}
