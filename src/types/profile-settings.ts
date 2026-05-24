import type { PaperMedium } from '@/lib/paper-medium'

export type ProfilePreferredLanguage = 'en' | 'hi'

export type ProfilePaperStyle = 'compact' | 'standard' | 'spacious'

export type ProfileAuthoringPreference = 'structured' | 'flexible'

/** Editable fields stored on users/{uid}. */
export type ProfileSettings = {
  phone: string
  designation: string
  bio: string
  preferredLanguage: ProfilePreferredLanguage
  defaultMedium: PaperMedium
  preferredSubjects: string[]
  preferredBlueprintPresets: string[]
  defaultPaperStyle: ProfilePaperStyle
  questionAuthoringPreference: ProfileAuthoringPreference
  workspaceRoleVisibility: boolean
  institutionalControls: boolean
}

export const DEFAULT_PROFILE_SETTINGS: ProfileSettings = {
  phone: '',
  designation: '',
  bio: '',
  preferredLanguage: 'en',
  defaultMedium: 'english',
  preferredSubjects: [],
  preferredBlueprintPresets: [],
  defaultPaperStyle: 'standard',
  questionAuthoringPreference: 'structured',
  workspaceRoleVisibility: true,
  institutionalControls: false,
}
