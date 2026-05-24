import { Check } from 'lucide-react'
import { sectionLetter, structurePreviewLine } from '@/lib/blueprint-utils'
import type { BlueprintSection } from '@/types/blueprint'

type PreviewProps = {
  sections: BlueprintSection[]
  totalMarks: number
  compact?: boolean
}

export function BlueprintStructurePreview({ sections, totalMarks, compact }: PreviewProps) {
  return (
    <div className={`pc-bp-structure-preview ${compact ? 'is-compact' : ''}`}>
      <div className="pc-bp-structure-preview-head">
        <span className="pc-bp-structure-preview-kicker">Academic structure</span>
        {!compact ? (
          <span className="pc-bp-structure-preview-total pc-num">
            {totalMarks} marks · {sections.length} sections
          </span>
        ) : null}
      </div>
      <ul className="pc-bp-structure-preview-list">
        {sections.map((section, index) => (
          <li key={section.id} className="pc-bp-structure-preview-item">
            <span className="pc-bp-structure-preview-letter pc-serif">
              {sectionLetter(index)}
            </span>
            <div className="pc-bp-structure-preview-body">
              <span className="pc-bp-structure-preview-title pc-serif">
                {section.title}
              </span>
              <span className="pc-bp-structure-preview-line">
                {structurePreviewLine(section)}
              </span>
              {section.internalChoice?.enabled ? (
                <span className="pc-bp-structure-preview-choice">
                  Internal choice
                  {section.internalChoice.attemptCount
                    ? ` · ${section.internalChoice.attemptCount} of ${section.questionCount}`
                    : ''}
                </span>
              ) : null}
            </div>
            <span className="pc-bp-structure-preview-marks pc-num">
              {section.marksAllocation}m
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

type StepProps = {
  step: 1 | 2 | 3 | 4
}

const STEPS = [
  ['Basics', 'Identity & academic context'],
  ['Structure', 'Sections & marks distribution'],
  ['Syllabus', 'Chapter weighting & difficulty'],
  ['Review', 'Confirm & save'],
] as const

export function BlueprintStepStrip({ step }: StepProps) {
  return (
    <div className="pc-bp-step-strip" aria-label={`Step ${step} of 4`}>
      {STEPS.map(([name, hint], index) => {
        const n = index + 1
        const done = n < step
        const active = n === step
        return (
          <div key={name} className={`pc-bp-step-group ${done ? 'is-done' : ''}`}>
            <div
              className={`pc-bp-step ${done ? 'is-done' : ''} ${active ? 'is-active' : ''}`}
            >
              <span className="pc-bp-step-num" aria-hidden>
                {done ? <Check size={12} strokeWidth={2} /> : n}
              </span>
              <div className="pc-bp-step-copy">
                <span className="pc-bp-step-name">{name}</span>
                <span className="pc-bp-step-hint">{hint}</span>
              </div>
            </div>
            {index < STEPS.length - 1 ? (
              <div className={`pc-bp-step-line ${done ? 'is-done' : ''}`} aria-hidden />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

type DifficultyProps = {
  mix: { easy: number; medium: number; hard: number }
  compact?: boolean
}

export function BlueprintDifficultyBar({ mix, compact }: DifficultyProps) {
  const rows = [
    ['Easy', mix.easy, 'var(--pc-success)'],
    ['Medium', mix.medium, 'var(--pc-primary)'],
    ['Hard', mix.hard, 'var(--pc-warning)'],
  ] as const

  return (
    <div className={`pc-bp-difficulty ${compact ? 'is-compact' : ''}`}>
      {rows.map(([label, value, color]) => (
        <div key={label} className="pc-bp-difficulty-row">
          <div className="pc-bp-difficulty-label">
            <span className="pc-bp-difficulty-dot" style={{ background: color }} />
            <span>{label}</span>
            <span className="pc-bp-difficulty-pct pc-num">{value}%</span>
          </div>
          <div className="pc-bp-difficulty-track">
            <span
              className="pc-bp-difficulty-fill"
              style={{ width: `${value}%`, background: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
