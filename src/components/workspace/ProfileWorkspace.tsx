import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { ProfilePhotoControl } from '@/components/profile/ProfilePhotoControl'
import { ProfileRow } from '@/components/profile/ProfileRow'
import { ProfileSaveStatus } from '@/components/profile/ProfileSaveStatus'
import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm'
import { ProfileWorkspaceAccess } from '@/components/profile/ProfileWorkspaceAccess'
import { useAuth } from '@/context/AuthContext'
import { useProfileEditor } from '@/hooks/useProfileEditor'
import { institutionSubtitle } from '@/lib/institution'
import {
  profileAccessLevel,
  profilePermissions,
} from '@/lib/profile-modules'
import { listItemReveal, listReveal } from '@/lib/motion/variants'
import {
  fetchProfileActivityStats,
  type ProfileActivityStats,
} from '@/services/firebase/profile'
import type { UserProfile } from '@/types/user-profile'
import type { TeacherAssignment } from '@/types/teacher'

function formatDate(ms: number | null): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function uniqueSubjects(assignments: TeacherAssignment[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const a of assignments) {
    if (!seen.has(a.subjectLabel)) {
      seen.add(a.subjectLabel)
      out.push(a.subjectLabel)
    }
  }
  return out
}

function uniqueClasses(assignments: TeacherAssignment[]): string[] {
  const seen = new Set<number>()
  const out: string[] = []
  for (const a of assignments) {
    if (!seen.has(a.classNumber)) {
      seen.add(a.classNumber)
      out.push(a.classLabel)
    }
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

function IdentityCard({ profile }: { profile: UserProfile }) {
  const isTeacher = profile.role === 'teacher'
  const roleLabel = profile.role === 'admin' ? 'Administrator' : 'Teacher'
  const subjects =
    profile.assignmentScope === 'full' && isTeacher
      ? ['All assigned subjects']
      : uniqueSubjects(profile.assignments)
  const classes =
    profile.assignmentScope === 'full' && isTeacher
      ? ['Full repository scope']
      : uniqueClasses(profile.assignments)

  return (
    <ProfileCard
      title="Identity"
      subtitle="Your basic profile — visible to your school workspace."
    >
      <div className="pc-profile-identity-hero">
        <ProfilePhotoControl
          uid={profile.uid}
          displayName={profile.displayName}
          photoURL={profile.photoURL}
          size="lg"
        />
        <div className="pc-profile-identity-hero-meta">
          <div className="pc-profile-identity-name pc-serif">{profile.displayName}</div>
          <div className="pc-profile-identity-roleline">
            {profile.settings.designation || roleLabel}
            <span className="pc-profile-role-badge">{roleLabel}</span>
          </div>
          <div className="pc-profile-identity-joined">
            Joined {formatDate(profile.joinedAtMs)}
          </div>
        </div>
      </div>
      <div className="pc-profile-rows">
        <ProfileRow label="Institution" hint="Your school workspace.">
          <span>{institutionSubtitle(profile.role)}</span>
        </ProfileRow>
        <ProfileRow label="Email" hint="Used for sign-in and notifications.">
          <span className="pc-profile-email">{profile.email}</span>
        </ProfileRow>
        {isTeacher ? (
          <>
            <ProfileRow label="Subjects" hint="Assigned teaching scope.">
              <div className="pc-profile-chip-list">
                {subjects.length > 0 ? (
                  subjects.map((s) => <span key={s}>{s}</span>)
                ) : (
                  <span className="pc-profile-muted">Not assigned yet</span>
                )}
              </div>
            </ProfileRow>
            <ProfileRow label="Classes" hint="Grade levels under your purview.">
              <div className="pc-profile-chip-list">
                {classes.length > 0 ? (
                  classes.map((c) => <span key={c}>{c}</span>)
                ) : (
                  <span className="pc-profile-muted">Not assigned yet</span>
                )}
              </div>
            </ProfileRow>
          </>
        ) : null}
        <ProfileRow label="Account status">
          <span
            className={
              'pc-profile-status-pill' + (profile.active ? ' is-active' : '')
            }
          >
            {profile.active ? 'Active' : 'Inactive'}
          </span>
        </ProfileRow>
      </div>
    </ProfileCard>
  )
}

function RolePermissionsCard({ profile }: { profile: UserProfile }) {
  const permissions = profilePermissions(profile.role)
  return (
    <ProfileCard
      title="Role & permissions"
      subtitle="Set by your workspace admin. Contact admin to request changes."
    >
      <div className="pc-profile-rows">
        <ProfileRow label="Access level">
          <span>{profileAccessLevel(profile.role)}</span>
        </ProfileRow>
        <ProfileRow label="Assigned permissions">
          <ul className="pc-profile-perm-list is-inline">
            {permissions.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </ProfileRow>
      </div>
      <ProfileWorkspaceAccess role={profile.role} embedded />
    </ProfileCard>
  )
}

function ActivityCard({
  loading,
  stats,
  isAdmin,
}: {
  loading: boolean
  stats: ProfileActivityStats | null
  isAdmin: boolean
}) {
  const approvalLabel = isAdmin ? 'Approvals completed' : 'Submissions sent'
  const cells = [
    ['Papers created', loading ? '—' : String(stats?.papersCreated ?? 0)],
    [approvalLabel, loading ? '—' : String(stats?.approvalsCompleted ?? 0)],
    ...(isAdmin
      ? [['Questions authored', loading ? '—' : String(stats?.questionsAuthored ?? 0)]]
      : []),
    [
      'Last active',
      loading
        ? '—'
        : stats?.lastActiveMs
          ? new Date(stats.lastActiveMs).toLocaleDateString(undefined, {
              day: 'numeric',
              month: 'short',
            })
          : '—',
    ],
  ] as const

  return (
    <ProfileCard
      title="Activity summary"
      subtitle="Read-only stats from your recent workspace activity."
      padded={false}
    >
      <div
        className="pc-profile-activity-grid"
        style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
      >
        {cells.map(([label, value]) => (
          <div key={label} className="pc-profile-activity-cell">
            <div className="pc-profile-activity-cell-label">{label}</div>
            <div className="pc-profile-activity-cell-val pc-serif pc-num">{value}</div>
          </div>
        ))}
      </div>
    </ProfileCard>
  )
}

export function ProfileWorkspace() {
  const { profile, isAdmin } = useAuth()
  const {
    draft,
    patchDraft,
    patchSettings,
    saveState,
    saveError,
    savedAt,
  } = useProfileEditor(profile)

  const [activityLoading, setActivityLoading] = useState(true)
  const [activity, setActivity] = useState<ProfileActivityStats | null>(null)

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    setActivityLoading(true)
    fetchProfileActivityStats(profile.uid, profile.role)
      .then((stats) => {
        if (!cancelled) setActivity(stats)
      })
      .catch(() => {
        if (!cancelled) setActivity(null)
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [profile?.uid, profile?.role, profile])

  if (!profile || !draft) {
    return (
      <main className="pc-profile-workspace pc-scroll" aria-busy>
        <div className="pc-profile-skeleton" />
      </main>
    )
  }

  return (
    <main className="pc-profile-workspace pc-scroll">
      <div className="pc-profile-inner">
        <FadeIn>
          <header className="pc-profile-head">
            <div>
              <h1 className="pc-profile-title pc-serif">My Profile</h1>
              <p className="pc-profile-lead">
                Your identity across PaperCraft. This is how teachers and approvers
                see you in approvals and the activity feed.
              </p>
            </div>
            <ProfileSaveStatus
              state={saveState}
              savedAt={savedAt}
              error={saveError}
            />
          </header>
        </FadeIn>

        <m.div
          className="pc-profile-stack"
          variants={listReveal}
          initial="hidden"
          animate="visible"
        >
          <m.div variants={listItemReveal}>
            <IdentityCard profile={profile} />
          </m.div>
          <m.div variants={listItemReveal}>
            <RolePermissionsCard profile={profile} />
          </m.div>
          <m.div variants={listItemReveal}>
            <ProfileSettingsForm
              role={profile.role}
              draft={draft}
              onDisplayName={(displayName) => patchDraft({ displayName })}
              onSettings={patchSettings}
            />
          </m.div>
          <m.div variants={listItemReveal}>
            <ActivityCard loading={activityLoading} stats={activity} isAdmin={isAdmin} />
          </m.div>
        </m.div>
      </div>
    </main>
  )
}
