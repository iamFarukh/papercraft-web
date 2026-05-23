import { useState } from 'react'
import { Check, Pencil, X } from 'lucide-react'
import type { ImportField } from '@/lib/bulk-import/fields'
import { FIELD_LABELS } from '@/lib/bulk-import/fields'

const EDITABLE_FIELDS: ImportField[] = [
  'questionTextEn',
  'questionTextHi',
  'questionType',
  'class',
  'subject',
  'chapter',
  'topic',
  'difficulty',
  'marks',
  'answer',
  'correctOption',
]

type Props = {
  rowNumber: number
  raw: Record<string, string>
  mapping: Partial<Record<ImportField, string>>
  onSave: (rowNumber: number, patch: Record<string, string>) => void
}

export function ImportRowEditor({ rowNumber, raw, mapping, onSave }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  function startEdit() {
    const initial: Record<string, string> = {}
    for (const field of EDITABLE_FIELDS) {
      const col = mapping[field]
      if (col) initial[col] = raw[col] ?? ''
    }
    setDraft(initial)
    setOpen(true)
  }

  function save() {
    onSave(rowNumber, draft)
    setOpen(false)
  }

  if (!open) {
    return (
      <button type="button" className="pc-btn is-sm pc-csv-row-edit-btn" onClick={startEdit}>
        <Pencil size={11} strokeWidth={1.6} />
        Edit row
      </button>
    )
  }

  return (
    <div className="pc-csv-row-editor">
      <div className="pc-csv-row-editor-head">
        <span className="pc-csv-kicker">Fix row {rowNumber}</span>
        <button type="button" className="pc-btn is-sm is-ghost" onClick={() => setOpen(false)}>
          <X size={11} />
        </button>
      </div>
      <div className="pc-csv-row-editor-fields">
        {EDITABLE_FIELDS.map((field) => {
          const col = mapping[field]
          if (!col) return null
          return (
            <label key={field} className="pc-csv-row-editor-field">
              <span>{FIELD_LABELS[field]}</span>
              <input
                className="pc-csv-row-editor-input"
                value={draft[col] ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, [col]: e.target.value }))
                }
              />
            </label>
          )
        })}
      </div>
      <button type="button" className="pc-btn is-sm is-primary" onClick={save}>
        <Check size={11} strokeWidth={1.6} />
        Apply &amp; re-validate
      </button>
    </div>
  )
}
