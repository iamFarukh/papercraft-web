import type { PaperMeta } from '@/lib/paper-builder'
import { getPrintLabels } from '@/lib/paper-medium'
import type { HeaderFieldVisibility } from '@/lib/paper-print-header'

type Props = {
  meta: PaperMeta
  mode: 'full' | 'compact'
  fields?: HeaderFieldVisibility
}

export function PrintPageHeader({ meta, mode, fields }: Props) {
  const labels = getPrintLabels(meta.medium)
  const isHindi = meta.medium === 'hindi'
  const vis = fields ?? {
    showLogo: true,
    showTagline: true,
    showExamTitle: true,
    showExamMeta: true,
  }

  if (mode === 'compact') {
    return (
      <header className="pc-print-header pc-print-header--compact">
        <div className={`pc-print-header-compact-title pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
          {meta.schoolName}
        </div>
        {vis.showExamMeta ? (
          <div className={`pc-print-header-compact-meta${isHindi ? ' pc-print-is-hindi' : ''}`}>
            <span>
              <strong>{labels.class}</strong> {meta.classLabel}
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong>{labels.subject}</strong> {meta.subject}
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong>{labels.time}</strong> {meta.durationLabel}
            </span>
            <span aria-hidden>·</span>
            <span>
              <strong>{labels.maxMarks}</strong> {meta.totalMarks}
            </span>
          </div>
        ) : null}
        {vis.showExamTitle ? (
          <div className={`pc-print-header-compact-exam pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
            {meta.title}
          </div>
        ) : null}
      </header>
    )
  }

  return (
    <header className="pc-print-header pc-print-header--full">
      {vis.showLogo ? (
        <div className="pc-print-school-mark" aria-hidden>
          {meta.schoolLogoURL ? (
            <img
              src={meta.schoolLogoURL}
              alt=""
              className="pc-print-school-logo"
            />
          ) : (
            <svg viewBox="0 0 40 40" width="36" height="36">
              <path
                d="M20 2 L34 8 L34 22 C34 30 28 36 20 38 C12 36 6 30 6 22 L6 8 Z"
                fill="none"
                stroke="#15161A"
                strokeWidth="1.2"
              />
              <text
                x="20"
                y="24"
                textAnchor="middle"
                fontFamily="Newsreader, serif"
                fontSize="13"
                fontStyle="italic"
                fill="#15161A"
              >
                {meta.schoolName.trim().charAt(0).toUpperCase() || 'S'}
              </text>
            </svg>
          )}
        </div>
      ) : null}
      <div className={`pc-print-school-name pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
        {meta.schoolName}
      </div>
      {vis.showTagline && meta.schoolTagline?.trim() ? (
        <div className="pc-print-school-tag">{meta.schoolTagline}</div>
      ) : null}
      {vis.showExamTitle ? (
        <div className="pc-print-exam-title-row">
          <span className="pc-print-exam-title-rule" />
          <span className={`pc-print-exam-title pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
            {meta.title}
          </span>
          <span className="pc-print-exam-title-rule" />
        </div>
      ) : null}
      {vis.showExamMeta ? (
        <div className={`pc-print-exam-meta${isHindi ? ' pc-print-is-hindi' : ''}`}>
          <span>
            <strong>{labels.class}</strong> {meta.classLabel}
          </span>
          <span>
            <strong>{labels.subject}</strong> {meta.subject}
          </span>
          <span>
            <strong>{labels.time}</strong> {meta.durationLabel}
          </span>
          <span>
            <strong>{labels.maxMarks}</strong> {meta.totalMarks}
          </span>
        </div>
      ) : null}
    </header>
  )
}
