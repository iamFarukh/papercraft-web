import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { AnimatePresence, m } from 'framer-motion'
import { AnimatedChevron } from '@/components/motion'
import { dropdownReveal } from '@/lib/motion/variants'

export type QuickFilterOption = {
  value: string
  label: string
  on: boolean
  count?: number
}

type Props = {
  classOptions: QuickFilterOption[]
  subjectOptions: QuickFilterOption[]
  onToggleClass: (value: string) => void
  onToggleSubject: (value: string) => void
}

/** Slim top row of the most-used filters (Class, Subject) — apply instantly. */
export function RepositoryQuickFilters({
  classOptions,
  subjectOptions,
  onToggleClass,
  onToggleSubject,
}: Props) {
  if (classOptions.length === 0 && subjectOptions.length === 0) return null

  return (
    <div className="pc-repo-quick" role="group" aria-label="Quick filters">
      <span className="pc-repo-quick-label">Filter</span>
      {classOptions.length > 0 ? (
        <QuickMultiSelect
          name="Class"
          allLabel="All classes"
          options={classOptions}
          onToggle={onToggleClass}
        />
      ) : null}
      {subjectOptions.length > 0 ? (
        <QuickMultiSelect
          name="Subject"
          allLabel="All subjects"
          options={subjectOptions}
          onToggle={onToggleSubject}
        />
      ) : null}
    </div>
  )
}

function QuickMultiSelect({
  name,
  allLabel,
  options,
  onToggle,
}: {
  name: string
  allLabel: string
  options: QuickFilterOption[]
  onToggle: (value: string) => void
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const onCount = useMemo(() => options.filter((o) => o.on).length, [options])
  const allOn = onCount === options.length
  const noneOn = onCount === 0

  const summary = allOn
    ? allLabel
    : noneOn
      ? `No ${name.toLowerCase()}`
      : onCount === 1
        ? (options.find((o) => o.on)?.label ?? `1 ${name.toLowerCase()}`)
        : `${onCount} ${name.toLowerCase()}s`

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="pc-repo-quick-select" ref={rootRef}>
      <button
        type="button"
        className={
          'pc-repo-quick-trigger' +
          (open ? ' is-open' : '') +
          (!allOn ? ' is-active' : '')
        }
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
      >
        <span className="pc-repo-quick-name">{name}</span>
        <span className="pc-repo-quick-summary">{summary}</span>
        <AnimatedChevron open={open} flip className="pc-repo-quick-chevron" />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <m.ul
            className="pc-repo-quick-menu pc-scroll"
            id={listId}
            role="listbox"
            aria-label={name}
            variants={dropdownReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={opt.on}
                  className={'pc-repo-quick-option' + (opt.on ? ' is-on' : '')}
                  onClick={() => onToggle(opt.value)}
                >
                  <span className="pc-repo-quick-check" aria-hidden>
                    {opt.on ? <Check size={12} strokeWidth={2} /> : null}
                  </span>
                  <span className="pc-repo-quick-option-label">{opt.label}</span>
                  {typeof opt.count === 'number' ? (
                    <span className="pc-repo-quick-count pc-num">{opt.count}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </m.ul>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
