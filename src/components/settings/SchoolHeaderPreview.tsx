import { m } from 'framer-motion'
import { PrintPageHeader } from '@/components/print/PrintPageHeader'
import type { PaperMeta } from '@/lib/paper-builder'
import { PC_TRANSITION } from '@/lib/motion/tokens'
import type { SchoolIdentitySettings } from '@/types/workspace-settings'

const SAMPLE_META: Omit<PaperMeta, 'schoolName' | 'schoolTagline' | 'schoolLogoURL'> = {
  title: 'Half-Yearly Examination · 2025–26',
  classLabel: 'X',
  subject: 'Mathematics',
  medium: 'english',
  durationLabel: '3 hours',
  totalMarks: 80,
  sessionLabel: '2025–26 · Term II',
  examType: 'Half-Yearly',
}

type Props = {
  identity: SchoolIdentitySettings
}

export function SchoolHeaderPreview({ identity }: Props) {
  const meta: PaperMeta = {
    ...SAMPLE_META,
    schoolName: identity.schoolName.trim() || 'School name',
    schoolTagline: identity.tagline.trim(),
    schoolLogoURL: identity.logoURL,
  }

  return (
    <m.aside
      className="pc-settings-preview"
      layout
      transition={PC_TRANSITION.panel}
    >
      <p className="pc-settings-preview-kicker">Live preview</p>
      <p className="pc-settings-preview-lead">
        How the examination header appears on exported papers.
      </p>
      <div className="pc-settings-preview-sheet">
        <PrintPageHeader meta={meta} mode="full" />
        <div className="pc-settings-preview-divider" aria-hidden />
        <PrintPageHeader meta={meta} mode="compact" />
      </div>
      {identity.boardAffiliation.trim() ? (
        <p className="pc-settings-preview-foot">{identity.boardAffiliation}</p>
      ) : null}
    </m.aside>
  )
}
