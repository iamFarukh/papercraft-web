import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp, MoreHorizontal, Pencil } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPrintLabels, type PaperMedium } from '@/lib/paper-medium'
import type { ResolvedSection } from '@/lib/paper-instance'
import type { SectionPrintSummary } from '@/lib/paper-print-layout'
import { EditorialChip } from './EditorialChip'

type Props = {
  section: ResolvedSection
  summary: SectionPrintSummary
  medium: PaperMedium
  selected: boolean
  formatStyle?: Record<string, string>
  hasFormatOverride?: boolean
  readOnly?: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onSelect: () => void
  onTitleChange: (title: string) => void
  onInstructionsChange: (text: string) => void
  onHide: () => void
  onMove: (dir: 'up' | 'down') => void
}

export function EditablePrintSectionHead({
  section,
  summary,
  medium,
  selected,
  formatStyle,
  hasFormatOverride,
  readOnly,
  canMoveUp,
  canMoveDown,
  onSelect,
  onTitleChange,
  onInstructionsChange: _onInstructionsChange,
  onHide,
  onMove,
}: Props) {
  const labels = getPrintLabels(medium)
  const isHindi = medium === 'hindi'
  const [renaming, setRenaming] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const namePart = section.effectiveTitle.split(' · ')[0]

  useEffect(() => {
    if (!menuOpen) return
    function close(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [menuOpen])

  return (
    <motion.div
      className={`pc-print-section-head pc-ed-block pc-ed-section-head${selected ? ' is-selected' : ''}${hasFormatOverride ? ' has-format-override' : ''}`}
      style={formatStyle as React.CSSProperties}
      data-ed-kind="section"
      data-section-id={section.id}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      initial={false}
      animate={{
        backgroundColor: selected ? 'rgba(53, 92, 255, 0.04)' : 'rgba(255,255,255,0)',
      }}
      transition={{ duration: 0.15 }}
    >
      <div className="pc-ed-section-head-main">
        <h3 className={`pc-print-section-title pc-serif${isHindi ? ' pc-print-is-hindi' : ''}`}>
          {labels.section} {section.letter}{' '}
          <em>
            ·{' '}
            {renaming && !readOnly ? (
              <input
                type="text"
                className="pc-ed-title-input"
                autoFocus
                defaultValue={namePart}
                onClick={(e) => e.stopPropagation()}
                onBlur={(e) => {
                  onTitleChange(e.target.value)
                  setRenaming(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') setRenaming(false)
                }}
              />
            ) : (
              namePart
            )}
          </em>
        </h3>
        <span className="pc-print-section-marks">
          <span className="pc-num">{summary.questionCount}</span> Q ·{' '}
          <span className="pc-num">{summary.totalMarks}</span> {labels.marksUnit}
        </span>
      </div>

      {!readOnly ? (
        <div className="pc-ed-section-toolbar">
          <EditorialChip onClick={() => setRenaming(true)}>
            <Pencil size={11} strokeWidth={1.6} />
            Rename
          </EditorialChip>
          <EditorialChip disabled={!canMoveUp} onClick={() => canMoveUp && onMove('up')}>
            <ChevronUp size={11} strokeWidth={1.6} />
          </EditorialChip>
          <EditorialChip disabled={!canMoveDown} onClick={() => canMoveDown && onMove('down')}>
            <ChevronDown size={11} strokeWidth={1.6} />
          </EditorialChip>
          <div className="pc-ed-menu-wrap" ref={menuRef}>
            <EditorialChip onClick={() => setMenuOpen((v) => !v)}>
              <MoreHorizontal size={12} strokeWidth={1.6} />
            </EditorialChip>
            {menuOpen ? (
              <div className="pc-ed-popover pc-ed-popover--menu">
                <button type="button" onClick={() => { onHide(); setMenuOpen(false) }}>
                  Hide section
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </motion.div>
  )
}

export function EditablePrintSectionInstructions({
  section,
  medium,
  selected,
  readOnly,
  onSelect,
  onInstructionsChange,
}: {
  section: ResolvedSection
  medium: PaperMedium
  selected: boolean
  readOnly?: boolean
  onSelect: () => void
  onInstructionsChange: (text: string) => void
}) {
  const isHindi = medium === 'hindi'
  const [editing, setEditing] = useState(false)

  return (
    <div
      className={`pc-ed-section-instr-wrap${selected ? ' is-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {editing && !readOnly ? (
        <textarea
          className={`pc-print-section-instructions pc-ed-instr-input${isHindi ? ' pc-print-is-hindi' : ''}`}
          rows={2}
          autoFocus
          defaultValue={section.effectiveInstructions}
          onClick={(e) => e.stopPropagation()}
          onBlur={(e) => {
            onInstructionsChange(e.target.value)
            setEditing(false)
          }}
        />
      ) : (
        <p
          className={`pc-print-section-instructions pc-ed-instr-view${isHindi ? ' pc-print-is-hindi' : ''}`}
          onDoubleClick={() => !readOnly && setEditing(true)}
        >
          {section.effectiveInstructions}
        </p>
      )}
      {selected && !readOnly && !editing ? (
        <button
          type="button"
          className="pc-ed-add-note"
          onClick={(e) => {
            e.stopPropagation()
            setEditing(true)
          }}
        >
          Edit instructions
        </button>
      ) : null}
    </div>
  )
}
