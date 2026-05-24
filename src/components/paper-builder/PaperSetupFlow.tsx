import { ArrowRight, FileText, Layers, Target } from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BlueprintSetupPicker } from '@/components/paper-builder/BlueprintSetupPicker'
import { useAuth } from '@/context/AuthContext'
import { useTeacherScope } from '@/hooks/useTeacherScope'
import { setupMatchesAssignments } from '@/lib/teacher-assignments'
import { useQuestions } from '@/hooks/useQuestions'
import { listClasses, listSubjectsForClass } from '@/services/firebase/curriculum'
import type { TaxonomyOption } from '@/types/curriculum'
import { buildEmptyFilters } from '@/lib/repository-workspace'
import {
  computeRepositoryContext,
  DEFAULT_SETUP,
  EXAM_TYPE_OPTIONS,
  sectionsForSetup,
  storeSetup,
  type PaperSetupState,
} from '@/lib/paper-builder'
import {
  applySubjectMediumDefault,
  defaultGeneralInstructions,
  defaultMediumForSubject,
  mediumLabel,
  PAPER_MEDIUM_OPTIONS,
  type PaperMedium,
} from '@/lib/paper-medium'
import { listBlueprints } from '@/services/firebase/blueprints'
import type { BlueprintListItem } from '@/types/blueprint'
import type { PaperInstanceLayer } from '@/types/paper-instance'

function Field({
  label,
  children,
  span,
}: {
  label: string
  children: ReactNode
  span?: 2
}) {
  return (
    <label
      className="pc-pb-setup-field"
      style={span === 2 ? { gridColumn: 'span 2' } : undefined}
    >
      <span className="pc-pb-setup-field-label">{label}</span>
      {children}
    </label>
  )
}

