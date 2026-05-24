import { m } from 'framer-motion'
import { ProfilePhotoControl } from '@/components/profile/ProfilePhotoControl'
import { INSTITUTION, institutionSubtitle } from '@/lib/institution'
import { PC_TRANSITION } from '@/lib/motion/tokens'
import type { UserProfile } from '@/types/user-profile'
import type { TeacherAssignment } from '@/types/teacher'

type Props = {
  profile: UserProfile
}

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

export function ProfileIdentityPanel({ profile }: Props) {
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
    <m.aside
      className="pc-profile-identity"
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={PC_TRANSITION.panel}
    >
      <ProfilePhotoControl
        uid={profile.uid}
        displayName={profile.displayName}
        photoURL={profile.photoURL}
        size="lg"
      />

      <div className="pc-profile-identity-inst">
        <p className="pc-profile-identity-school">{INSTITUTION.name}</p>
        <p className="pc-profile-identity-lane">
          {isTeacher ? INSTITUTION.facultyLabel : INSTITUTION.adminLabel}
        </p>
      </div>

      <dl className="pc-profile-meta-list">
        <div className="pc-profile-meta-row">
          <dt>Role</dt>
          <dd>
            <span className="pc-profile-role-badge">{roleLabel}</span>
          </dd>
        </div>
        <div className="pc-profile-meta-row">
          <dt>Institution</dt>
          <dd>{INSTITUTION.name}</dd>
        </div>
        {isTeacher ? (
          <>
            <div className="pc-profile-meta-row">
              <dt>Subjects</dt>
              <dd>
                {subjects.length > 0 ? (
                  <ul className="pc-profile-chip-list">
                    {subjects.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="pc-profile-muted">Not assigned yet</span>
                )}
              </dd>
            </div>
            <div className="pc-profile-meta-row">
              <dt>Classes</dt>
              <dd>
                {classes.length > 0 ? (
                  <ul className="pc-profile-chip-list">
                    {classes.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="pc-profile-muted">Not assigned yet</span>
                )}
              </dd>
            </div>
          </>
        ) : null}
        <div className="pc-profile-meta-row">
          <dt>Account</dt>
          <dd>
            <span
              className={
                'pc-profile-status-pill' + (profile.active ? ' is-active' : '')
              }
            >
              {profile.active ? 'Active' : 'Inactive'}
            </span>
          </dd>
        </div>
        <div className="pc-profile-meta-row">
          <dt>Joined</dt>
          <dd>{formatDate(profile.joinedAtMs)}</dd>
        </div>
        <div className="pc-profile-meta-row">
          <dt>Email</dt>
          <dd className="pc-profile-email">{profile.email}</dd>
        </div>
      </dl>

      <p className="pc-profile-identity-foot pc-profile-muted">
        {institutionSubtitle(profile.role)}
      </p>
    </m.aside>
  )
}
