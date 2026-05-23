import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Loader2, Plus } from 'lucide-react'
import { normalizeDisplayName } from '@/lib/curriculum-normalize'
import type { CreateTaxonomyResult } from '@/services/firebase/curriculum'
import type { TaxonomyOption } from '@/types/curriculum'

type TaxonomyComboboxProps = {
  label: string
  placeholder?: string
  valueId: string
  valueLabel: string
  options: TaxonomyOption[]
  disabled?: boolean
  loading?: boolean
  allowCreate?: boolean
  onSelect: (option: TaxonomyOption) => void
  onCreate?: (name: string) => Promise<CreateTaxonomyResult>
}

export function TaxonomyCombobox({
  label,
  placeholder = 'Search or select…',
  valueId,
  valueLabel,
  options,
  disabled,
  loading,
  allowCreate = false,
  onSelect,
  onCreate,
}: TaxonomyComboboxProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState<TaxonomyOption | null>(null)

  const selected =
    options.find((o) => o.id === valueId) ??
    (valueId && valueLabel ? { id: valueId, label: valueLabel } : null)

  const q = query.trim().toLowerCase()
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(q),
  )

  const normalizedQuery = normalizeDisplayName(query)
  const canCreate =
    allowCreate &&
    onCreate &&
    normalizedQuery.length >= 2 &&
    !options.some((o) => o.label.toLowerCase() === normalizedQuery.toLowerCase())

  useEffect(() => {
    if (!open) {
      setQuery(selected?.label ?? '')
      setHint(null)
      setSuggestion(null)
    }
  }, [open, selected?.label])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  async function handleCreate() {
    if (!onCreate || !canCreate) return
    setCreating(true)
    setHint(null)
    setSuggestion(null)
    const result = await onCreate(normalizedQuery)
    setCreating(false)
    if (result.ok) {
      onSelect(result.option)
      setQuery(result.option.label)
      setOpen(false)
      return
    }
    setHint(result.message)
    if (result.suggestion) setSuggestion(result.suggestion)
  }

  return (
    <div className="pc-author-field pc-taxonomy" ref={rootRef}>
      <label htmlFor={listId}>{label}</label>
      <div className={`pc-taxonomy-control${open ? ' is-open' : ''}`}>
        <input
          id={listId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          disabled={disabled || loading}
          placeholder={placeholder}
          value={open ? query : (selected?.label ?? '')}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setHint(null)
            setSuggestion(null)
          }}
          onFocus={() => {
            setQuery(selected?.label ?? '')
            setOpen(true)
          }}
        />
        <button
          type="button"
          className="pc-taxonomy-chevron"
          tabIndex={-1}
          disabled={disabled || loading}
          onClick={() => setOpen((v) => !v)}
          aria-label={`Toggle ${label}`}
        >
          {loading || creating ? (
            <Loader2 size={14} style={{ animation: 'pc-author-spin 0.8s linear infinite' }} />
          ) : (
            <ChevronDown size={14} strokeWidth={1.6} />
          )}
        </button>

        {open && !disabled && (
          <ul className="pc-taxonomy-list pc-scroll" role="listbox">
            {filtered.length === 0 && !canCreate && (
              <li className="pc-taxonomy-empty">No matches</li>
            )}
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.id === valueId}
                  className={o.id === valueId ? 'is-selected' : undefined}
                  onClick={() => {
                    onSelect(o)
                    setQuery(o.label)
                    setOpen(false)
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {canCreate && (
              <li>
                <button
                  type="button"
                  className="pc-taxonomy-create"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  <Plus size={13} strokeWidth={1.6} />
                  Create &ldquo;{normalizedQuery}&rdquo;
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {hint && <p className="pc-taxonomy-hint is-warn">{hint}</p>}
      {suggestion && (
        <p className="pc-taxonomy-hint">
          Did you mean{' '}
          <button
            type="button"
            className="pc-taxonomy-suggest"
            onClick={() => {
              onSelect(suggestion)
              setQuery(suggestion.label)
              setOpen(false)
              setHint(null)
              setSuggestion(null)
            }}
          >
            {suggestion.label}
          </button>
          ?
        </p>
      )}
    </div>
  )
}
