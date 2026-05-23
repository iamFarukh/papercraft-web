import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { modalPop, overlayFade } from '@/lib/motion/variants'

type Props = {
  open: boolean
  children: ReactNode
  overlayClassName: string
  panelClassName: string
  ariaLabelledBy?: string
  onBackdropClick?: () => void
}

export function MotionModal({
  open,
  children,
  overlayClassName,
  panelClassName,
  ariaLabelledBy,
  onBackdropClick,
}: Props) {
  const reduced = useReducedMotion()

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={overlayClassName}
          variants={overlayFade}
          initial={reduced ? false : 'hidden'}
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
        >
          <button
            type="button"
            className="pc-repo-drawer-backdrop"
            aria-label="Cancel"
            onClick={onBackdropClick}
          />
          <motion.div
            className={panelClassName}
            variants={modalPop}
            initial={reduced ? false : 'hidden'}
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
