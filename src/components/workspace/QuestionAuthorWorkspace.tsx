import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthorCanvas } from '@/components/authoring/AuthorCanvas'
import { AuthorMetadataPanel } from '@/components/authoring/AuthorMetadataPanel'
import { AuthorPreviewPanel } from '@/components/authoring/AuthorPreviewPanel'
import { useAuth } from '@/context/AuthContext'
import {
  defaultAuthorForm,
  docToAuthorForm,
  formToDocument,
  validateAuthorForm,
  type QuestionAuthorForm,
} from '@/lib/question-authoring'
import {
  createQuestion,
  parseFirestoreError,
  updateQuestion,
} from '@/services/firebase/questions'
import type { QuestionDocument } from '@/types/question'

type QuestionAuthorWorkspaceProps = {
  mode: 'create' | 'edit'
  questionId?: string
  initialDoc?: QuestionDocument | null
  taxonomyLabels?: {
    subjectName: string
    chapterName: string
    topicName: string
  }
}

export function QuestionAuthorWorkspace({
  mode,
  questionId,
  initialDoc,
  taxonomyLabels,
}: QuestionAuthorWorkspaceProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState<QuestionAuthorForm>(() => {
    if (!initialDoc) return defaultAuthorForm()
    const base = docToAuthorForm(initialDoc)
    if (taxonomyLabels) {
      base.subjectName = taxonomyLabels.subjectName || base.subjectName
      base.chapterName = taxonomyLabels.chapterName || base.chapterName
      base.topicName = taxonomyLabels.topicName || base.topicName
    }
    return base
  })

  useEffect(() => {
    if (!taxonomyLabels || !initialDoc) return
    setForm((f) => ({
      ...f,
      subjectName: taxonomyLabels.subjectName || f.subjectName,
      chapterName: taxonomyLabels.chapterName || f.chapterName,
      topicName: taxonomyLabels.topicName || f.topicName,
    }))
  }, [taxonomyLabels, initialDoc])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchForm = useCallback((patch: Partial<QuestionAuthorForm>) => {
    setForm((f) => ({ ...f, ...patch }))
  }, [])

  async function persist(statusOverride?: QuestionAuthorForm['status']) {
    const payload = statusOverride
      ? { ...form, status: statusOverride }
      : form
    const validation = validateAuthorForm(payload)
    if (!validation.ok) {
      setError(validation.message ?? 'Please complete required fields.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const authorLabel =
        user?.email?.split('@')[0] ?? user?.displayName ?? 'Admin'
      const doc = formToDocument(payload, {
        createdBy:
          mode === 'edit' && initialDoc?.createdBy
            ? initialDoc.createdBy
            : authorLabel,
        usageCount:
          mode === 'edit' ? (initialDoc?.usageCount ?? 0) : 0,
      })

      if (mode === 'create') {
        const id = await createQuestion(doc)
        navigate(`/app/repository`, { replace: true })
        return id
      }

      if (!questionId) throw new Error('Missing question id')
      await updateQuestion(questionId, doc)
      navigate(`/app/repository`, { replace: true })
    } catch (err) {
      const parsed = parseFirestoreError(err)
      setError(parsed.message)
    } finally {
      setSaving(false)
    }
  }

  const title =
    mode === 'create' ? 'Compose new question' : 'Edit question'

  return (
    <div className="pc-author-workspace">
      <header className="pc-author-header">
        <div className="pc-author-header-left">
          <Link to="/app/repository" className="pc-author-back">
            <ArrowLeft size={14} strokeWidth={1.6} />
            Repository
          </Link>
          <div className="pc-author-title-block">
            <h1>{title}</h1>
            <p>RBSE · Classes V–VIII · Academic authoring</p>
          </div>
        </div>
        <div className="pc-author-actions">
          <button
            type="button"
            className="pc-btn is-sm"
            disabled={saving}
            onClick={() => persist('draft')}
          >
            {saving ? (
              <Loader2 size={13} style={{ animation: 'pc-author-spin 0.8s linear infinite' }} />
            ) : (
              <Save size={13} strokeWidth={1.6} />
            )}
            {mode === 'create' ? 'Save draft' : 'Save as draft'}
          </button>
          <button
            type="button"
            className="pc-btn is-sm is-primary"
            disabled={saving}
            onClick={() => persist('published')}
          >
            <Send size={13} strokeWidth={1.6} />
            {mode === 'create' ? 'Publish' : 'Update & publish'}
          </button>
          {mode === 'edit' && (
            <button
              type="button"
              className="pc-btn is-sm"
              disabled={saving}
              onClick={() => persist()}
            >
              Update
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="pc-author-error" role="alert">
          {error}
        </div>
      )}

      <div className="pc-author-panels">
        <AuthorMetadataPanel form={form} onChange={patchForm} />
        <AuthorCanvas form={form} onChange={patchForm} />
        <AuthorPreviewPanel form={form} />
      </div>
    </div>
  )
}
