import { BookOpen, FileText, Layers, Library } from 'lucide-react'
import type {
  CurriculumInsights,
  CurriculumSelection,
} from '@/lib/curriculum-workspace'

type Props = {
  insights: CurriculumInsights | null
  selection: CurriculumSelection | null
  loading: boolean
}

function Metric({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Library
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="pc-curr-metric">
      <Icon size={14} strokeWidth={1.6} className="pc-curr-metric-icon" />
      <div>
        <span className="pc-curr-metric-k">{label}</span>
        <span className="pc-curr-metric-v pc-num">{value}</span>
        {hint ? <span className="pc-curr-metric-hint">{hint}</span> : null}
      </div>
    </div>
  )
}

export function CurriculumInsightsPanel({ insights, selection, loading }: Props) {
  return (
    <aside className="pc-curr-insights pc-scroll" aria-label="Curriculum insights">
      <div className="pc-curr-insights-head">
        <span className="pc-curr-insights-title">Curriculum insights</span>
        <span className="pc-curr-insights-sub">
          {selection ? `Scope · ${selection.label}` : 'Platform totals'}
        </span>
      </div>

      {loading || !insights ? (
        <p className="pc-curr-muted">Calculating coverage…</p>
      ) : (
        <div className="pc-curr-insights-body">
          <Metric
            icon={Library}
            label="Repository questions"
            value={insights.questionCount}
            hint={
              selection
                ? `${insights.questionsInSelection} in selected scope`
                : 'All non-deleted questions'
            }
          />
          <Metric
            icon={FileText}
            label="Examination papers"
            value={insights.paperCount}
            hint={
              selection
                ? `${insights.papersInSelection} matching selection`
                : 'Recent papers in library'
            }
          />
          <Metric
            icon={Layers}
            label="Active chapters"
            value={insights.activeChapters}
            hint={`${insights.totalChapters} total · ${insights.archivedChapters} archived`}
          />
          <Metric
            icon={BookOpen}
            label="Topics catalogued"
            value={insights.totalTopics}
            hint={`${insights.archivedTopics} archived`}
          />
          <Metric
            icon={Layers}
            label="Subjects with questions"
            value={insights.subjectsWithQuestions}
            hint="Distinct subject IDs in repository"
          />

          <div className="pc-curr-insights-foot">
            <p>
              Metrics are computed from live repository and paper data — not estimates.
            </p>
          </div>
        </div>
      )}
    </aside>
  )
}
