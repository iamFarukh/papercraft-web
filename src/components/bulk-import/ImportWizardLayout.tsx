import type { ReactNode } from 'react'
import { Check, Upload } from 'lucide-react'

export type ImportStepId = 'upload' | 'mapping' | 'preview' | 'summary' | 'complete'

const STEPS: { id: ImportStepId; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'mapping', label: 'Map columns' },
  { id: 'preview', label: 'Validate' },
  { id: 'summary', label: 'Summary' },
  { id: 'complete', label: 'Complete' },
]

function ImportStepper({ current }: { current: ImportStepId }) {
  const idx = STEPS.findIndex((s) => s.id === current)
  return (
    <div className="pc-csv-stepper" aria-label="Import progress">
      {STEPS.map((s, i) => {
        const isCur = s.id === current
        const isDone = i < idx
        return (
          <div key={s.id} className="pc-csv-stepper-item-wrap">
            <div
              className={
                'pc-csv-stepper-item' +
                (isCur ? ' is-active' : '') +
                (isDone ? ' is-done' : '')
              }
            >
              <span className="pc-csv-stepper-num pc-num" aria-hidden>
                {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
              </span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className={
                  'pc-csv-stepper-line' + (i < idx ? ' is-done' : '')
                }
                aria-hidden
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

type ImportWizardLayoutProps = {
  step: ImportStepId
  fileName?: string
  fileMeta?: string
  footer?: ReactNode
  children: ReactNode
}

export function ImportWizardLayout({
  step,
  fileName,
  fileMeta,
  footer,
  children,
}: ImportWizardLayoutProps) {
  if (step === 'complete') {
    return <div className="pc-csv-wizard pc-csv-wizard--done">{children}</div>
  }

  return (
    <div className="pc-csv-wizard">
      <div className="pc-csv-wizard-bar">
        <div className="pc-csv-wizard-bar-title">
          <span className="pc-csv-wizard-icon" aria-hidden>
            <Upload size={14} strokeWidth={1.6} />
          </span>
          <div>
            <div className="pc-csv-wizard-heading pc-serif">
              Bulk Import
              {fileName && (
                <>
                  {' '}
                  ·{' '}
                  <em className="pc-csv-wizard-file">{fileName}</em>
                </>
              )}
            </div>
            <p className="pc-csv-wizard-sub">
              {fileMeta ??
                'Upload a CSV or spreadsheet — questions publish to the repository and are tagged with your file name.'}
            </p>
          </div>
        </div>
        <ImportStepper current={step} />
      </div>

      <div className="pc-csv-wizard-body pc-scroll">{children}</div>

      {footer && <footer className="pc-csv-wizard-foot">{footer}</footer>}
    </div>
  )
}

export function ImportWizardFooter({
  left,
  right,
}: {
  left?: ReactNode
  right: ReactNode
}) {
  return (
    <>
      <div className="pc-csv-foot-left">{left}</div>
      <div className="pc-csv-foot-right">{right}</div>
    </>
  )
}
