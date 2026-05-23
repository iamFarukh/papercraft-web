import {
  STATUS_LABELS,
  TYPE_LABELS,
} from '@/config/curriculum'
import { ALL_STATUSES } from '@/lib/question-status'
import { BLOOM_LEVELS, type QuestionAuthorForm } from '@/lib/question-authoring'
import {
  isSeniorClass,
  RBSE_STREAM_OPTIONS,
  type RbseStreamId,
} from '@/lib/rbse-catalog'
import { useCurriculumTaxonomy } from '@/hooks/useCurriculumTaxonomy'
import { TaxonomyCombobox } from '@/components/authoring/TaxonomyCombobox'
import { useAuth } from '@/context/AuthContext'
import type { AuthoringQuestionType } from '@/types/question'

type AuthorMetadataPanelProps = {
  form: QuestionAuthorForm
  onChange: (patch: Partial<QuestionAuthorForm>) => void
}

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const

const LANGUAGES = [
  { id: 'english', label: 'English medium only' },
  { id: 'hindi', label: 'Hindi medium only' },
  { id: 'bilingual', label: 'Bilingual (English + Hindi)' },
] as const

const AUTHOR_TYPES: AuthoringQuestionType[] = [
  'mcq',
  'true_false',
  'fill_blank',
  'short',
  'long',
]

