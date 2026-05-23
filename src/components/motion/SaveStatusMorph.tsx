import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { statusMorph } from '@/lib/motion/variants'
import type { SaveUiStatus } from '@/components/paper-builder/PaperBuilderToolbar'

type Props = {
  saveStatus: SaveUiStatus
  saveHint: string
}

export function SaveStatusMorph({ saveStatus, saveHint }: Props) {
  const reduced = useReducedMotion()

  return (
    <div
      className={`pc-pb-toolbar-saved is-${saveStatus}`}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={`${saveStatus}-${saveHint}`}
          className="pc-pb-toolbar-saved-text"
          initial={reduced ? false : { opacity: 0, y: 2 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -2 }}
          transition={statusMorph}
        >
          {saveHint}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
