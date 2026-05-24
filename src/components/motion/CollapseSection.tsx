import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { collapseReveal } from '@/lib/motion/variants'
import { PC_EASE, PC_TRANSITION } from '@/lib/motion/tokens'

type CollapseBodyProps = {
  open: boolean
  children: ReactNode
  className?: string
}

export function CollapseBody({ open, children, className }: CollapseBodyProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return open ? <div className={className}>{children}</div> : null
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <m.div
          className={className ? `pc-collapse-body ${className}` : 'pc-collapse-body'}
          variants={collapseReveal}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </m.div>
      ) : null}
    </AnimatePresence>
  )
}

type CollapseSectionProps = {
  title: string
  meta?: string
  defaultOpen?: boolean
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/**
 * Animated accordion section — syllabus filters, settings groups, etc.
 */
export function CollapseSection({
  title,
  meta,
  defaultOpen = true,
  children,
  className = 'pc-repo-filter-section',
  bodyClassName,
}: CollapseSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reduced = useReducedMotion()

  return (
    <section className={className}>
      <button
        type="button"
        className="pc-repo-filter-section-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <m.span
          className="pc-collapse-chevron"
          animate={{ rotate: open ? 0 : -90 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: PC_TRANSITION.panel.duration, ease: PC_EASE.out }
          }
          aria-hidden
        >
          <ChevronDown size={14} strokeWidth={1.6} />
        </m.span>
        <span>{title}</span>
        {meta ? <span className="pc-repo-filter-section-meta">{meta}</span> : null}
      </button>
      <CollapseBody open={open} className={bodyClassName ?? 'pc-repo-filter-section-body'}>
        {children}
      </CollapseBody>
    </section>
  )
}
