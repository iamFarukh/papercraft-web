import { motion } from 'framer-motion'
import { ACTIVITY_ITEMS } from '@/data/control-center-mock'

const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.15,
    },
  },
}

const listItemVariants = {
  hidden: { x: -8, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 110,
      damping: 15,
    },
  },
}

export function ActivityFeed() {
  return (
    <section className="pc-panel pc-panel-pad pc-activity-panel">
      <header className="pc-section-head">
        <div>
          <h2 className="pc-serif pc-section-title">Recent Activity</h2>
          <p className="pc-section-sub">
            Submissions, approvals, uploads, and curriculum changes
          </p>
        </div>
        <span className="pc-activity-live">
          <span className="pc-activity-live-dot" aria-hidden />
          Live feed
        </span>
      </header>

      <motion.ul
        className="pc-activity-list"
        variants={listContainerVariants}
        initial="hidden"
        animate="show"
      >
        {ACTIVITY_ITEMS.map((item, index) => (
          <motion.li
            key={item.id}
            className="pc-activity-item"
            variants={listItemVariants}
            whileHover={{
              x: 4,
              transition: { duration: 0.15 },
            }}
            style={
              index === ACTIVITY_ITEMS.length - 1
                ? { borderBottom: 'none' }
                : undefined
            }
          >
            <span className={`pc-avatar ${item.avatarClass} pc-activity-av`}>
              {item.avatar}
            </span>
            <div className="pc-activity-body">
              <p className="pc-activity-summary">
                <strong>{item.name}</strong> {item.action}{' '}
                <span className="pc-activity-target">{item.target}</span>
              </p>
              <div className="pc-activity-meta-row">
                <time className="pc-activity-time">{item.time}</time>
                {item.meta && (
                  <>
                    <span className="pc-activity-meta-sep" aria-hidden>
                      ·
                    </span>
                    <span className="pc-activity-meta">{item.meta}</span>
                  </>
                )}
                {item.tag && (
                  <span className={`pc-tag ${item.tagTone ?? ''}`}>{item.tag}</span>
                )}
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}

