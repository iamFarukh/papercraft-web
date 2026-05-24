import type { PaperMedium } from '@/lib/paper-medium'
import {
  DEFAULT_PROFILE_SETTINGS,
  type ProfileAuthoringPreference,
  type ProfilePaperStyle,
  type ProfilePreferredLanguage,
  type ProfileSettings,
} from '@/types/profile-settings'

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
}

function asMedium(value: unknown): PaperMedium {
  if (value === 'hindi' || value === 'bilingual') return value
  return 'english'
}

function asLanguage(value: unknown): ProfilePreferredLanguage {
  return value === 'hi' ? 'hi' : 'en'
}

function asPaperStyle(value: unknown): ProfilePaperStyle {
  if (value === 'compact' || value === 'spacious') return value
  return 'standard'
}

function asAuthoringPref(value: unknown): ProfileAuthoringPreference {
  return value === 'flexible' ? 'flexible' : 'structured'
}

function timestampMs(value: unknown): number | null {
  if (value && typeof value === 'object' && 'toMillis' in value) {
    const ms = (value as { toMillis: () => number }).toMillis()
    return Number.isFinite(ms) ? ms : null
  }
  return null
}

export function parseProfileSettings(data: Record<string, unknown>): ProfileSettings {
  const nested =
    data.settings && typeof data.settings === 'object'
      ? (data.settings as Record<string, unknown>)
      : data

  return {
    phone: asString(nested.phone ?? data.phone),
    designation: asString(nested.designation ?? data.designation),
    bio: asString(nested.bio ?? data.bio),
    preferredLanguage: asLanguage(nested.preferredLanguage ?? data.preferredLanguage),
    defaultMedium: asMedium(nested.defaultMedium ?? data.defaultMedium),
    preferredSubjects: asStringArray(
      nested.preferredSubjects ?? data.preferredSubjects,
    ),
    preferredBlueprintPresets: asStringArray(
      nested.preferredBlueprintPresets ?? data.preferredBlueprintPresets,
    ),
    defaultPaperStyle: asPaperStyle(
      nested.defaultPaperStyle ?? data.defaultPaperStyle,
    ),
    questionAuthoringPreference: asAuthoringPref(
      nested.questionAuthoringPreference ?? data.questionAuthoringPreference,
    ),
    workspaceRoleVisibility: asBool(
      nested.workspaceRoleVisibility ?? data.workspaceRoleVisibility,
      DEFAULT_PROFILE_SETTINGS.workspaceRoleVisibility,
    ),
    institutionalControls: asBool(
      nested.institutionalControls ?? data.institutionalControls,
      DEFAULT_PROFILE_SETTINGS.institutionalControls,
    ),
  }
}

export function parseProfileTimestamps(data: Record<string, unknown>): {
  joinedAtMs: number | null
  lastActiveAtMs: number | null
} {
  return {
    joinedAtMs:
      timestampMs(data.createdAt) ??
      timestampMs(data.joinedAt) ??
      null,
    lastActiveAtMs:
      timestampMs(data.lastActiveAt) ??
      timestampMs(data.updatedAt) ??
      null,
  }
}
