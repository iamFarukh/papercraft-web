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

/** Bulk action bar — slides in, no bounce. */
export const bulkBarReveal: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -4,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      height: { duration: PC_DURATION.normal, ease: PC_EASE.out },
      opacity: { duration: PC_DURATION.fast, ease: PC_EASE.out },
      y: { duration: PC_DURATION.normal, ease: PC_EASE.out },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -4,
    transition: {
      height: { duration: PC_DURATION.fast, ease: PC_EASE.inOut },
      opacity: { duration: PC_DURATION.fast, ease: PC_EASE.out },
      y: { duration: PC_DURATION.fast, ease: PC_EASE.out },
    },
  },
}

export const bulkBarActions: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: PC_DURATION.instant },
  },
}

export const bulkBarActionItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: PC_DURATION.fast, ease: PC_EASE.out },
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

/** Shared layout transition for repository grid ↔ list morph. */
export const layoutMorphTransition: Transition = {
  layout: {
    type: 'spring',
    stiffness: 340,
    damping: 38,
    mass: 0.88,
  },
}

/** English question body — shared element anchor between grid and list. */
export const repoSharedBodyTransition: Transition = {
  layout: {
    type: 'spring',
    stiffness: 380,
    damping: 42,
    mass: 0.75,
  },
}

export const layoutMorphContent: Transition = {
  duration: PC_TRANSITION.layoutMorph.duration,
  ease: PC_TRANSITION.layoutMorph.ease,
}

/** Accordion / filter section body — height + opacity, no bounce. */
export const collapseReveal: Variants = {
  hidden: {
    height: 0,
    opacity: 0,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: PC_DURATION.normal, ease: PC_EASE.out },
      opacity: { duration: PC_DURATION.fast, ease: PC_EASE.out },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: PC_DURATION.fast, ease: PC_EASE.inOut },
      opacity: { duration: PC_DURATION.instant, ease: PC_EASE.out },
    },
  },
}

/** In-flow dropdown panels (topic picker, menus). */
export const dropdownReveal: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -4,
  },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: {
      height: { duration: PC_DURATION.normal, ease: PC_EASE.out },
      opacity: { duration: PC_DURATION.fast, ease: PC_EASE.out },
      y: { duration: PC_DURATION.normal, ease: PC_EASE.out },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -2,
    transition: {
      height: { duration: PC_DURATION.fast, ease: PC_EASE.inOut },
      opacity: { duration: PC_DURATION.instant, ease: PC_EASE.out },
      y: { duration: PC_DURATION.fast, ease: PC_EASE.out },
    },
  },
}

/** Floating combobox / taxonomy menus (absolute positioned). */
export const popoverReveal: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: PC_DURATION.normal,
      ease: PC_EASE.out,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.99,
    transition: {
      duration: PC_DURATION.fast,
      ease: PC_EASE.out,
    },
  },
}