export function AuthorMetadataPanel({ form, onChange }: AuthorMetadataPanelProps) {
  const { isAdmin } = useAuth()
  const classId = String(form.classNumber)
  const stream = (form.stream as RbseStreamId | null) ?? null
  const senior = isSeniorClass(form.classNumber)

  const {
    classes,
    subjects,
    chapters,
    topics,
    loading,
    error,
    needsStream,
    createClass,
    createSubject,
    createChapter,
    createTopic,
  } = useCurriculumTaxonomy({
    classNumber: form.classNumber,
    subjectId: form.subjectId,
    chapterId: form.chapterId,
    stream,
  })

  function selectClass(option: { id: string; label: string }) {
    const num = Number(option.id)
    const nextSenior = isSeniorClass(num)
    onChange({
      classNumber: num,
      stream: nextSenior ? form.stream : null,
      subjectId: '',
      subjectName: '',
      chapterId: '',
      chapterName: '',
      topicId: '',
      topicName: '',
    })
  }

  function selectStream(streamId: RbseStreamId) {
    onChange({
      stream: streamId,
      subjectId: '',
      subjectName: '',
      chapterId: '',
      chapterName: '',
      topicId: '',
      topicName: '',
    })
  }

  function selectSubject(option: { id: string; label: string }) {
    onChange({
      subjectId: option.id,
      subjectName: option.label,
      chapterId: '',
      chapterName: '',
      topicId: '',
      topicName: '',
    })
  }

  function selectChapter(option: { id: string; label: string }) {
    onChange({
      chapterId: option.id,
      chapterName: option.label,
      topicId: '',
      topicName: '',
    })
  }

  function selectTopic(option: { id: string; label: string }) {
    onChange({ topicId: option.id, topicName: option.label })
  }

  return (
    <aside className="pc-author-meta pc-scroll" aria-label="Question metadata">
      <div className="pc-author-meta-group">
        <div className="pc-author-meta-label">Curriculum</div>
        <p className="pc-taxonomy-intro">
          Pick from the RBSE catalog or create new entries. Names are normalized;
          similar typos are flagged, not different subjects.
        </p>

        {error && (
          <p className="pc-taxonomy-hint is-warn" role="alert">
            {error}
          </p>
        )}

        <TaxonomyCombobox
          label="Class"
          placeholder="Class V, Class IX…"
          valueId={classId}
          valueLabel={
            classes.find((c) => c.id === classId)?.label ??
            `Class ${form.classNumber}`
          }
          options={classes}
          loading={loading}
          allowCreate={isAdmin}
          onSelect={selectClass}
          onCreate={isAdmin ? createClass : undefined}
        />

        {senior && (
          <div className="pc-author-field">
            <label htmlFor="author-stream">Stream (XI–XII)</label>
            <select
              id="author-stream"
              value={form.stream ?? ''}
              onChange={(e) => selectStream(e.target.value as RbseStreamId)}
            >
              <option value="">Select stream…</option>
              {RBSE_STREAM_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <TaxonomyCombobox
          label="Subject"
          placeholder={
            needsStream && !stream
              ? 'Select stream first'
              : 'Mathematics, Social Science…'
          }
          valueId={form.subjectId}
          valueLabel={form.subjectName || form.subjectId}
          options={subjects}
          disabled={needsStream && !stream}
          loading={loading}
          allowCreate={isAdmin}
          onSelect={selectSubject}
          onCreate={isAdmin ? createSubject : undefined}
        />

        <TaxonomyCombobox
          label="Chapter"
          placeholder={
            form.subjectId ? 'Search or create chapter…' : 'Select subject first'
          }
          valueId={form.chapterId}
          valueLabel={form.chapterName}
          options={chapters}
          disabled={!form.subjectId}
          loading={loading}
          allowCreate={isAdmin}
          onSelect={selectChapter}
          onCreate={isAdmin ? createChapter : undefined}
        />

        <TaxonomyCombobox
          label="Topic"
          placeholder={
            form.chapterId ? 'Search or create topic…' : 'Select chapter first'
          }
          valueId={form.topicId}
          valueLabel={form.topicName}
          options={topics}
          disabled={!form.chapterId}
          loading={loading}
          allowCreate={isAdmin}
          onSelect={selectTopic}
          onCreate={isAdmin ? createTopic : undefined}
        />
      </div>

      <div className="pc-author-meta-group">
        <div className="pc-author-meta-label">Question design</div>
        <div className="pc-author-field">
          <label htmlFor="author-type">Question type</label>
          <select
            id="author-type"
            value={form.type}
            onChange={(e) =>
              onChange({ type: e.target.value as AuthoringQuestionType })
            }
          >
            {AUTHOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>
        <div className="pc-author-field">
          <label htmlFor="author-difficulty">Difficulty</label>
          <select
            id="author-difficulty"
            value={form.difficulty}
            onChange={(e) =>
              onChange({
                difficulty: e.target.value as QuestionAuthorForm['difficulty'],
              })
            }
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pc-author-field">
          <label htmlFor="author-marks">Marks</label>
          <input
            id="author-marks"
            type="number"
            min={1}
            max={20}
            value={form.marks}
            onChange={(e) => onChange({ marks: Number(e.target.value) || 1 })}
          />
        </div>
        <div className="pc-author-field">
          <label htmlFor="author-bloom">Bloom level</label>
          <select
            id="author-bloom"
            value={form.bloomLevel}
            onChange={(e) =>
              onChange({ bloomLevel: e.target.value as QuestionAuthorForm['bloomLevel'] })
            }
          >
            {BLOOM_LEVELS.map((b) => (
              <option key={b} value={b}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pc-author-meta-group">
        <div className="pc-author-meta-label">Publishing</div>
        <div className="pc-author-field">
          <label htmlFor="author-language">Language</label>
          <select
            id="author-language"
            value={form.language}
            onChange={(e) =>
              onChange({ language: e.target.value as QuestionAuthorForm['language'] })
            }
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pc-author-field">
          <label htmlFor="author-tags">Tags</label>
          <input
            id="author-tags"
            type="text"
            placeholder="rbse-term-ii, bilingual"
            value={form.tagsInput}
            onChange={(e) => onChange({ tagsInput: e.target.value })}
          />
        </div>
        <div className="pc-author-field">
          <label htmlFor="author-status">Status</label>
          <select
            id="author-status"
            value={form.status}
            onChange={(e) =>
              onChange({ status: e.target.value as QuestionAuthorForm['status'] })
            }
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  )
}
