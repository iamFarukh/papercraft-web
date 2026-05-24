import { DEFAULT_SCHOOL } from '@/lib/paper-builder'
import type { WorkspaceSettings } from '@/types/workspace-settings'

export const WORKSPACE_SETTINGS_DOC_ID = 'main'

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  identity: {
    schoolName: DEFAULT_SCHOOL.schoolName,
    logoURL: null,
    tagline: DEFAULT_SCHOOL.schoolTagline,
    boardAffiliation: 'RBSE · Rajasthan Board of Secondary Education',
    address: 'Vidya Nagar, Jaipur, Rajasthan 302020',
    phone: '+91 141 000 0000',
    email: 'office@saraswatividyaniketan.edu.in',
    principalName: 'Dr. Meera Sharma',
    academicYear: '2025–26',
  },
  academic: {
    defaultLanguage: 'en',
    defaultMedium: 'english',
    defaultBlueprintId: '',
    defaultTemplateId: '',
    gradingStyle: 'marks',
    difficultyBalance: 'balanced',
  },
  paper: {
    fontStyle: 'serif',
    layoutMode: 'standard',
    defaultSpacing: 2.5,
    sectionNumbering: 'alpha',
    footerVisible: true,
    watermarkEnabled: false,
    watermarkText: 'Saraswati Vidya Niketan',
    pageDensity: 2.5,
    headerPreset: 'compact',
  },
  notifications: {
    approvalAlerts: true,
    submissionAlerts: true,
    generationComplete: true,
    importComplete: true,
  },
  workspace: {
    sidebarCollapsedDefault: false,
    defaultLandingPage: 'home',
    animationIntensity: 'standard',
    densityPreference: 'comfortable',
  },
  export: {
    pdfNamingStyle: 'class-subject-date',
    exportFooterText: 'Generated via PaperCraft · Saraswati Vidya Niketan',
    printMarginPreset: 'normal',
    grayscaleMode: false,
    institutionalFooter: true,
  },
  session: {
    sessionTimeoutMinutes: 120,
  },
  updatedAtMs: null,
}

/** School branding applied to examination papers. */
export function schoolBrandingFromSettings(
  settings: WorkspaceSettings,
): {
  schoolName: string
  schoolTagline: string
  schoolLogoURL: string | null
} {
  return {
    schoolName: settings.identity.schoolName.trim() || DEFAULT_SCHOOL.schoolName,
    schoolTagline: settings.identity.tagline.trim() || DEFAULT_SCHOOL.schoolTagline,
    schoolLogoURL: settings.identity.logoURL,
  }
}
