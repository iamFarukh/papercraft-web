import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  className?: string
  as?: 'button' | 'span'
}

export function EditorialChip({
  children,
  onClick,
  active,
  disabled,
  title,
  className = '',
  as = 'button',
}: Props) {
  const cls = `pc-ed-chip${active ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}${className ? ` ${className}` : ''}`

  if (as === 'span') {
    return (
      <motion.span
        className={cls}
        title={title}
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.14 }}
      >
        {children}
      </motion.span>
    )
  }

  return (
    <motion.button
      type="button"
      className={cls}
      title={title}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onClick?.()
      }}
      initial={false}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
    >
      {children}
    </motion.button>
  )
}
