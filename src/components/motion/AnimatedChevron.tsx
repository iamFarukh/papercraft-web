import { m, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PC_EASE, PC_TRANSITION } from '@/lib/motion/tokens'

type Props = {
  open: boolean
  /** 0 = down when open; 180 = flip for trigger buttons */
  flip?: boolean
  size?: number
  className?: string
}

export function AnimatedChevron({
  open,
  flip = false,
  size = 14,
  className,
}: Props) {
  const reduced = useReducedMotion()
  const closed = flip ? 0 : -90
  const opened = flip ? 180 : 0

  return (
    <m.span
      className={className ?? 'pc-collapse-chevron'}
      animate={{ rotate: open ? opened : closed }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: PC_TRANSITION.panel.duration, ease: PC_EASE.out }
      }
      aria-hidden
    >
      <ChevronDown size={size} strokeWidth={1.6} />
    </m.span>
  )
}
