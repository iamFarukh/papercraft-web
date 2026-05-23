import { BookOpen } from 'lucide-react'
import type { QuestionRecord } from '@/types/question'
import { questionDisplayRef } from '@/lib/question-display'
import {
  computeRepositoryStats,
  difficultyLabel,
} from '@/lib/repository-workspace'
import { IntelligenceSidebarSkeleton } from './RepositorySkeleton'

type IntelligenceSidebarProps = {
  selected: QuestionRecord | null
  allLoaded: QuestionRecord[]
  matchCount: number
  loading?: boolean
}

function RepositoryOverview({
  matchCount,
  allLoaded,
}: {
  matchCount: number
  allLoaded: QuestionRecord[]
}) {
  const stats = computeRepositoryStats(allLoaded)
  const { lifecycle } = stats

  return (
    <>
      <header className="pc-repo-intel-header">
        <span className="pc-repo-intel-kicker">Repository Intelligence</span>
        <h3 className="pc-repo-intel-title pc-serif">RBSE · Classes V–VIII</h3>
        <p className="pc-repo-intel-lead">
          Live snapshot from loaded questions — select a card for detail.
        </p>
      </header>

      <div className="pc-repo-stat-grid">
        <div className="pc-repo-stat-cell">
          <span className="pc-repo-stat-label">Loaded in session</span>
          <span className="pc-repo-stat-value pc-serif pc-num">
            {stats.totalLoaded}
          </span>
        </div>
        <div className="pc-repo-stat-cell">
          <span className="pc-repo-stat-label">Matching view</span>
          <span className="pc-repo-stat-value pc-serif pc-num">{matchCount}</span>
        </div>
      </div>

      {stats.totalLoaded > 0 && (
        <>
          <div className="pc-repo-section-label">Lifecycle (loaded)</div>
          <div className="pc-repo-lifecycle">
            <div className="pc-repo-lifecycle-row">
              <span>Published</span>
              <span className="pc-num">{lifecycle.approved}</span>
            </div>
            <div className="pc-repo-lifecycle-row">
              <span>Draft</span>
              <span className="pc-num">{lifecycle.draft}</span>
            </div>
            <div className="pc-repo-lifecycle-row">
              <span>Locked</span>
              <span className="pc-num">{lifecycle.inReview}</span>
            </div>
            <div className="pc-repo-lifecycle-row">
              <span>Archived</span>
              <span className="pc-num">{lifecycle.archived}</span>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function QuestionDetail({ q }: { q: QuestionRecord }) {
  const diff = difficultyLabel(q.difficulty)

  return (
    <>
      <header className="pc-repo-intel-header">
        <div className="pc-repo-intel-head">
          <span className="pc-repo-intel-kicker">Question detail</span>
          <span className="pc-repo-intel-ref" title={`Document ID: ${q.id}`}>
            {questionDisplayRef(q)}
          </span>
        </div>
        <h3 className="pc-repo-intel-title pc-serif">{q.chapter}</h3>
        <p className="pc-repo-intel-lead">
          {q.classLabel} · {q.subject}
          {q.topic ? ` · ${q.topic}` : ''}
        </p>
      </header>

      <div className="pc-repo-section-label">Metadata</div>
      <div className="pc-repo-metric-list">
        <div className="pc-repo-metric-row">
          <span>Type</span>
          <span>{q.type}</span>
        </div>
        <div className="pc-repo-metric-row">
          <span>Difficulty</span>
          <span>{diff}</span>
        </div>
        <div className="pc-repo-metric-row">
          <span>Bloom level</span>
          <span>{q.bloomLevel}</span>
        </div>
        <div className="pc-repo-metric-row">
          <span>Marks</span>
          <span className="pc-num">{q.marks}</span>
        </div>
      </div>

      <div className="pc-repo-section-label">Lifecycle</div>
      <div className="pc-repo-lifecycle">
        <div className="pc-repo-lifecycle-row">
          <span>Status</span>
          <span>{q.status}</span>
        </div>
        <div className="pc-repo-lifecycle-row">
          <span>Usage in papers</span>
          <span className="pc-num">{q.usage}×</span>
        </div>
        <div className="pc-repo-lifecycle-row">
          <span>Est. time</span>
          <span className="pc-num">~{q.estimatedMinutes} min</span>
        </div>
      </div>

      <div className="pc-repo-callout">
        <div className="pc-repo-callout-icon" aria-hidden>
          <BookOpen size={12} strokeWidth={1.6} />
        </div>
        <div>
          <div className="pc-repo-callout-title">Syllabus mapping</div>
          <p className="pc-repo-callout-text">
            Mapped to RBSE {q.classLabel} · {q.subject} · {q.chapter}.
          </p>
        </div>
      </div>
    </>
  )
}

export function IntelligenceSidebar({
  selected,
  allLoaded,
  matchCount,
  loading = false,
}: IntelligenceSidebarProps) {
  if (loading) {
    return <IntelligenceSidebarSkeleton />
  }

  return (
    <aside className="pc-repo-intel pc-scroll" aria-label="Repository intelligence">
      {selected ? (
        <QuestionDetail q={selected} />
      ) : (
        <RepositoryOverview matchCount={matchCount} allLoaded={allLoaded} />
      )}
    </aside>
  )
}
