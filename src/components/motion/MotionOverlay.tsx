import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'
import {
  drawerSlideBottom,
  drawerSlideRight,
  overlayFade,
} from '@/lib/motion/variants'

type Placement = 'bottom' | 'right'

type Props = {
  open: boolean
  onClose: () => void
  children: ReactNode
  panelClassName: string
  overlayClassName?: string
  backdropClassName?: string
  placement?: Placement
  ariaLabel: string
}

export function MotionOverlay({
  open,
  onClose,
  children,
  panelClassName,
  overlayClassName = '',
  backdropClassName = '',
  placement = 'bottom',
  ariaLabel,
}: Props) {
  const reduced = useReducedMotion()
  const panelVariants = placement === 'right' ? drawerSlideRight : drawerSlideBottom

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
          aria-label={ariaLabel}
        >
          <motion.button
            type="button"
            className={backdropClassName}
            aria-label="Close"
            variants={overlayFade}
            initial={reduced ? false : 'hidden'}
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          <motion.aside
            className={panelClassName}
            variants={panelVariants}
            initial={reduced ? false : 'hidden'}
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
