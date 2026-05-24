import { AnimatePresence, m } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'
import type { ProfileSaveState } from '@/hooks/useProfileEditor'
import { PC_TRANSITION } from '@/lib/motion/tokens'

type Props = {
  state: ProfileSaveState
  savedAt: number | null
  error: string | null
}

function relativeSavedLabel(savedAt: number): string {
  const sec = Math.floor((Date.now() - savedAt) / 1000)
  if (sec < 8) return 'Saved just now'
  if (sec < 60) return `Saved ${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `Saved ${min}m ago`
  return 'Saved'
}

export function ProfileSaveStatus({ state, savedAt, error }: Props) {
  const label =
    state === 'pending'
      ? 'Unsaved changes'
      : state === 'saving'
        ? 'Saving…'
        : state === 'saved' && savedAt
          ? relativeSavedLabel(savedAt)
          : state === 'error'
            ? error ?? 'Could not save'
            : null

  return (
    <AnimatePresence mode="wait">
      {label ? (
        <m.span
          key={label}
          className={`pc-profile-save is-${state}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -2 }}
          transition={PC_TRANSITION.status}
        >
          {state === 'saving' ? (
            <Loader2 size={12} strokeWidth={1.6} className="pc-profile-save-spin" />
          ) : state === 'saved' ? (
            <Check size={12} strokeWidth={1.6} />
          ) : null}
          {label}
        </m.span>
      ) : null}
    </AnimatePresence>
  )
}
