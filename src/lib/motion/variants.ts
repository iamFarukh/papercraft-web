import type { Transition, Variants } from 'framer-motion'
import { PC_DURATION, PC_EASE, PC_TRANSITION } from './tokens'

export const fadeInSoft: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: PC_TRANSITION.fade,
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: PC_TRANSITION.page,
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: PC_DURATION.fast, ease: PC_EASE.out },
  },
}

export const overlayFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: PC_TRANSITION.fade },
  exit: { opacity: 0, transition: PC_TRANSITION.fade },
}

export const drawerSlideBottom: Variants = {
  hidden: { y: '100%', opacity: 0.94 },
  visible: {
    y: 0,
    opacity: 1,
    transition: PC_TRANSITION.panel,
  },
  exit: {
    y: '100%',
    opacity: 0.94,
    transition: PC_TRANSITION.panel,
  },
}

export const drawerSlideRight: Variants = {
  hidden: { x: '100%', opacity: 0.96 },
  visible: {
    x: 0,
    opacity: 1,
    transition: PC_TRANSITION.panel,
  },
  exit: {
    x: '100%',
    opacity: 0.96,
    transition: PC_TRANSITION.panel,
  },
}

export const modalPop: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: PC_TRANSITION.panel,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 4,
    transition: PC_TRANSITION.fade,
  },
}

export const listReveal: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.04,
    },
  },
}

export const listItemReveal: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: PC_DURATION.fast, ease: PC_EASE.out },
  },
}

export const toolbarTransition: Variants = {
  hidden: { opacity: 0, y: -3 },
  visible: {
    opacity: 1,
    y: 0,
    transition: PC_TRANSITION.fade,
  },
}

export const subtleScale: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.98 },
}

export const panelFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: PC_DURATION.normal, ease: PC_EASE.out },
  },
}

export const statusMorph: Transition = PC_TRANSITION.status

export const builderBlockEnter: Transition = {
  duration: PC_DURATION.slow,
  ease: PC_EASE.out,
}
