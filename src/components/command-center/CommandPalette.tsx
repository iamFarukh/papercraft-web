import { m } from 'framer-motion'
import { ArrowDown, ArrowUp, CornerDownLeft, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MotionModal } from '@/components/motion/MotionModal'
import { useAuth } from '@/context/AuthContext'
import { useCommandCenter } from '@/context/CommandCenterContext'
import { useCommandSearch } from '@/hooks/useCommandSearch'
import { rememberCommandVisit } from '@/lib/command-center/search'
import { groupCommandResults } from '@/lib/command-center/search'
import { PC_TRANSITION } from '@/lib/motion/tokens'
import type { CommandResult } from '@/types/command-center'
import { COMMAND_GROUP_LABELS } from '@/types/command-center'

export function CommandPalette() {
  const { open, closePalette } = useCommandCenter()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const uid = user?.uid ?? ''
  const { results, loading } = useCommandSearch({
    query,
    isAdmin,
    userId: uid,
    enabled: open,
  })

  const flatResults = useMemo(() => results, [results])
  const grouped = useMemo(() => groupCommandResults(flatResults), [flatResults])

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, flatResults.length])

  const activate = useCallback(
    (item: CommandResult) => {
      rememberCommandVisit(item)
      closePalette()
      navigate(item.href)
    },
    [closePalette, navigate],
  )

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        closePalette()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, flatResults.length - 1)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter' && flatResults[activeIndex]) {
        e.preventDefault()
        activate(flatResults[activeIndex])
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, flatResults, activeIndex, activate, closePalette])

  let rowOffset = 0

  return (
    <MotionModal
      open={open}
      overlayClassName="pc-cmd-overlay"
      panelClassName="pc-cmd-panel"
      ariaLabelledBy="pc-cmd-title"
      onBackdropClick={closePalette}
    >
      <div className="pc-cmd-palette">
        <div className="pc-cmd-palette-top">
          <Search size={16} strokeWidth={1.6} className="pc-cmd-palette-icon" />
          <input
            ref={inputRef}
            id="pc-cmd-input"
            type="search"
            className="pc-cmd-palette-input"
            placeholder="Search papers, questions, routes, commands…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            aria-label="Command center search"
          />
          <kbd className="pc-cmd-palette-kbd">Esc</kbd>
        </div>

        <div className="pc-cmd-palette-results pc-scroll" role="listbox" aria-label="Results">
          {loading && flatResults.length === 0 ? (
            <p className="pc-cmd-palette-empty">Searching…</p>
          ) : null}

          {!loading && flatResults.length === 0 ? (
            <p className="pc-cmd-palette-empty">No matches. Try a paper title or route name.</p>
          ) : null}

          {[...grouped.entries()].map(([group, items]) => (
            <div key={group} className="pc-cmd-palette-group">
              <div className="pc-cmd-palette-group-label">
                {COMMAND_GROUP_LABELS[group as keyof typeof COMMAND_GROUP_LABELS] ?? group}
              </div>
              <ul className="pc-cmd-palette-list">
                {items.map((item) => {
                  const index = rowOffset
                  rowOffset += 1
                  const isActive = index === activeIndex
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <m.button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={'pc-cmd-palette-row' + (isActive ? ' is-active' : '')}
                        onClick={() => activate(item)}
                        onMouseEnter={() => setActiveIndex(index)}
                        transition={PC_TRANSITION.hover}
                      >
                        <span className="pc-cmd-palette-row-icon" aria-hidden>
                          <Icon size={15} strokeWidth={1.6} />
                        </span>
                        <span className="pc-cmd-palette-row-body">
                          <span className="pc-cmd-palette-row-title">{item.title}</span>
                          <span className="pc-cmd-palette-row-sub">{item.subtitle}</span>
                        </span>
                        <span className="pc-cmd-palette-row-badge">{item.badge}</span>
                      </m.button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <footer className="pc-cmd-palette-foot">
          <span>
            <ArrowUp size={12} strokeWidth={1.6} />
            <ArrowDown size={12} strokeWidth={1.6} />
            Navigate
          </span>
          <span>
            <CornerDownLeft size={12} strokeWidth={1.6} />
            Open
          </span>
          <span>
            <kbd>Esc</kbd>
            Close
          </span>
        </footer>
      </div>
    </MotionModal>
  )
}
