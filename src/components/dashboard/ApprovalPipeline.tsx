import { useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PIPELINE_STAGES } from '@/data/control-center-mock'
import { ApprovalDrawer } from './ApprovalDrawer'

type PaperItem = {
  title: string
  detail: string
  initials: string
  avatar: string
}

const pipelineContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
}

const stageVariants = {
  hidden: { y: 15, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 90,
      damping: 14,
    },
  },
}

export function ApprovalPipeline() {
  const [selectedPaper, setSelectedPaper] = useState<PaperItem | null>(null)
  const [stageMeta, setStageMeta] = useState<{ name: string; accent: string } | null>(null)

  return (
    <section className="pc-panel pc-panel-pad pc-pipeline-panel">
      <header className="pc-section-head">
        <div>
          <h2 className="pc-serif pc-section-title">Approval Pipeline</h2>
          <p className="pc-section-sub">Term II · all examinations · institutional workflow</p>
        </div>
        <div className="pc-pipeline-summary pc-num">
          <span className="pc-pipeline-summary-value">66</span>
          <span className="pc-pipeline-summary-label">papers in flow</span>
        </div>
      </header>

      <motion.div
        className="pc-pipeline-flow"
        variants={pipelineContainerVariants}
        initial="hidden"
        animate="show"
      >
        {PIPELINE_STAGES.map((stage, index) => (
          <div key={stage.key} className="pc-pipeline-stage-wrap">
            {index > 0 && (
              <div className="pc-pipeline-connector" aria-hidden>
                <span className="pc-pipeline-connector-line" />
              </div>
            )}
            <motion.div
              className="pc-pipeline-stage"
              variants={stageVariants}
              whileHover={{
                boxShadow: 'var(--pc-shadow-md)',
                borderColor: 'var(--pc-line-2)',
                transition: { duration: 0.2 },
              }}
              style={{ '--stage-accent': stage.accent } as CSSProperties}
            >
              <div className="pc-pipeline-stage-head">
                <span className="pc-pipeline-stage-name">{stage.name}</span>
                <span
                  className="pc-pipeline-stage-dot"
                  style={{ background: stage.accent }}
                />
              </div>
              <div className="pc-pipeline-stage-count pc-serif pc-num">
                {stage.count}
              </div>
              <p className="pc-pipeline-stage-meta">{stage.meta}</p>

              <ul className="pc-pipeline-papers">
                {stage.papers.map((paper) => (
                  <motion.li
                    key={paper.title}
                    className="pc-pipeline-paper"
                    whileHover={{
                      scale: 1.025,
                      boxShadow: 'var(--pc-shadow-sm)',
                      borderColor: 'var(--pc-primary-200)',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedPaper(paper)
                      setStageMeta({ name: stage.name, accent: stage.accent })
                    }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <div className="pc-pipeline-paper-body">
                      <div className="pc-pipeline-paper-title">{paper.title}</div>
                      <div className="pc-pipeline-paper-detail">{paper.detail}</div>
                    </div>
                    <span className={`pc-avatar ${paper.avatar} pc-pipeline-paper-av`}>
                      {paper.initials}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedPaper && stageMeta ? (
          <ApprovalDrawer
            key={`${selectedPaper.title}-${selectedPaper.initials}`}
            paper={selectedPaper}
            stageName={stageMeta.name}
            stageAccent={stageMeta.accent}
            onClose={() => {
              setSelectedPaper(null)
              setStageMeta(null)
            }}
          />
        ) : null}
      </AnimatePresence>
    </section>
  )
}

