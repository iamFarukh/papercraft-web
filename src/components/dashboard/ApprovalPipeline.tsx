import { useNavigate } from 'react-router-dom'
import { motion, type CSSProperties } from 'framer-motion'
import type { ControlCenterPipelineStage } from '@/hooks/useControlCenterData'
import { listItemReveal, listReveal } from '@/lib/motion/variants'

type Props = {
  loading: boolean
  error: string | null
  pipeline: ControlCenterPipelineStage[]
  papersInFlow: number
}

export function ApprovalPipeline({ loading, error, pipeline, papersInFlow }: Props) {
  const navigate = useNavigate()

  return (
    <section className="pc-panel pc-panel-pad pc-pipeline-panel">
      <header className="pc-section-head">
        <div>
          <h2 className="pc-serif pc-section-title">Paper workflow</h2>
          <p className="pc-section-sub">Draft through approval · your recent papers</p>
        </div>
        <div className="pc-pipeline-summary pc-num">
          <span className="pc-pipeline-summary-value">
            {loading ? '—' : papersInFlow}
          </span>
          <span className="pc-pipeline-summary-label">papers in flow</span>
        </div>
      </header>

      {error ? (
        <p className="pc-section-sub" style={{ marginTop: 0 }}>
          {error}
        </p>
      ) : null}

      <motion.div
        className="pc-pipeline-flow"
        variants={listReveal}
        initial="hidden"
        animate="visible"
      >
        {pipeline.map((stage, index) => (
          <div key={stage.key} className="pc-pipeline-stage-wrap">
            {index > 0 ? (
              <div className="pc-pipeline-connector" aria-hidden>
                <span className="pc-pipeline-connector-line" />
              </div>
            ) : null}
            <motion.div
              className="pc-pipeline-stage pc-motion-surface"
              variants={listItemReveal}
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
                {loading ? '—' : stage.count}
              </div>
              <p className="pc-pipeline-stage-meta">{stage.meta}</p>

              <ul className="pc-pipeline-papers">
                {stage.papers.length === 0 && !loading ? (
                  <li className="pc-pipeline-paper pc-pipeline-paper--empty">
                    <span className="pc-pipeline-paper-detail">{stage.emptyMeta}</span>
                  </li>
                ) : null}
                {stage.papers.map((paper) => (
                  <motion.li
                    key={paper.id}
                    className="pc-pipeline-paper pc-motion-surface"
                    onClick={() => {
                      if (stage.key === 'submitted' || stage.key === 'approved') {
                        navigate('/app/approvals')
                        return
                      }
                      navigate(`/app/builder/${paper.id}`)
                    }}
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
    </section>
  )
}
