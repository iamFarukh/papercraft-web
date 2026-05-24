import type { ReactNode } from 'react'
import { DifficultyBalancePie } from './DifficultyBalancePie'
import type { PaperSectionDef, PaperStats } from '@/lib/paper-builder'
import type { PaperBlueprintSnapshot } from '@/types/paper'
import type { PaperStatus } from '@/types/paper'

type Props = {
  stats: PaperStats
  planMarks: number
  planMinutes: number
  sections: PaperSectionDef[]
  paperStatus?: PaperStatus
  blueprintSnapshot?: PaperBlueprintSnapshot
  blueprintMatchSlot?: ReactNode
}

export function PaperInsightsPanel({
  stats,
  planMarks,
  planMinutes,
  sections,
  paperStatus = 'draft',
  blueprintSnapshot,
  blueprintMatchSlot,
}: Props) {
  const planQ = sections.reduce((s, sec) => s + sec.plannedCount, 0)
  const planMins = planMinutes

  const marksPct = Math.min(100, (stats.totalMarks / planMarks) * 100)
  const durationPct = Math.min(100, (stats.estimatedMinutes / planMins) * 100)
  const questionsPct = Math.min(100, (stats.questionCount / planQ) * 100)

  const statusDotClass =
    paperStatus === 'approved' || paperStatus === 'submitted'
      ? 'is-ready'
      : stats.ready
        ? 'is-ready'
        : stats.questionCount > 0
          ? 'is-progress'
          : ''

  const workflowLabel =
    paperStatus === 'approved'
      ? 'Approved'
      : paperStatus === 'submitted'
        ? 'Awaiting approval'
        : stats.statusLabel
  const workflowHint =
    paperStatus === 'approved'
      ? 'Official examination paper — locked for editing.'
      : paperStatus === 'submitted'
        ? 'This paper is locked for editing until an administrator reviews it.'
        : stats.statusHint

  return (
    <aside
      className={`pc-pb-insights pc-scroll${paperStatus === 'submitted' || paperStatus === 'approved' ? ' is-locked' : ''}`}
    >
      <div>
        <div className="pc-pb-insights-label">Paper Insights</div>
        <p className="pc-pb-insights-sub">Live as you compose.</p>
      </div>

      <div className="pc-pb-insight-card">
        <div className="pc-pb-insight-status-row">
          <span className={`pc-pb-insight-status-dot ${statusDotClass}`} />
          <span className="pc-pb-insight-status-kicker">Paper status</span>
        </div>
        <div className="pc-pb-insight-status-title">{workflowLabel}</div>
        <p className="pc-pb-insight-status-hint">{workflowHint}</p>
      </div>

      {blueprintMatchSlot}

      {blueprintSnapshot ? (
        <p className="pc-pb-insight-bp-note">
          Targets from blueprint · {blueprintSnapshot.totalMarks} marks ·{' '}
          {blueprintSnapshot.sections.length} sections
        </p>
      ) : null}

      <div className="pc-pb-stat-grid">
        <div className="pc-pb-stat">
          <div className="pc-pb-stat-kicker">Total marks</div>
          <div className="pc-pb-stat-value-row">
            <span className="pc-pb-stat-value pc-num">{stats.totalMarks}</span>
            <span className="pc-pb-stat-denom">/ {planMarks}</span>
          </div>
          <div className="pc-bar is-primary" style={{ marginTop: 8 }}>
            <span style={{ width: `${marksPct}%` }} />
          </div>
        </div>
        <div className="pc-pb-stat">
          <div className="pc-pb-stat-kicker">Est. duration</div>
          <div className="pc-pb-stat-value-row">
            <span className="pc-pb-stat-value pc-num">{stats.estimatedMinutes}</span>
            <span className="pc-pb-stat-denom">min</span>
          </div>
          <div className="pc-bar is-success" style={{ marginTop: 8 }}>
            <span style={{ width: `${durationPct}%` }} />
          </div>
        </div>
        <div className="pc-pb-stat">
          <div className="pc-pb-stat-kicker">Questions</div>
          <div className="pc-pb-stat-value-row">
            <span className="pc-pb-stat-value pc-num">{stats.questionCount}</span>
            <span className="pc-pb-stat-denom">/ {planQ}</span>
          </div>
          <div className="pc-bar" style={{ marginTop: 8 }}>
            <span style={{ width: `${questionsPct}%` }} />
          </div>
        </div>
        <div className="pc-pb-stat">
          <div className="pc-pb-stat-kicker">Sections</div>
          <div className="pc-pb-stat-value-row">
          <span className="pc-pb-stat-value pc-num">{sections.length}</span>
          <span className="pc-pb-stat-denom">
            {sections.map((s) => s.letter).join(' · ')}
          </span>
          </div>
          <p style={{ fontSize: 11, color: 'var(--pc-ink-3)', marginTop: 6 }}>
            Compulsory · Choice · Long
          </p>
        </div>
      </div>

      <div>
        <div className="pc-pb-block-title">Difficulty balance</div>
        <div className="pc-pb-diff-card">
          <DifficultyBalancePie
            slices={[
              { value: Math.max(stats.diffEasy, 0.01), color: 'var(--pc-success)' },
              { value: Math.max(stats.diffMed, 0.01), color: 'var(--pc-primary)' },
              { value: Math.max(stats.diffHard, 0.01), color: 'var(--pc-warning)' },
            ]}
          />
          <div className="pc-pb-diff-rows">
            {(
              [
                ['Easy', stats.diffEasy, 'var(--pc-success)'],
                ['Medium', stats.diffMed, 'var(--pc-primary)'],
                ['Hard', stats.diffHard, 'var(--pc-warning)'],
              ] as const
            ).map(([label, count, color]) => (
              <div key={label} className="pc-pb-diff-row">
                <span className="pc-pb-diff-swatch" style={{ background: color }} />
                <span className="pc-pb-diff-row-label">{label}</span>
                <span className="pc-pb-diff-row-val pc-num">{count}</span>
                <span className="pc-pb-diff-row-pct pc-num">
                  {stats.questionCount
                    ? `${Math.round((count / stats.questionCount) * 100)}%`
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="pc-pb-block-title">Section distribution</div>
        <div className="pc-pb-section-dist">
          {sections.map((section) => {
            const count = stats.sectionCounts[section.id]
            const plan = section.plannedCount
            return (
              <div key={section.id}>
                <div className="pc-pb-section-dist-row-head">
                  <span className="pc-pb-section-dist-label">Section {section.letter}</span>
                  <span style={{ marginLeft: 'auto' }}>
                    <span className="pc-num" style={{ fontWeight: 500, color: 'var(--pc-ink)' }}>
                      {count}
                    </span>
                    <span style={{ color: 'var(--pc-ink-4)' }}>/{plan}</span>
                  </span>
                </div>
                <div className="pc-bar is-primary">
                  <span style={{ width: `${plan ? (count / plan) * 100 : 0}%` }} />
                </div>
                <p className="pc-pb-section-dist-hint">{section.name}</p>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
