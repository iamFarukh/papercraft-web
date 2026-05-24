/** PaperCraft motion timing — calm, fast, operational. */
export const PC_DURATION = {
  instant: 0.12,
  fast: 0.16,
  normal: 0.2,
  slow: 0.22,
} as const

/** Standard easing (no bounce). */
export const PC_EASE = {
  out: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  inOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const

export const PC_TRANSITION = {
  fade: { duration: PC_DURATION.fast, ease: PC_EASE.out },
  panel: { duration: PC_DURATION.normal, ease: PC_EASE.out },
  page: { duration: PC_DURATION.normal, ease: PC_EASE.out },
  hover: { duration: PC_DURATION.fast, ease: PC_EASE.out },
  status: { duration: PC_DURATION.instant, ease: PC_EASE.out },
  /** Grid ↔ list card morph — smooth deceleration, no bounce. */
  layoutMorph: {
    duration: 0.38,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
} as const
