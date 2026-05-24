import type { PaperComposition, PaperSectionDef, PaperSectionId } from '@/lib/paper-builder'

type Props = {
  sections: PaperSectionDef[]
  composition: PaperComposition
  activeSection: PaperSectionId
  onSelect: (id: PaperSectionId) => void
  disabled?: boolean
}

/** Choose which section receives the next question from the repository. */
export function SectionSwitcher({
  sections,
  composition,
  activeSection,
  onSelect,
  disabled = false,
}: Props) {
  return (
    <div
      className="pc-pb-section-switcher"
      role="tablist"
      aria-label="Target section for new questions"
    >
      {sections.map((section) => {
        const count = composition[section.id].length
        const isActive = activeSection === section.id
        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            className={`pc-pb-section-switch${isActive ? ' is-active' : ''}`}
            onClick={() => onSelect(section.id)}
          >
            <span className="pc-pb-section-switch-letter">Section {section.letter}</span>
            <span className="pc-pb-section-switch-count pc-num">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
