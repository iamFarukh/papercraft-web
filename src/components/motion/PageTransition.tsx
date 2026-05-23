import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeInUp } from '@/lib/motion/variants'

type Props = {
  children: ReactNode
  motionKey: string
}

export function PageTransition({ children, motionKey }: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={motionKey}
      data-page={motionKey}
      className="pc-page-motion"
      variants={fadeInUp}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      exit={reduced ? undefined : 'exit'}
    >
      {children}
    </motion.div>
  )
}