export function PaperSetupFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const blueprintParam = searchParams.get('blueprintId')
  const { isAdmin, user } = useAuth()
  const {
    isScoped,
    hasFullAccess,
    classLabels,
    subjectsForClass,
    hasAssignments,
    isActive,
    assignments,
    assignmentScope,
  } = useTeacherScope()
  const [setup, setSetup] = useState<PaperSetupState>({ ...DEFAULT_SETUP })
  const [mode, setMode] = useState<'manual' | 'blueprint'>(blueprintParam ? 'blueprint' : 'manual')
  const [blueprints, setBlueprints] = useState<BlueprintListItem[]>([])
  const [blueprintsLoading, setBlueprintsLoading] = useState(false)
  const [curriculumClasses, setCurriculumClasses] = useState<TaxonomyOption[]>([])
  const [curriculumSubjects, setCurriculumSubjects] = useState<TaxonomyOption[]>([])

  useEffect(() => {
    listClasses()
      .then(setCurriculumClasses)
      .catch(() => setCurriculumClasses([]))
  }, [])

  useEffect(() => {
    if (!user) return
    setBlueprintsLoading(true)
    listBlueprints()
      .then(setBlueprints)
      .catch(() => setBlueprints([]))
      .finally(() => setBlueprintsLoading(false))
  }, [user])

  useEffect(() => {
    if (blueprintParam) setMode('blueprint')
  }, [blueprintParam])

  const classNumber = useMemo(() => {
    const hit = curriculumClasses.find((c) => c.label === setup.classLabel)
    const n = hit ? Number(hit.id) : NaN
    return Number.isFinite(n) ? n : null
  }, [curriculumClasses, setup.classLabel])

  useEffect(() => {
    if (!classNumber) {
      setCurriculumSubjects([])
      return
    }
    listSubjectsForClass(classNumber)
      .then(setCurriculumSubjects)
      .catch(() => setCurriculumSubjects([]))
  }, [classNumber])

  const repoFilters = useMemo(
    () => ({
      ...buildEmptyFilters(isAdmin),
      statuses: { Published: true },
    }),
    [isAdmin],
  )

  const { allLoaded, loading } = useQuestions({ isAdmin, filters: repoFilters })

  const published = useMemo(
    () => allLoaded.filter((q) => q.statusRaw === 'published' && !q.isInTrash),
    [allLoaded],
  )

  const repoContext = useMemo(
    () => computeRepositoryContext(published, setup.classLabel, setup.subject),
    [published, setup.classLabel, setup.subject],
  )

  const activeSections = sectionsForSetup(setup)

  const classOptions = useMemo(() => {
    if (isScoped && !hasFullAccess) return classLabels
    const fromCurriculum = curriculumClasses.map((c) => c.label)
    const fromData = [...new Set(published.map((q) => q.classLabel))].sort()
    return [...new Set([...fromCurriculum, ...fromData])].sort(
      (a, b) =>
        (curriculumClasses.find((c) => c.label === a)?.id ?? a).localeCompare(
          curriculumClasses.find((c) => c.label === b)?.id ?? b,
          undefined,
          { numeric: true },
        ),
    )
  }, [published, curriculumClasses, isScoped, hasFullAccess, classLabels])

  const subjectOptions = useMemo(() => {
    if (isScoped && !hasFullAccess) return subjectsForClass(setup.classLabel)
    const fromCurriculum = curriculumSubjects.map((s) => s.label)
    const fromData = [...new Set(published.map((q) => q.subject))].sort()
    return [...new Set([...fromCurriculum, ...fromData])].sort()
  }, [published, curriculumSubjects, isScoped, hasFullAccess, setup.classLabel, subjectsForClass])

  function patch<K extends keyof PaperSetupState>(key: K, value: PaperSetupState[K]) {
    setSetup((prev) => ({ ...prev, [key]: value }))
  }

  function handleStart(instanceLayer?: PaperInstanceLayer) {
    if (isScoped && !isActive) return
    if (isScoped && !hasAssignments) return
    if (isScoped && !setupMatchesAssignments(setup, assignments, assignmentScope)) return
    storeSetup(setup)
    navigate('/app/builder', { state: { setup, instanceLayer } })
  }

  function handleBlueprintApply(payload: {
    setup: PaperSetupState
    instanceLayer: PaperInstanceLayer
  }) {
    setSetup(payload.setup)
    storeSetup(payload.setup)
    navigate('/app/builder', {
      state: { setup: payload.setup, instanceLayer: payload.instanceLayer },
    })
  }

  const assignmentOk =
    !isScoped || setupMatchesAssignments(setup, assignments, assignmentScope)

  const canStart =
    setup.examinationName.trim().length > 0 &&
    setup.academicSession.trim().length > 0 &&
    setup.classLabel.length > 0 &&
    setup.subject.length > 0 &&
    setup.totalMarks > 0 &&
    setup.durationLabel.trim().length > 0 &&
    (!isScoped || (isActive && hasAssignments && assignmentOk))

  if (mode === 'blueprint') {
    return (
      <div className="pc-pb-setup-screen pc-dots">
        <div className="pc-pb-setup-card pc-pb-setup-card-wide">
          <BlueprintSetupPicker
            blueprints={blueprints}
            loading={blueprintsLoading}
            onApply={handleBlueprintApply}
            onCancel={() => setMode('manual')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="pc-pb-setup-screen pc-dots">
      <div className="pc-pb-setup-card">
        <header className="pc-pb-setup-hero">
          <div className="pc-pb-setup-hero-icon" aria-hidden>
            <FileText size={20} strokeWidth={1.6} />
          </div>
          <div>
            <p className="pc-pb-setup-kicker">New examination paper</p>
            <h1 className="pc-pb-setup-title">Set up your paper</h1>
            <p className="pc-pb-setup-lead">
              Examination identity, structure, and repository context. You can change
              anything later while composing.
            </p>
          </div>
        </header>

        <section className="pc-pb-setup-section">
          <h2 className="pc-pb-setup-section-title">Examination identity</h2>
          <p className="pc-pb-setup-section-lead">
            How this paper will appear on the canvas and in approvals.
          </p>
          <div className="pc-pb-setup-grid">
            <Field label="Examination name" span={2}>
              <input
                className="pc-pb-setup-input is-serif"
                value={setup.examinationName}
                onChange={(e) => patch('examinationName', e.target.value)}
                placeholder="Half-Yearly Examination"
              />
            </Field>
            <Field label="Academic session">
              <input
                className="pc-pb-setup-input"
                value={setup.academicSession}
                onChange={(e) => patch('academicSession', e.target.value)}
                placeholder="2025–26 · Term II"
              />
            </Field>
            <Field label="Exam type">
              <select
                className="pc-pb-setup-input"
                value={setup.examType}
                onChange={(e) => patch('examType', e.target.value)}
              >
                {EXAM_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Class">
              <select
                className="pc-pb-setup-input"
                value={setup.classLabel}
                onChange={(e) => patch('classLabel', e.target.value)}
              >
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <select
                className="pc-pb-setup-input"
                value={setup.subject}
                onChange={(e) => {
                  const next = e.target.value
                  setSetup((prev) => ({
                    ...prev,
                    ...applySubjectMediumDefault(prev, next),
                  }))
                }}
              >
                {subjectOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Paper medium" span={2}>
              <select
                className="pc-pb-setup-input"
                value={setup.medium}
                onChange={(e) => {
                  const medium = e.target.value as PaperMedium
                  setSetup((prev) => ({
                    ...prev,
                    medium,
                    generalInstructions:
                      prev.generalInstructions === defaultGeneralInstructions(prev.medium)
                        ? defaultGeneralInstructions(medium)
                        : prev.generalInstructions,
                  }))
                }}
              >
                {PAPER_MEDIUM_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <p className="pc-pb-setup-field-hint">
                {PAPER_MEDIUM_OPTIONS.find((m) => m.id === setup.medium)?.hint}
                {setup.subject &&
                setup.medium !== defaultMediumForSubject(setup.subject) ? (
                  <span>
                    {' '}
                    · Suggested for {setup.subject}:{' '}
                    {mediumLabel(defaultMediumForSubject(setup.subject))}
                  </span>
                ) : null}
              </p>
            </Field>
          </div>
        </section>

        <section className="pc-pb-setup-section">
          <h2 className="pc-pb-setup-section-title">Paper structure</h2>
          <p className="pc-pb-setup-section-lead">
            Marks, duration, and section layout for this examination.
          </p>
          <div className="pc-pb-setup-grid">
            <Field label="Total marks">
              <input
                className="pc-pb-setup-input"
                type="number"
                min={1}
                max={200}
                value={setup.totalMarks}
                onChange={(e) => patch('totalMarks', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="Duration">
              <input
                className="pc-pb-setup-input"
                value={setup.durationLabel}
                onChange={(e) => patch('durationLabel', e.target.value)}
                placeholder="3 hours"
              />
            </Field>
            <Field label="Number of sections">
              <select
                className="pc-pb-setup-input"
                value={setup.sectionCount}
                onChange={(e) =>
                  patch('sectionCount', Number(e.target.value) as 1 | 2 | 3)
                }
              >
                <option value={1}>1 section</option>
                <option value={2}>2 sections</option>
                <option value={3}>3 sections</option>
              </select>
            </Field>
            <Field label="Structure notes" span={2}>
              <input
                className="pc-pb-setup-input"
                value={setup.structureNotes}
                onChange={(e) => patch('structureNotes', e.target.value)}
                placeholder="Optional — internal choice in Section B, etc."
              />
            </Field>
          </div>

          <div className="pc-pb-setup-section-cards">
            {activeSections.map((s) => (
              <div key={s.id} className="pc-pb-setup-section-card">
                <div className="pc-pb-setup-section-card-title">
                  Section {s.letter}{' '}
                  <em>· {s.name.split(' · ')[0]}</em>
                </div>
                <div className="pc-pb-setup-section-card-meta">
                  <span>
                    <span className="pc-num">{s.plannedCount}</span> questions
                  </span>
                  <span>
                    {s.marksEach} × {s.plannedCount} marks
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {setup.classLabel && setup.subject ? (
          <section className="pc-pb-setup-section">
            <h2 className="pc-pb-setup-section-title">Repository context</h2>
            <p className="pc-pb-setup-section-lead">
              Published questions available for {setup.classLabel} · {setup.subject}.
              The browser will filter to these automatically when you compose.
            </p>
            <div className="pc-pb-setup-context">
              {loading && !repoContext ? (
                <p className="pc-pb-setup-context-loading">Loading repository…</p>
              ) : repoContext ? (
                <>
                  <div className="pc-pb-setup-context-stats">
                    <div className="pc-pb-setup-context-stat">
                      <span className="pc-pb-setup-context-stat-val pc-serif pc-num">
                        {repoContext.questionCount}
                      </span>
                      <span className="pc-pb-setup-context-stat-label">
                        questions in bank
                      </span>
                    </div>
                    <div className="pc-pb-setup-context-stat">
                      <span className="pc-pb-setup-context-stat-val pc-serif pc-num">
                        {repoContext.chapters.length}
                      </span>
                      <span className="pc-pb-setup-context-stat-label">
                        chapters covered
                      </span>
                    </div>
                    <div className="pc-pb-setup-context-stat">
                      <span className="pc-pb-setup-context-stat-val pc-serif pc-num">
                        {repoContext.coveragePct}%
                      </span>
                      <span className="pc-pb-setup-context-stat-label">
                        syllabus breadth
                      </span>
                    </div>
                  </div>
                  {repoContext.chapters.length > 0 ? (
                    <div className="pc-pb-setup-chapters">
                      <div className="pc-pb-setup-chapters-label">Available chapters</div>
                      <ul className="pc-pb-setup-chapter-list">
                        {repoContext.chapters.slice(0, 8).map((ch) => (
                          <li key={ch.name}>
                            <span>{ch.name}</span>
                            <span className="pc-num">{ch.count}</span>
                          </li>
                        ))}
                      </ul>
                      {repoContext.chapters.length > 8 ? (
                        <p className="pc-pb-setup-chapters-more">
                          +{repoContext.chapters.length - 8} more chapters
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="pc-pb-setup-coverage-note">{repoContext.coverageLabel}</p>
                  <div className="pc-bar is-primary" style={{ marginTop: 10 }}>
                    <span style={{ width: `${repoContext.coveragePct}%` }} />
                  </div>
                </>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="pc-pb-setup-section">
          <h2 className="pc-pb-setup-section-title">Paper instructions</h2>
          <p className="pc-pb-setup-section-lead">
            Optional general instructions printed on the examination paper.
          </p>
          <textarea
            className="pc-pb-setup-textarea"
            rows={4}
            value={setup.generalInstructions}
            onChange={(e) => patch('generalInstructions', e.target.value)}
            placeholder="Answer all questions. Figures to the right indicate full marks."
          />
        </section>

        <footer className="pc-pb-setup-footer">
          {isScoped && !hasAssignments ? (
            <p className="pc-pb-setup-footer-hint" style={{ color: 'var(--pc-warning-text)' }}>
              Ask an administrator to assign your classes and subjects before composing.
            </p>
          ) : isScoped && !assignmentOk && setup.classLabel && setup.subject ? (
            <p className="pc-pb-setup-footer-hint" style={{ color: 'var(--pc-warning-text)' }}>
              This class and subject are outside your assigned scope.
            </p>
          ) : (
          <p className="pc-pb-setup-footer-hint">
            <Layers size={14} strokeWidth={1.6} />
            Or{' '}
            <button
              type="button"
              className="pc-pb-setup-inline-link"
              onClick={() => setMode('blueprint')}
            >
              start from a blueprint
            </button>{' '}
            to pre-configure sections and marks.
          </p>
          )}
          <div className="pc-pb-setup-footer-actions">
            <button
              type="button"
              className="pc-btn"
              onClick={() => navigate('/app')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="pc-btn"
              onClick={() => setMode('blueprint')}
            >
              <Target size={14} strokeWidth={1.6} />
              From blueprint
            </button>
            <button
              type="button"
              className="pc-btn is-primary"
              disabled={!canStart}
              onClick={() => handleStart()}
            >
              Start composing
              <ArrowRight size={14} strokeWidth={1.6} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
