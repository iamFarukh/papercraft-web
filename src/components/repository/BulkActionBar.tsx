import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Archive, Lock, RotateCcw, Send, Trash2, X } from 'lucide-react'
import {
  bulkBarActionItem,
  bulkBarActions,
  bulkBarReveal,
} from '@/lib/motion/variants'
import { PC_DURATION, PC_EASE } from '@/lib/motion/tokens'

type BulkActionBarProps = {
  count: number
  disabled?: boolean
  trashMode?: boolean
  onClear: () => void
  onPublish?: () => void
  onArchive?: () => void
  onLock?: () => void
  onDelete?: () => void
  onRestore?: () => void
}

export function BulkActionBar({
  count,
  disabled = false,
  trashMode = false,
  onClear,
  onPublish,
  onArchive,
  onLock,
  onDelete,
  onRestore,
}: BulkActionBarProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="pc-repo-bulk"
      role="toolbar"
      aria-label="Bulk actions"
      variants={bulkBarReveal}
      initial={reduceMotion ? false : 'hidden'}
      animate="visible"
      exit={reduceMotion ? undefined : 'exit'}
    >
      <motion.div
        className="pc-repo-bulk-inner"
        layout={!reduceMotion}
        transition={{ layout: { duration: PC_DURATION.normal, ease: PC_EASE.out } }}
      >
        <span className="pc-repo-bulk-count">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.strong
              key={count}
              className="pc-num pc-repo-bulk-count-num"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: PC_DURATION.fast, ease: PC_EASE.out }}
            >
              {count}
            </motion.strong>
          </AnimatePresence>
          {' selected'}
          {trashMode && <span className="pc-repo-bulk-trash-label"> · Trash</span>}
        </span>

        <motion.div
          className="pc-repo-bulk-actions"
          variants={reduceMotion ? undefined : bulkBarActions}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          {trashMode ? (
            <motion.div variants={reduceMotion ? undefined : bulkBarActionItem}>
              <button
                type="button"
                className="pc-btn is-sm is-primary"
                disabled={disabled}
                onClick={onRestore}
              >
                <RotateCcw size={13} strokeWidth={1.6} />
                {disabled ? 'Restoring…' : 'Restore'}
              </button>
            </motion.div>
          ) : (
            <>
              <motion.div variants={reduceMotion ? undefined : bulkBarActionItem}>
                <button
                  type="button"
                  className="pc-btn is-sm is-ghost"
                  disabled={disabled}
                  onClick={onPublish}
                >
                  <Send size={13} strokeWidth={1.6} />
                  {disabled ? 'Updating…' : 'Publish'}
                </button>
              </motion.div>
              <motion.div variants={reduceMotion ? undefined : bulkBarActionItem}>
                <button
                  type="button"
                  className="pc-btn is-sm is-ghost"
                  disabled={disabled}
                  onClick={onArchive}
                >
                  <Archive size={13} strokeWidth={1.6} />
                  Archive
                </button>
              </motion.div>
              <motion.div variants={reduceMotion ? undefined : bulkBarActionItem}>
                <button
                  type="button"
                  className="pc-btn is-sm is-ghost"
                  disabled={disabled}
                  onClick={onLock}
                >
                  <Lock size={13} strokeWidth={1.6} />
                  Lock
                </button>
              </motion.div>
              <motion.div variants={reduceMotion ? undefined : bulkBarActionItem}>
                <button
                  type="button"
                  className="pc-btn is-sm is-outline is-danger"
                  disabled={disabled}
                  onClick={onDelete}
                >
                  <Trash2 size={13} strokeWidth={1.6} />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.button
          type="button"
          className="pc-repo-bulk-clear"
          onClick={onClear}
          aria-label="Clear selection"
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          transition={{ duration: PC_DURATION.instant }}
        >
          <X size={14} strokeWidth={1.6} />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
