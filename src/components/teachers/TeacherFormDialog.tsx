import { Check, Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  allSubjectLabelKeys,
  buildAllAssignmentsFromMatrix,
  buildAssignmentsFromMatrix,
  loadClassSubjectMatrix,
  subjectLabelKey,
  uniqueSubjectsInMatrix,
  type ClassSubjectMatrix,
} from '@/lib/teacher-curriculum-matrix'
import { isValidSchoolEmail, normalizeTeacherEmail } from '@/lib/teacher-assignments'
import { getTeacherProfileEmail, saveTeacher } from '@/services/firebase/teachers'
import type {
  TeacherAssignment,
  TeacherAssignmentScope,
  TeacherListItem,
  TeacherUpsertInput,
} from '@/types/teacher'

type Props = {
  open: boolean
  teacher: TeacherListItem | null
  onClose: () => void
  onSaved: () => void
}

function setsFromAssignments(assignments: TeacherAssignment[]) {
  const classNumbers = new Set(assignments.map((a) => a.classNumber))
  const subjectLabelKeys = new Set(
    assignments.map((a) => subjectLabelKey(a.subjectLabel)).filter(Boolean),
  )
  return { classNumbers, subjectLabelKeys }
}

export function TeacherFormDialog({ open, teacher, onClose, onSaved }: Props) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [active, setActive] = useState(true)
  const [assignmentScope, setAssignmentScope] = useState<TeacherAssignmentScope>('full')
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
  const [matrix, setMatrix] = useState<ClassSubjectMatrix[]>([])
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [selectedClassNumbers, setSelectedClassNumbers] = useState<Set<number>>(new Set())
  const [selectedSubjectLabelKeys, setSelectedSubjectLabelKeys] = useState<Set<string>>(
    new Set(),
  )
  const [initialPassword, setInitialPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsLoginSetup = !teacher || teacher.pendingSignIn

  useEffect(() => {
    if (!open) return
    setDisplayName(teacher?.displayName ?? '')
    setEmail(teacher?.email?.trim() ?? '')
    setActive(teacher?.active ?? true)
    const scope = teacher?.assignmentScope ?? (teacher?.assignments.length ? 'custom' : 'full')
    setAssignmentScope(scope)
    setAssignments(teacher?.assignments ?? [])
    setError(null)
    setInitialPassword('')

    const fromTeacher = setsFromAssignments(teacher?.assignments ?? [])
    setSelectedClassNumbers(fromTeacher.classNumbers)
    setSelectedSubjectLabelKeys(fromTeacher.subjectLabelKeys)

    setMatrixLoading(true)
    loadClassSubjectMatrix()
      .then(setMatrix)
      .catch(() => setMatrix([]))
      .finally(() => setMatrixLoading(false))

    if (teacher && !teacher.pendingSignIn && !teacher.email?.trim()) {
      void getTeacherProfileEmail(teacher.id).then((loaded) => {
        if (loaded) setEmail(loaded)
      })
    }
  }, [open, teacher])

  const emailMissing = open && !email.trim()

  const allSubjects = useMemo(() => uniqueSubjectsInMatrix(matrix), [matrix])

  const previewCount = useMemo(() => {
    if (assignmentScope === 'full') return null
    return buildAssignmentsFromMatrix(
      matrix,
      selectedClassNumbers,
      selectedSubjectLabelKeys,
    ).length
  }, [assignmentScope, matrix, selectedClassNumbers, selectedSubjectLabelKeys])

  const allClassNumbers = useMemo(
    () => new Set(matrix.map((r) => r.classNumber)),
    [matrix],
  )
  const allSubjectKeys = useMemo(() => allSubjectLabelKeys(matrix), [matrix])

  function toggleClass(n: number) {
    setSelectedClassNumbers((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  function toggleSubject(label: string) {
    const key = subjectLabelKey(label)
    if (!key) return
    setSelectedSubjectLabelKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectAllClasses() {
    setSelectedClassNumbers(new Set(allClassNumbers))
  }

  function selectAllSubjects() {
    setSelectedSubjectLabelKeys(new Set(allSubjectKeys))
  }

  function clearSelection() {
    setSelectedClassNumbers(new Set())
    setSelectedSubjectLabelKeys(new Set())
  }

  function applyCustomScope() {
    const built = buildAssignmentsFromMatrix(
      matrix,
      selectedClassNumbers,
      selectedSubjectLabelKeys,
    )
    setAssignments(built)
    setAssignmentScope('custom')
    if (built.length === 0) {
      setError(
        'No pairs match — those subjects may not exist for the selected classes in Curriculum. Try other subjects or use Full school access.',
      )
    } else {
      setError(null)
    }
  }

  function assignEverything() {
    const built = buildAllAssignmentsFromMatrix(matrix)
    setAssignments(built)
    setSelectedClassNumbers(new Set(built.map((a) => a.classNumber)))
    setSelectedSubjectLabelKeys(
      new Set(built.map((a) => subjectLabelKey(a.subjectLabel)).filter(Boolean)),
    )
    setAssignmentScope('custom')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Enter the teacher’s full name.')
      return
    }
    const trimmedEmail = normalizeTeacherEmail(email)
    if (!trimmedEmail) {
      setError('Enter a login ID for this teacher.')
      return
    }
    if (!isValidSchoolEmail(trimmedEmail)) {
      setError('Login ID must look like an email (e.g. jitu@school.edu). Nothing is sent by email.')
      return
    }
    if (needsLoginSetup && initialPassword.trim().length < 6) {
      setError('Set an initial password (at least 6 characters) for sign-in.')
      return
    }

    const finalScope = assignmentScope
    let finalAssignments: TeacherAssignment[]

    if (assignmentScope === 'custom') {
      finalAssignments = buildAssignmentsFromMatrix(
        matrix,
        selectedClassNumbers,
        selectedSubjectLabelKeys,
      )
      if (finalAssignments.length === 0) {
        if (selectedClassNumbers.size === 0 || selectedSubjectLabelKeys.size === 0) {
          setError('Select at least one class and one subject, or choose Full school access.')
        } else {
          setError(
            'No class–subject pairs match. Those subjects may not be set up for the selected classes in Curriculum — try different selections or Full school access.',
          )
        }
        return
      }
    } else {
      finalAssignments = []
    }

    const input: TeacherUpsertInput = {
      email: trimmedEmail,
      displayName: displayName.trim(),
      active,
      assignmentScope: finalScope,
      assignments: finalAssignments,
    }

    setSaving(true)
    setError(null)
    try {
      await saveTeacher(input, {
        uid: teacher?.pendingSignIn ? undefined : teacher?.id,
        pendingSignIn: teacher?.pendingSignIn,
        initialPassword: needsLoginSetup ? initialPassword : undefined,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save teacher.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="pc-modal-overlay" role="presentation" onClick={onClose}>
      <form
        className="pc-modal pc-teacher-form"
        role="dialog"
        aria-labelledby="teacher-form-title"
        onClick={(e) => e.stopPropagation()}
        noValidate
        onSubmit={(e) => void handleSubmit(e)}
      >
        <header className="pc-modal-head">
          <div>
            <p className="pc-modal-kicker">Organization</p>
            <h2 id="teacher-form-title" className="pc-modal-title">
              {teacher ? 'Edit teacher' : 'Add teacher'}
            </h2>
            <p className="pc-modal-sub">
              Set identity and what they can access in the repository and paper builder.
            </p>
          </div>
          <button type="button" className="pc-icon-btn" onClick={onClose} aria-label="Close">
            <X size={15} strokeWidth={1.6} />
          </button>
        </header>

        <div className="pc-modal-body pc-scroll">
          {teacher?.pendingSignIn ? (
            <p className="pc-teacher-form-note">
              Not signed in yet — assignments apply when they first log in with this email.
            </p>
          ) : null}

          <section className="pc-teacher-form-section">
            <h3 className="pc-teacher-form-section-title">Identity</h3>
            <div className="pc-teacher-form-grid">
              <label className="pc-field">
                <span className="pc-field-label">Full name</span>
                <input
                  className="pc-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Rajesh Kumar"
                  required
                  aria-required="true"
                />
              </label>
              <label className="pc-field">
                <span className="pc-field-label">Login ID</span>
                <input
                  className={`pc-input${emailMissing ? ' is-empty-required' : ''}`}
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="jitu@school.edu"
                  autoComplete="off"
                  disabled={Boolean(teacher && !teacher.pendingSignIn)}
                  aria-invalid={emailMissing}
                  aria-describedby={emailMissing ? 'teacher-email-warn' : undefined}
                />
                <span className="pc-field-hint">
                  Email-style username only — not used to send mail. The teacher signs in with
                  this ID and the password you set below.
                </span>
              </label>
              {needsLoginSetup ? (
                <label className="pc-field">
                  <span className="pc-field-label">Initial password</span>
                  <input
                    className="pc-input"
                    type="password"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                  <span className="pc-field-hint">
                    Tell the teacher this password in person or on paper. They can change it
                    later when password reset is enabled.
                  </span>
                </label>
              ) : (
                <p className="pc-field-hint pc-teacher-login-locked">
                  Login ID is fixed after the account is created. Password changes are not
                  available in-app yet — create a new login ID if needed.
                </p>
              )}
            </div>
            {emailMissing ? (
              <p id="teacher-email-warn" className="pc-teacher-email-warn" role="status">
                No email was saved for this teacher yet — enter their school email below.
              </p>
            ) : null}
          </section>

          <label className="pc-teacher-status-card">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            <span>
              <strong>Active account</strong>
              <span className="pc-teacher-status-hint">
                Inactive teachers cannot browse or compose papers.
              </span>
            </span>
          </label>

          <section className="pc-teacher-form-section">
            <h3 className="pc-teacher-form-section-title">Repository access</h3>
            <p className="pc-teacher-form-section-lead">
              Choose full school access or pick classes and subjects in bulk — no need to add
              one pair at a time.
            </p>

            <div className="pc-teacher-scope-options" role="radiogroup" aria-label="Access scope">
              <button
                type="button"
                className={`pc-teacher-scope-card${assignmentScope === 'full' ? ' is-selected' : ''}`}
                onClick={() => setAssignmentScope('full')}
              >
                <span className="pc-teacher-scope-card-title">Full school access</span>
                <span className="pc-teacher-scope-card-desc">
                  All classes, all subjects — same reach as browsing the full published
                  repository.
                </span>
                {assignmentScope === 'full' ? (
                  <Check size={14} className="pc-teacher-scope-check" strokeWidth={2} />
                ) : null}
              </button>
              <button
                type="button"
                className={`pc-teacher-scope-card${assignmentScope === 'custom' ? ' is-selected' : ''}`}
                onClick={() => setAssignmentScope('custom')}
              >
                <span className="pc-teacher-scope-card-title">Custom scope</span>
                <span className="pc-teacher-scope-card-desc">
                  Select multiple classes and subjects, then apply in one step.
                </span>
                {assignmentScope === 'custom' ? (
                  <Check size={14} className="pc-teacher-scope-check" strokeWidth={2} />
                ) : null}
              </button>
            </div>

            {assignmentScope === 'custom' ? (
              <div className="pc-teacher-bulk-panel">
                {matrixLoading ? (
                  <p className="pc-teacher-bulk-muted">Loading curriculum…</p>
                ) : (
                  <>
                    <div className="pc-teacher-bulk-toolbar">
                      <button type="button" className="pc-btn is-sm is-ghost" onClick={selectAllClasses}>
                        All classes
                      </button>
                      <button type="button" className="pc-btn is-sm is-ghost" onClick={selectAllSubjects}>
                        All subjects
                      </button>
                      <button
                        type="button"
                        className="pc-btn is-sm is-ghost"
                        onClick={assignEverything}
                      >
                        All combinations
                      </button>
                      <button type="button" className="pc-btn is-sm is-ghost" onClick={clearSelection}>
                        Clear
                      </button>
                    </div>

                    <div className="pc-teacher-chip-block">
                      <div className="pc-teacher-chip-head">
                        <span className="pc-field-label">Classes</span>
                        <span className="pc-num pc-teacher-chip-count">
                          {selectedClassNumbers.size} selected
                        </span>
                      </div>
                      <div className="pc-teacher-chips">
                        {matrix.map((row) => (
                          <button
                            key={row.classNumber}
                            type="button"
                            className={`pc-teacher-chip${selectedClassNumbers.has(row.classNumber) ? ' is-on' : ''}`}
                            onClick={() => toggleClass(row.classNumber)}
                          >
                            {row.classOption.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pc-teacher-chip-block">
                      <div className="pc-teacher-chip-head">
                        <span className="pc-field-label">Subjects</span>
                        <span className="pc-num pc-teacher-chip-count">
                          {selectedSubjectLabelKeys.size} selected
                        </span>
                      </div>
                      <div className="pc-teacher-chips">
                        {allSubjects.map((s) => {
                          const key = subjectLabelKey(s.label)
                          return (
                          <button
                            key={key}
                            type="button"
                            className={`pc-teacher-chip${selectedSubjectLabelKeys.has(key) ? ' is-on' : ''}`}
                            onClick={() => toggleSubject(s.label)}
                          >
                            {s.label}
                          </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pc-teacher-bulk-footer">
                      <p className="pc-teacher-bulk-summary">
                        {previewCount === null ? (
                          'Select classes and subjects above.'
                        ) : previewCount === 0 ? (
                          'No pairs for these classes — pick subjects taught in those grades (see Curriculum).'
                        ) : (
                          <>
                            <strong className="pc-num">{previewCount}</strong> class–subject
                            {previewCount === 1 ? ' pair' : ' pairs'} will be assigned
                          </>
                        )}
                      </p>
                      <button
                        type="button"
                        className="pc-btn is-sm is-primary"
                        disabled={!previewCount}
                        onClick={applyCustomScope}
                      >
                        Apply scope
                      </button>
                    </div>

                    {assignments.length > 0 ? (
                      <details className="pc-teacher-assign-details">
                        <summary>
                          Current scope ({assignments.length} pair
                          {assignments.length === 1 ? '' : 's'})
                        </summary>
                        <ul className="pc-teacher-assign-list">
                          {assignments.slice(0, 24).map((a) => (
                            <li key={`${a.classLabel}-${a.subjectId}`}>
                              {a.classLabel} · {a.subjectLabel}
                            </li>
                          ))}
                          {assignments.length > 24 ? (
                            <li className="pc-teacher-assign-more">
                              +{assignments.length - 24} more
                            </li>
                          ) : null}
                        </ul>
                      </details>
                    ) : null}
                  </>
                )}
              </div>
            ) : (
              <p className="pc-teacher-full-note">
                This teacher can use every published question and create papers for any class
                and subject in the curriculum.
              </p>
            )}
          </section>

          {error ? <p className="pc-form-error">{error}</p> : null}
        </div>

        <footer className="pc-modal-foot">
          <button type="button" className="pc-btn is-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="pc-btn is-primary" disabled={saving || matrixLoading}>
            {saving ? <Loader2 size={14} className="pc-spin" /> : null}
            Save teacher
          </button>
        </footer>
      </form>
    </div>
  )
}
