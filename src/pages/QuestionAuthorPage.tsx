import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { QuestionAuthorWorkspace } from '@/components/workspace/QuestionAuthorWorkspace'
import { useAuth } from '@/context/AuthContext'
import { resolveTaxonomyLabels } from '@/services/firebase/curriculum'
import { getQuestionById, parseFirestoreError } from '@/services/firebase/questions'
import type { QuestionDocument } from '@/types/question'

type QuestionAuthorPageProps = {
  mode: 'create' | 'edit'
}

export function QuestionAuthorPage({ mode }: QuestionAuthorPageProps) {
  const { id } = useParams<{ id: string }>()
  const { isAdmin, loading: authLoading } = useAuth()
  const [doc, setDoc] = useState<QuestionDocument | null | undefined>(
    mode === 'create' ? null : undefined,
  )
  const [taxonomyLabels, setTaxonomyLabels] = useState<{
    subjectName: string
    chapterName: string
    topicName: string
  } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'edit' || !id) return
    let cancelled = false
    getQuestionById(id)
      .then(async (data) => {
        if (cancelled || !data) {
          if (!cancelled) setDoc(data)
          return
        }
        const labels = await resolveTaxonomyLabels(
          data.classNumber,
          data.subjectId,
          data.chapterId,
          data.topicId,
        )
        if (!cancelled) {
          setDoc(data)
          setTaxonomyLabels(labels)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(parseFirestoreError(err).message)
          setDoc(null)
        }
      })
    return () => {
      cancelled = true
    }
  }, [mode, id])

  if (authLoading) {
    return <div className="pc-author-loading">Loading…</div>
  }

  if (!isAdmin) {
    return <Navigate to="/app/repository" replace />
  }

  if (mode === 'edit') {
    if (doc === undefined) {
      return <div className="pc-author-loading">Loading question…</div>
    }
    if (!doc) {
      return (
        <div className="pc-author-loading">
          {loadError ?? 'Question not found.'}
        </div>
      )
    }
    if (doc.status === 'locked') {
      return (
        <div className="pc-author-loading">
          <p>This question is locked. Unlock it from the repository before editing.</p>
          <Link to="/app/repository">Back to repository</Link>
        </div>
      )
    }
    return (
      <QuestionAuthorWorkspace
        mode="edit"
        questionId={id}
        initialDoc={doc}
        taxonomyLabels={taxonomyLabels ?? undefined}
      />
    )
  }

  return <QuestionAuthorWorkspace mode="create" />
}
