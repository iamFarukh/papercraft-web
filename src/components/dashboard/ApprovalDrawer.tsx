import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { drawerSlideBottom, overlayFade } from '@/lib/motion/variants'
import { X, CheckCircle2, AlertTriangle, Printer, Layers, Clock, ShieldAlert } from 'lucide-react'

type PaperItem = {
  title: string
  detail: string
  initials: string
  avatar: string
}

type ApprovalDrawerProps = {
  paper: PaperItem
  stageName: string
  stageAccent: string
  onClose: () => void
}

export function ApprovalDrawer({
  paper,
  stageName,
  stageAccent,
  onClose,
}: ApprovalDrawerProps) {
  const parts = paper.title.split('·')
  const subject = parts[0]?.trim() ?? 'Academic'
  const classLabel = parts[1]?.trim() ?? 'Class V–VIII'
  const examType = parts[2]?.trim() ?? 'Term Examination'

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const reduced = useReducedMotion()

  return (
    <motion.div
      className="pc-approval-overlay"
      variants={overlayFade}
      initial={reduced ? false : 'hidden'}
      animate="visible"
      exit="exit"
      role="dialog"
      aria-modal="true"
      aria-label="Paper approval detail"
    >
      <button
        type="button"
        className="pc-approval-backdrop"
        aria-label="Close preview"
        onClick={onClose}
      />

      <motion.aside
        className="pc-approval-sheet pc-scroll"
        variants={drawerSlideBottom}
        initial={reduced ? false : 'hidden'}
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          style={{
            padding: '18px 24px',
            background: 'var(--pc-surface)',
            borderBottom: '1px solid var(--pc-line-cool)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span
                className="pc-tag"
                style={{
                  background: 'var(--pc-primary-50)',
                  color: 'var(--pc-primary-600)',
                  fontWeight: 500,
                }}
              >
                {subject}
              </span>
              <span className="pc-tag is-outline">{classLabel}</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  color: 'var(--pc-ink-3)',
                  marginLeft: 6,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: stageAccent,
                  }}
                />
                {stageName}
              </span>
            </div>
            <h3
              className="pc-serif"
              style={{ fontSize: 20, margin: 0, letterSpacing: '-0.015em' }}
            >
              {examType} Paper Draft
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="pc-icon-btn"
              title="Print Draft"
              style={{ background: 'var(--pc-surface)' }}
            >
              <Printer size={15} strokeWidth={1.6} />
            </button>
            <button
              type="button"
              className="pc-icon-btn"
              title="Close"
              onClick={onClose}
              style={{ background: 'var(--pc-surface)' }}
            >
              <X size={16} strokeWidth={1.6} />
            </button>
          </div>
        </header>

        <div
          className="pc-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <section
            className="pc-panel pc-panel-pad"
            style={{
              background: 'var(--pc-surface)',
              border: '1px solid var(--pc-line-cool)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 10, color: 'var(--pc-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Marks
                </div>
                <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>
                  80
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--pc-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Questions
                </div>
                <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>
                  26
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--pc-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Duration
                </div>
                <div className="pc-serif pc-num" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>
                  3h
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--pc-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Language
                </div>
                <div className="pc-serif" style={{ fontSize: 20, fontWeight: 500, marginTop: 7, color: 'var(--pc-primary-600)' }}>
                  Bilingual
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: '1px dashed var(--pc-line-cool)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                color: 'var(--pc-ink-3)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Layers size={13} style={{ color: 'var(--pc-ink-4)' }} />
                <span>Syllabus: <strong>100% Covered</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} style={{ color: 'var(--pc-ink-4)' }} />
                <span>Avg Duration: <strong>165 min</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={13} style={{ color: 'var(--pc-ink-4)' }} />
                <span>Overlaps: <strong>0 flagged</strong></span>
              </div>
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--pc-ink-4)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Printed Paper Simulation (Bilingual)
            </div>

            <motion.article
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.08, type: 'spring', stiffness: 140, damping: 20 }}
              style={{
                background: 'var(--pc-paper)',
                border: '1px solid var(--pc-paper-edge)',
                borderRadius: '6px',
                boxShadow: 'var(--pc-shadow-paper)',
                padding: '36px 36px 48px',
                position: 'relative',
                color: 'var(--pc-ink)',
              }}
            >
              <div style={{ textAlign: 'center', borderBottom: '2px double var(--pc-ink)', paddingBottom: 16, marginBottom: 20 }}>
                <h4 className="pc-serif" style={{ fontSize: 16, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Saraswati Vidya Niketan, Jaipur
                </h4>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {examType} Examination · 2025–26
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8, fontStyle: 'italic' }}>
                  <span>Subject: {subject} ({classLabel})</span>
                  <span>Max Marks: 80</span>
                  <span>Time Allowed: 3 Hours</span>
                </div>
              </div>

              <div style={{ fontSize: 11.5, lineHeight: 1.4, marginBottom: 24, borderBottom: '1px solid var(--pc-ink)', paddingBottom: 12 }}>
                <strong>General Instructions / सामान्य निर्देश:</strong>
                <ol style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                  <li>All questions are compulsory. / सभी प्रश्न अनिवार्य हैं।</li>
                  <li>Write the answers in the answer book only. / उत्तर केवल उत्तर-पुस्तिका में ही लिखें।</li>
                </ol>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div style={{ fontWeight: 600, borderBottom: '1px dashed var(--pc-ink)', paddingBottom: 2, marginBottom: 12, fontSize: 12 }}>
                    SECTION A / खण्ड क (Multiple Choice Questions)
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.4 }}>
                    <span className="pc-num" style={{ fontWeight: 600 }}>1.</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px' }}>
                        If $x^2 - 5x + 6 = 0$, then find the roots of the quadratic equation.
                      </p>
                      <p style={{ margin: '0 0 8px', fontStyle: 'italic', color: 'var(--pc-ink-3)' }}>
                        यदि $x^2 - 5x + 6 = 0$ हो, तो द्विघात समीकरण के मूल ज्ञात कीजिए।
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 12 }}>
                        <span>(A) $x = 2, 3$</span>
                        <span>(B) $x = -2, -3$</span>
                        <span>(C) $x = 1, 5$</span>
                        <span>(D) $x = -1, -5$</span>
                      </div>
                    </div>
                    <span className="pc-num" style={{ fontWeight: 600, marginLeft: 12 }}>[1]</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, borderBottom: '1px dashed var(--pc-ink)', paddingBottom: 2, marginBottom: 12, fontSize: 12 }}>
                    SECTION B / खण्ड ख (Short Answer Type Questions)
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.4 }}>
                    <span className="pc-num" style={{ fontWeight: 600 }}>2.</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px' }}>State and prove Pythagoras Theorem.</p>
                      <p style={{ margin: '0 0 0', fontStyle: 'italic', color: 'var(--pc-ink-3)' }}>
                        पाइथागोरस प्रमेय का कथन लिखकर इसे सिद्ध कीजिए।
                      </p>
                    </div>
                    <span className="pc-num" style={{ fontWeight: 600, marginLeft: 12 }}>[4]</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, borderBottom: '1px dashed var(--pc-ink)', paddingBottom: 2, marginBottom: 12, fontSize: 12 }}>
                    SECTION C / खण्ड ग (Long Answer Type Questions)
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, lineHeight: 1.4 }}>
                    <span className="pc-num" style={{ fontWeight: 600 }}>3.</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px' }}>
                        Draw the graph of the linear equation $2x + 3y = 12$. Hence, find the area of the triangle formed by this line and the coordinate axes.
                      </p>
                      <p style={{ margin: '0 0 0', fontStyle: 'italic', color: 'var(--pc-ink-3)' }}>
                        रैखिक समीकरण $2x + 3y = 12$ का आलेख खींचिए। इस रेखा तथा निर्देशांक अक्षों द्वारा बने त्रिभुज का क्षेत्रफल ज्ञात कीजिए।
                      </p>
                    </div>
                    <span className="pc-num" style={{ fontWeight: 600, marginLeft: 12 }}>[6]</span>
                  </div>
                </div>
              </div>
            </motion.article>
          </section>
        </div>

        <footer
          style={{
            padding: '16px 24px',
            background: 'var(--pc-surface)',
            borderTop: '1px solid var(--pc-line-cool)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            className="pc-btn is-sm"
            onClick={onClose}
            style={{
              background: 'var(--pc-surface-3)',
              color: 'var(--pc-ink-2)',
              border: '1px solid var(--pc-line-cool)',
            }}
          >
            Close Preview
          </button>
          <button
            type="button"
            className="pc-btn is-sm is-danger"
            onClick={() => {
              alert('Revision request logged in activity feed.')
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={13} />
            Flag &amp; Request Revision
          </button>
          <button
            type="button"
            className="pc-btn is-sm is-primary"
            onClick={() => {
              alert('Paper has been officially approved and locked!')
              onClose()
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500,
              background: 'var(--pc-success)',
              borderColor: 'var(--pc-success)',
            }}
          >
            <CheckCircle2 size={13} />
            Approve &amp; Lock Paper
          </button>
        </footer>
      </motion.aside>
    </motion.div>
  )
}
