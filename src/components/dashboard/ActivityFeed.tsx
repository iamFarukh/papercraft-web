import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import type { ActivityRow } from '@/lib/control-center'
import { listItemReveal, listReveal } from '@/lib/motion/variants'

type Props = {
  loading: boolean
  error: string | null
  activities: ActivityRow[]
}

export function ActivityFeed({ loading, error, activities }: Props) {
  return (
    <section className="pc-panel pc-panel-pad pc-activity-panel">
      <header className="pc-section-head">
        <div>
          <h2 className="pc-serif pc-section-title">Recent papers</h2>
          <p className="pc-section-sub">
            Latest updates across draft, submitted, and approved papers
          </p>
        </div>
      </header>

      {loading ? (
        <ul className="pc-activity-list" aria-busy>
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="pc-activity-item">
              <div className="pc-skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div className="pc-skeleton" style={{ height: 12, width: '80%', marginBottom: 8 }} />
                <div className="pc-skeleton" style={{ height: 10, width: '45%' }} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {!loading && error ? (
        <p className="pc-section-sub">{error}</p>
      ) : null}

      {!loading && !error && activities.length === 0 ? (
        <p className="pc-section-sub" style={{ margin: 0 }}>
          No paper activity yet. Create a draft in Paper Builder to get started.
        </p>
      ) : null}

      {!loading && !error && activities.length > 0 ? (
        <FadeIn>
        <motion.ul
          className="pc-activity-list"
          variants={listReveal}
          initial="hidden"
          animate="visible"
        >
          {activities.map((item, index) => (
            <motion.li
              key={item.id}
              className="pc-activity-item pc-motion-surface"
              variants={listItemReveal}
              style={
                index === activities.length - 1
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
                  {item.meta ? (
                    <>
                      <span className="pc-activity-meta-sep" aria-hidden>
                        ·
                      </span>
                      <span className="pc-activity-meta">{item.meta}</span>
                    </>
                  ) : null}
                  {item.tag ? (
                    <span className={`pc-tag ${item.tagTone ?? ''}`}>{item.tag}</span>
                  ) : null}
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
        </FadeIn>
      ) : null}
    </section>
  )
}
