import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  type ActivityRow,
  type ControlCenterMetric,
  groupPapersByStatus,
  paperToPipelineCard,
  papersToActivityRows,
  PIPELINE_STAGE_CONFIG,
  type PipelinePaperCard,
} from '@/lib/control-center'
import { fetchQuestionCount } from '@/services/firebase/question-count'
import { listRecentPapers } from '@/services/firebase/papers'
import type { PaperListItem } from '@/types/paper'

export function useControlCenterData() {
  const { user, isAdmin } = useAuth()
  const [questionCount, setQuestionCount] = useState<number | null>(null)
  const [papers, setPapers] = useState<PaperListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [count, rows] = await Promise.all([
          fetchQuestionCount(isAdmin),
          listRecentPapers({ userId: user!.uid, isAdmin, max: 80 }),
        ])
        if (cancelled) return
        setQuestionCount(count)
        setPapers(rows)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load overview.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user, isAdmin])

  const grouped = useMemo(() => groupPapersByStatus(papers), [papers])

  const metrics = useMemo((): ControlCenterMetric[] => {
    const drafts = grouped.draft.length
    const submitted = grouped.submitted.length
    const approved = grouped.approved.length
    const inFlow = papers.filter((p) => p.status !== 'archived').length

    const questionValue =
      questionCount === null ? '—' : questionCount.toLocaleString()

    if (isAdmin) {
      return [
        {
          label: 'Question bank',
          value: questionValue,
          hint: 'All questions in the repository',
          trend: 'neutral',
          trendLabel: 'Live count',
        },
        {
          label: 'Pending approvals',
          value: String(submitted),
          hint: submitted === 0 ? 'Queue is clear' : 'Submitted · awaiting review',
          trend: submitted > 0 ? 'up' : 'neutral',
          trendLabel: submitted > 0 ? 'Needs attention' : 'Up to date',
        },
        {
          label: 'Papers in flow',
          value: String(inFlow),
          hint: 'Draft, submitted, and approved',
          trend: 'neutral',
          trendLabel: `${drafts} draft · ${approved} approved`,
        },
        {
          label: 'Approved papers',
          value: String(approved),
          hint: 'Ready for official preview and PDF export',
          trend: 'neutral',
          trendLabel: approved > 0 ? 'Export from library' : 'None yet',
        },
      ]
    }

    return [
      {
        label: 'Published questions',
        value: questionValue,
        hint: 'Available when building papers',
        trend: 'neutral',
        trendLabel: 'Repository',
      },
      {
        label: 'My drafts',
        value: String(drafts),
        hint: drafts === 0 ? 'Start a new paper in Paper Builder' : 'Continue composing',
        trend: 'neutral',
        trendLabel: 'Paper Builder',
      },
      {
        label: 'Submitted',
        value: String(submitted),
        hint: submitted === 0 ? 'Nothing in review' : 'Awaiting admin approval',
        trend: submitted > 0 ? 'up' : 'neutral',
        trendLabel: submitted > 0 ? 'In review' : '—',
      },
      {
        label: 'Approved',
        value: String(approved),
        hint: 'Official copies · print and PDF',
        trend: 'neutral',
        trendLabel: approved > 0 ? 'Open from library' : '—',
      },
    ]
  }, [grouped, isAdmin, papers, questionCount])

  const pipeline = useMemo(() => {
    return PIPELINE_STAGE_CONFIG.map((stage) => {
      const items = grouped[stage.key].slice(0, 2).map(paperToPipelineCard)
      const count = grouped[stage.key].length
      const meta =
        count === 0
          ? stage.emptyMeta
          : count === 1
            ? '1 paper'
            : `${count} papers`
      return { ...stage, count, meta, papers: items }
    })
  }, [grouped])

  const displayName = useMemo(() => {
    const name = user?.displayName?.trim()
    if (name) return name
    const email = user?.email?.split('@')[0]
    return email ? email.replace(/\./g, ' ') : 'You'
  }, [user])

  const activities = useMemo((): ActivityRow[] => {
    return papersToActivityRows(papers, displayName)
  }, [papers, displayName])

  const papersInFlow = papers.filter((p) => p.status !== 'archived').length

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    const salutation =
      hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const name = displayName.split(/\s+/)[0] ?? 'there'
    const pending = grouped.submitted.length
    const subline =
      isAdmin && pending > 0
        ? `${pending} paper${pending === 1 ? '' : 's'} await your review.`
        : draftsHint(grouped.draft.length)
    return { salutation, name, subline }
  }, [displayName, grouped.draft.length, grouped.submitted.length, isAdmin])

  return {
    loading,
    error,
    metrics,
    pipeline,
    activities,
    papersInFlow,
    greeting,
  }
}

function draftsHint(drafts: number): string {
  if (drafts === 0) return 'Your papers and question bank at a glance.'
  if (drafts === 1) return 'You have one draft in progress.'
  return `You have ${drafts} drafts in progress.`
}

export type ControlCenterPipelineStage = ReturnType<
  typeof useControlCenterData
>['pipeline'][number]
