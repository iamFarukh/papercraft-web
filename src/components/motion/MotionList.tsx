import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { listItemReveal, listReveal } from '@/lib/motion/variants'

type ListProps = {
  children: ReactNode
  className?: string
  as?: 'ul' | 'div'
}

export function MotionList({ children, className, as = 'div' }: ListProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      variants={listReveal}
      initial={reduced ? false : 'hidden'}
      animate="visible"
    >
      {children}
    </Tag>
  )
}

type ItemProps = {
  children: ReactNode
  className?: string
  as?: 'li' | 'div'
}

export function MotionListItem({ children, className, as = 'li' }: ItemProps) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={listItemReveal}>
      {children}
    </Tag>
  )
}
