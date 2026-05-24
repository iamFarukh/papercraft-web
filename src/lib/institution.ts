/** Institutional branding shown across workspace surfaces. */
export const INSTITUTION = {
  name: 'Saraswati Vidya Niketan',
  location: 'Jaipur',
  facultyLabel: 'Academic Faculty',
  adminLabel: 'Academic Administration',
} as const

export function institutionSubtitle(role: 'admin' | 'teacher'): string {
  const lane = role === 'admin' ? INSTITUTION.adminLabel : INSTITUTION.facultyLabel
  return `${INSTITUTION.name} · ${lane}`
}
