import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeInSoft } from '@/lib/motion/variants'

type Props = {
  children: ReactNode
  className?: string
}

/** Opacity fade for skeleton → content without layout shift. */
export function FadeIn({ children, className }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={className}
      variants={fadeInSoft}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      {children}
    </motion.div>
  )
}
