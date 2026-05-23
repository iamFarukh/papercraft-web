import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FolderOpen,
  GripVertical,
  Info,
  Lock,
  Sparkles,
  Upload,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { notifyBulkImportCompleted } from '@/services/firebase/workflow-notifications'
import { downloadSampleTemplate } from '@/lib/bulk-import/sample-template'
import {
  autoMapColumns,
  FIELD_LABELS,
  IMPORT_FIELDS,
  REQUIRED_IMPORT_FIELDS,
  unmappedRequired,
  type ImportField,
} from '@/lib/bulk-import/fields'
import {
  getMappingRows,
  mappingStats,
  setMappingForColumn,
} from '@/lib/bulk-import/mapping-ui'
import { parseImportFile, supportedImportFile } from '@/lib/bulk-import/parse-file'
import type { ParsedSheet } from '@/lib/bulk-import/parse-file'
import { ImportRowEditor } from '@/components/bulk-import/ImportRowEditor'
import { executeValidatedImport } from '@/lib/bulk-import/execute-import'
import { createImportBatch, type ImportBatchMeta } from '@/lib/bulk-import/import-batch'
import {
  buildApprovalsFromRows,
  collectCurriculumToCreate,
  rowDataIssues,
  rowStatusLabel,
  summarizeValidation,
  validateImportRows,
  type ValidatedImportRow,
} from '@/lib/bulk-import/validate-rows'
import {
  ImportWizardFooter,
  ImportWizardLayout,
  type ImportStepId,
} from '@/components/bulk-import/ImportWizardLayout'

type PreviewFilter = 'all' | 'ready' | 'curriculum' | 'review' | 'failed'

function formatFileMeta(parsed: ParsedSheet): string {
  const kb = parsed.rows.length > 0 ? `${parsed.rows.length} rows` : '0 rows'
  return `${kb} · ${parsed.headers.length} columns`
}

function rowFilterState(row: ValidatedImportRow): PreviewFilter {
  const label = rowStatusLabel(row)
  if (label === 'Needs fix') return 'failed'
  if (label === 'New curriculum') return 'curriculum'
  if (label === 'Review') return 'review'
  return 'ready'
}

export function BulkImportWizard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { push: toast } = useToast()

  const [step, setStep] = useState<ImportStepId>('upload')
  const [parsed, setParsed] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<Partial<Record<ImportField, string>>>({})
  const [validated, setValidated] = useState<ValidatedImportRow[] | null>(null)
  const [validating, setValidating] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importedCount, setImportedCount] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [previewFilter, setPreviewFilter] = useState<PreviewFilter>('all')
  const [includeWarnings, setIncludeWarnings] = useState(true)
  const [confirmPublish, setConfirmPublish] = useState(true)
  const [importBatch, setImportBatch] = useState<ImportBatchMeta | null>(null)
  const [rowEdits, setRowEdits] = useState<Record<number, Record<string, string>>>({})

  function rowsForValidation(): Record<string, string>[] {
    if (!parsed) return []
    return parsed.rows.map((raw, i) => ({
      ...raw,
      ...rowEdits[i + 2],
    }))
  }

  const summary = useMemo(
    () => (validated ? summarizeValidation(validated) : null),
    [validated],
  )

  const curriculumPlan = useMemo(
    () => (validated ? collectCurriculumToCreate(validated, mapping) : []),
    [validated, mapping],
  )

  const mappingRows = useMemo(
    () => (parsed ? getMappingRows(parsed.headers, parsed.rows, mapping) : []),
    [parsed, mapping],
  )

  const mapStats = useMemo(() => mappingStats(mapping), [mapping])

  const filteredPreview = useMemo(() => {
    if (!validated) return []
    if (previewFilter === 'all') return validated
    return validated.filter((r) => rowFilterState(r) === previewFilter)
  }, [validated, previewFilter])

  const handleFile = useCallback(async (file: File) => {
    setFileError(null)
    if (!supportedImportFile(file.name)) {
      setFileError('Use a .csv or .xlsx file.')
      return
    }
    try {
      const sheet = await parseImportFile(file)
      setParsed(sheet)
      setImportBatch(createImportBatch(file.name))
      setRowEdits({})
      setMapping(autoMapColumns(sheet.headers))
      setValidated(null)
      setStep('mapping')
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Could not read file.')
    }
  }, [])

  const runValidation = useCallback(async () => {
    if (!parsed) return
    const missing = unmappedRequired(mapping)
    if (missing.length > 0) {
      toast(
        `Map required fields: ${missing.map((f) => FIELD_LABELS[f]).join(', ')}`,
        'info',
      )
      return
    }
    setValidating(true)
    try {
      const rows = await validateImportRows(rowsForValidation(), mapping, {
        subjects: new Set(),
        chapters: new Set(),
        topics: new Set(),
      })
      setValidated(rows)
      setPreviewFilter('all')
      setStep('preview')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Validation failed', 'info')
    } finally {
      setValidating(false)
    }
  }, [parsed, mapping, toast, rowEdits])

  const applyRowEdit = useCallback(
    async (rowNumber: number, patch: Record<string, string>) => {
      setRowEdits((prev) => ({ ...prev, [rowNumber]: { ...prev[rowNumber], ...patch } }))
      if (!parsed) return
      setValidating(true)
      try {
        const merged = parsed.rows.map((raw, i) => ({
          ...raw,
          ...rowEdits[i + 2],
          ...(i + 2 === rowNumber ? patch : {}),
        }))
        const rows = await validateImportRows(merged, mapping, {
          subjects: new Set(),
          chapters: new Set(),
          topics: new Set(),
        })
        setValidated(rows)
        toast('Row updated — validation refreshed', 'success')
      } catch (err) {
        toast(err instanceof Error ? err.message : 'Re-validation failed', 'info')
      } finally {
        setValidating(false)
      }
    },
    [parsed, mapping, rowEdits, toast],
  )

  const handleImport = useCallback(async () => {
    if (!validated || !user?.uid || !confirmPublish) return
    const approvals = buildApprovalsFromRows(validated, mapping)
    setImporting(true)
    try {
      const result = await executeValidatedImport(
        validated,
        mapping,
        approvals,
        user.uid,
        importBatch ?? undefined,
      )
      setImportedCount(result.imported)
      setStep('complete')
      toast(`${result.imported} questions published to the repository`, 'success')
      void notifyBulkImportCompleted({
        adminUserId: user.uid,
        fileName: importBatch?.fileName ?? 'import file',
        imported: result.imported,
        batchId: importBatch?.id,
      }).catch(() => undefined)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Import failed', 'info')
    } finally {
      setImporting(false)
    }
  }, [validated, mapping, user?.uid, confirmPublish, importBatch, toast])

  const mappingPreview = useMemo(() => {
    if (!parsed?.rows[0]) return null
    const row = parsed.rows[0]!
    return {
      en: mapping.questionTextEn ? row[mapping.questionTextEn] ?? '' : '',
      hi: mapping.questionTextHi ? row[mapping.questionTextHi] ?? '' : '',
      subject: mapping.subject ? row[mapping.subject] ?? '' : '',
      chapter: mapping.chapter ? row[mapping.chapter] ?? '' : '',
      type: mapping.questionType ? row[mapping.questionType] ?? '' : '',
      marks: mapping.marks ? row[mapping.marks] ?? '' : '',
    }
  }, [parsed, mapping])

  if (step === 'complete') {
    return (
      <ImportWizardLayout step="complete">
        <div className="pc-csv-done pc-scroll">
          <div className="pc-csv-done-inner">
            <div className="pc-csv-done-hero">
              <div className="pc-csv-done-icon-wrap">
                <CheckCircle2 size={32} strokeWidth={2} />
              </div>
              <div>
                <p className="pc-csv-kicker">Step 5 of 5 · Import complete</p>
                <h1 className="pc-csv-done-title pc-serif">
                  <span className="pc-num">{importedCount}</span> questions published
                </h1>
                <p className="pc-csv-done-meta">
                  {importBatch?.fileName
                    ? `From ${importBatch.fileName} · visible in repository and bulk upload filters`
                    : 'Saved to the repository · ready for papers'}
                </p>
              </div>
            </div>

            {importBatch ? (
              <div className="pc-csv-draft-banner is-published">
                <span className="pc-csv-draft-banner-icon">
                  <CheckCircle2 size={18} strokeWidth={1.6} />
                </span>
                <div>
                  <p className="pc-csv-draft-banner-title pc-serif">Bulk upload batch</p>
                  <p className="pc-csv-draft-banner-body pc-mono">{importBatch.fileName}</p>
                </div>
              </div>
            ) : null}

            <div className="pc-csv-done-actions">
              <button
                type="button"
                className="pc-btn is-primary is-lg"
                onClick={() => navigate('/app/repository')}
              >
                Go to repository
              </button>
              <button
                type="button"
                className="pc-btn is-lg"
                onClick={() => {
                  setStep('upload')
                  setParsed(null)
                  setValidated(null)
                  setMapping({})
                }}
              >
                <Upload size={14} strokeWidth={1.6} />
                Import another file
              </button>
            </div>
          </div>
        </div>
      </ImportWizardLayout>
    )
  }

  return (
    <ImportWizardLayout
      step={step}
      fileName={parsed?.fileName}
      fileMeta={parsed ? formatFileMeta(parsed) : undefined}
      footer={
        <ImportWizardFooter
          left={
            step === 'upload' ? (
              <span className="pc-csv-foot-note">
                <CheckCircle2 size={12} strokeWidth={1.6} />
                Bulk imports are <strong>published</strong> immediately and tagged with your file name.
              </span>
            ) : step === 'mapping' && parsed ? (
              <span className="pc-csv-foot-note">
                <span className="pc-csv-foot-ok">
                  {mapStats.mapped} mapped
                </span>
                {' · '}
                {mapStats.requiredOk ? (
                  <span className="pc-csv-foot-ok">All required fields present</span>
                ) : (
                  <span className="pc-csv-foot-warn">Required fields missing</span>
                )}
              </span>
            ) : step === 'preview' && summary ? (
              <label className="pc-csv-foot-check">
                <input
                  type="checkbox"
                  checked={includeWarnings}
                  onChange={(e) => setIncludeWarnings(e.target.checked)}
                />
                Include warning rows in import
              </label>
            ) : step === 'summary' ? (
              <label className="pc-csv-foot-check">
                <input
                  type="checkbox"
                  checked={confirmPublish}
                  onChange={(e) => setConfirmPublish(e.target.checked)}
                />
                I understand all questions will be <strong>published</strong> immediately
              </label>
            ) : null
          }
          right={
            <>
              {step !== 'upload' && (
                <button
                  type="button"
                  className="pc-btn is-sm"
                  onClick={() => {
                    if (step === 'mapping') setStep('upload')
                    else if (step === 'preview') setStep('mapping')
                    else if (step === 'summary') setStep('preview')
                  }}
                >
                  <ArrowLeft size={13} strokeWidth={1.6} />
                  Back
                </button>
              )}
              {step === 'upload' && (
                <Link to="/app/repository" className="pc-btn is-sm">
                  Cancel
                </Link>
              )}
              {step === 'mapping' && (
                <button
                  type="button"
                  className="pc-btn is-primary is-sm"
                  disabled={validating || !mapStats.requiredOk}
                  onClick={() => void runValidation()}
                >
                  {validating ? 'Validating…' : `Validate ${parsed?.rows.length ?? 0} rows`}
                  <ArrowRight size={13} strokeWidth={1.6} />
                </button>
              )}
              {step === 'preview' && summary && (
                <button
                  type="button"
                  className="pc-btn is-primary is-sm"
                  disabled={summary.failed > 0 || summary.importable === 0}
                  onClick={() => setStep('summary')}
                >
                  Continue · {summary.importable} rows
                  <ArrowRight size={13} strokeWidth={1.6} />
                </button>
              )}
              {step === 'summary' && summary && (
                <button
                  type="button"
                  className="pc-btn is-primary is-sm"
                  disabled={importing || !confirmPublish || summary.importable === 0}
                  onClick={() => void handleImport()}
                >
                  {importing ? 'Importing…' : `Publish ${summary.importable} questions`}
                </button>
              )}
            </>
          }
        />
      }
    >
      {step === 'upload' && (
        <div className="pc-csv-upload-grid">
          <div className="pc-csv-upload-main">
            <div
              className={'pc-csv-drop' + (dragOver ? ' is-drag' : '')}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) void handleFile(file)
              }}
            >
              <div className="pc-csv-file-stack" aria-hidden>
                {['csv', 'xlsx', 'csv'].map((ext, i) => (
                  <div
                    key={i}
                    className={
                      'pc-csv-file-card' + (i === 2 ? ' is-front' : '')
                    }
                    style={{
                      transform: `translateX(${i === 0 ? -28 : i === 1 ? 28 : 0}px) rotate(${i === 0 ? -8 : i === 1 ? 6 : 0}deg)`,
                      opacity: i === 2 ? 1 : i === 1 ? 0.7 : 0.5,
                    }}
                  >
                    <div className="pc-csv-file-lines">
                      {[1, 0.7, 0.85, 0.6].map((w, j) => (
                        <span key={j} style={{ width: `${w * 100}%` }} />
                      ))}
                    </div>
                    <span className="pc-csv-file-ext">{ext}</span>
                  </div>
                ))}
              </div>

              <h2 className="pc-csv-drop-title pc-serif">
                Drop your question bank here
              </h2>
              <p className="pc-csv-drop-lead">
                We parse your file, map columns, and validate every row before
                anything is written. You stay in control.
              </p>

              <div className="pc-csv-drop-actions">
                <label className="pc-btn is-primary is-lg">
                  <FolderOpen size={15} strokeWidth={1.6} />
                  Browse files
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void handleFile(file)
                    }}
                  />
                </label>
                <span className="pc-csv-drop-or">or drop here</span>
              </div>

              <div className="pc-csv-drop-meta">
                <span className="pc-tag is-outline">.csv</span>
                <span className="pc-tag is-outline">.xlsx</span>
                <span className="pc-csv-drop-meta-sep" />
                <span>UTF-8 · Devanagari supported</span>
              </div>
            </div>

            {fileError && (
              <p className="pc-csv-error" role="alert">
                <AlertCircle size={14} /> {fileError}
              </p>
            )}

            <div className="pc-csv-templates">
              <p className="pc-csv-kicker">New to bulk import?</p>
              <div className="pc-csv-template-cards">
                {(['csv', 'xlsx'] as const).map((fmt) => (
                  <div key={fmt} className="pc-csv-template-card">
                    <span
                      className={
                        'pc-csv-template-badge' +
                        (fmt === 'csv' ? ' is-green' : ' is-blue')
                      }
                    >
                      {fmt.toUpperCase()}
                    </span>
                    <div>
                      <div className="pc-csv-template-title">Sample template</div>
                      <div className="pc-csv-template-desc">
                        {fmt === 'csv'
                          ? 'Lightweight · any editor'
                          : 'Pre-formatted · Excel'}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="pc-btn is-sm"
                      onClick={() => downloadSampleTemplate(fmt)}
                    >
                      <Download size={12} strokeWidth={1.6} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="pc-csv-upload-aside">
            <p className="pc-csv-kicker">How import works</p>
            <div className="pc-panel pc-panel-pad pc-csv-how-panel">
              {[
                ['upload', 'You upload, we parse', 'CSV and XLSX accepted in your session.'],
                ['sliders', 'Map columns', 'Auto-detected when possible. You confirm.'],
                ['check', 'Every row validated', 'Types, marks, duplicates, curriculum.'],
                ['eye', 'Preview before commit', 'Nothing is skipped silently.'],
                ['check', 'Published automatically', 'Questions go live in the repository immediately.'],
              ].map(([icon, title, body], i) => (
                <div key={title} className="pc-csv-how-row">
                  <span className="pc-csv-how-icon">
                    {icon === 'upload' && <Upload size={13} />}
                    {icon === 'check' && <Check size={13} />}
                    {icon === 'lock' && <Lock size={13} />}
                    {icon === 'eye' && <Info size={13} />}
                    {icon === 'sliders' && <Sparkles size={13} />}
                  </span>
                  <div>
                    <div className="pc-csv-how-title">{title}</div>
                    <div className="pc-csv-how-body">{body}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="pc-csv-kicker" style={{ marginTop: 22 }}>
              Required columns
            </p>
            <div className="pc-csv-col-tags">
              {REQUIRED_IMPORT_FIELDS.map((f) => (
                <span key={f} className="pc-tag pc-mono">
                  {f}
                </span>
              ))}
            </div>
          </aside>
        </div>
      )}

      {step === 'mapping' && parsed && (
        <div className="pc-csv-split">
          <section className="pc-csv-split-main pc-scroll">
            <div className="pc-csv-step-head">
              <p className="pc-csv-kicker">Step 2 of 5</p>
              <h2 className="pc-csv-step-title pc-serif">
                Map your columns to PaperCraft fields
              </h2>
              <p className="pc-csv-step-lead">
                {mapStats.mapped} of {parsed.headers.length} columns mapped. Review
                auto-detected mappings below.
              </p>
            </div>

            <div className="pc-csv-banner is-success">
              <Sparkles size={14} strokeWidth={1.6} />
              <span>
                <strong>Auto-detected</strong> from headers. Adjust any mapping
                that looks incorrect.
              </span>
              <button
                type="button"
                className="pc-btn is-sm"
                onClick={() => setMapping(autoMapColumns(parsed.headers))}
              >
                Reset all
              </button>
            </div>

            <div className="pc-csv-map-table">
              <div className="pc-csv-map-table-head">
                <span>CSV column</span>
                <span>Sample value</span>
                <span aria-hidden />
                <span>PaperCraft field</span>
              </div>
              {mappingRows.map((row) => {
                const required =
                  row.field !== '__skip' &&
                  REQUIRED_IMPORT_FIELDS.includes(row.field)
                return (
                  <div
                    key={row.csv}
                    className={
                      'pc-csv-map-table-row' +
                      (row.field === '__skip' ? ' is-skip' : '')
                    }
                  >
                    <div className="pc-csv-map-csv">
                      <GripVertical size={11} className="pc-csv-drag" />
                      <span className="pc-mono">{row.csv}</span>
                    </div>
                    <div
                      className={
                        'pc-csv-map-sample' +
                        (row.csv.toLowerCase().includes('hi') ? ' pc-serif' : '')
                      }
                    >
                      {row.sample || '—'}
                    </div>
                    <ArrowRight size={13} className="pc-csv-map-arrow" />
                    <select
                      className={
                        'pc-csv-map-select' +
                        (required ? ' is-mapped' : '') +
                        (row.field === '__skip' ? ' is-skip' : '')
                      }
                      value={row.field}
                      onChange={(e) =>
                        setMapping((m) =>
                          setMappingForColumn(
                            m,
                            row.csv,
                            e.target.value as ImportField | '__skip',
                          ),
                        )
                      }
                    >
                      <option value="__skip">— Skip column —</option>
                      {IMPORT_FIELDS.map((f) => (
                        <option key={f} value={f}>
                          {FIELD_LABELS[f]}
                          {REQUIRED_IMPORT_FIELDS.includes(f) ? ' *' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </section>

          <aside className="pc-csv-split-aside pc-scroll">
            <p className="pc-csv-kicker">Row 1 preview</p>
            {mappingPreview && (mappingPreview.en || mappingPreview.hi) ? (
              <div className="pc-panel pc-panel-pad pc-csv-preview-card">
                <div className="pc-csv-preview-head">
                  <span className="pc-mono">Row 1</span>
                  <span className="pc-tag is-success">will be Published</span>
                </div>
                {mappingPreview.en && (
                  <p className="pc-serif pc-csv-preview-en">{mappingPreview.en}</p>
                )}
                {mappingPreview.hi && (
                  <p className="pc-serif pc-csv-preview-hi">{mappingPreview.hi}</p>
                )}
                <div className="pc-csv-preview-meta">
                  {mappingPreview.type && (
                    <span className="pc-tag is-ink">{mappingPreview.type}</span>
                  )}
                  {mappingPreview.marks && (
                    <span className="pc-num">{mappingPreview.marks}m</span>
                  )}
                </div>
                {(mappingPreview.subject || mappingPreview.chapter) && (
                  <p className="pc-csv-preview-chapter">
                    {mappingPreview.subject}
                    {mappingPreview.chapter ? ` · ${mappingPreview.chapter}` : ''}
                  </p>
                )}
              </div>
            ) : (
              <div className="pc-panel pc-panel-pad">
                <p className="pc-csv-step-lead">
                  Map question columns to see a live preview.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}

      {step === 'preview' && validated && summary && (
        <div className="pc-csv-split">
          <section className="pc-csv-split-main pc-scroll">
            <div className="pc-csv-step-head">
              <p className="pc-csv-kicker">Step 3 of 5</p>
              <h2 className="pc-csv-step-title pc-serif">
                Validation results
                <em> · {validated.length} rows</em>
              </h2>
            </div>

            <div className="pc-csv-stat-tiles">
              {[
                { label: 'Valid rows', v: summary.ready, tone: 'success' },
                { label: 'New curriculum', v: summary.newCurriculum, tone: 'primary' },
                { label: 'Warnings', v: summary.review, tone: 'warning' },
                { label: 'Failed', v: summary.failed, tone: 'danger' },
              ].map((s) => (
                <div key={s.label} className="pc-csv-stat-tile">
                  <span className={'pc-csv-stat-dot is-' + s.tone} />
                  <span className="pc-csv-stat-label">{s.label}</span>
                  <span className={'pc-csv-stat-val pc-serif pc-num is-' + s.tone}>
                    {s.v}
                  </span>
                </div>
              ))}
            </div>

            <div className="pc-csv-filter-tabs" role="tablist">
              {(
                [
                  ['all', 'All', validated.length],
                  ['ready', 'Valid', summary.ready],
                  ['curriculum', 'New refs', summary.newCurriculum],
                  ['review', 'Warnings', summary.review],
                  ['failed', 'Failed', summary.failed],
                ] as const
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={previewFilter === id}
                  className={
                    'pc-csv-filter-tab' + (previewFilter === id ? ' is-active' : '')
                  }
                  onClick={() => setPreviewFilter(id)}
                >
                  {label}
                  <span className="pc-num">{count}</span>
                </button>
              ))}
            </div>

            <div className="pc-csv-validate-table">
              <div className="pc-csv-validate-head">
                <span>Row</span>
                <span>Question / issue</span>
                <span>Status</span>
              </div>
              {filteredPreview.map((row) => {
                const state = rowFilterState(row)
                const label = rowStatusLabel(row)
                const issues = rowDataIssues(row)
                const en =
                  mapping.questionTextEn && row.raw[mapping.questionTextEn]
                const hi =
                  mapping.questionTextHi && row.raw[mapping.questionTextHi]
                return (
                  <div
                    key={row.rowNumber}
                    className={'pc-csv-validate-row is-' + state}
                  >
                    <span className="pc-mono pc-num">
                      {String(row.rowNumber).padStart(3, '0')}
                    </span>
                    <div>
                      <p className="pc-serif pc-csv-validate-q">
                        {en || hi || '—'}
                      </p>
                      {issues.length > 0 && (
                        <p className={'pc-csv-validate-issue is-' + state}>
                          {issues.join(' · ')}
                        </p>
                      )}
                      {state === 'failed' && (
                        <ImportRowEditor
                          rowNumber={row.rowNumber}
                          raw={{ ...row.raw, ...rowEdits[row.rowNumber] }}
                          mapping={mapping}
                          onSave={(num, patch) => void applyRowEdit(num, patch)}
                        />
                      )}
                      {state === 'curriculum' && issues.length === 0 && (
                        <p className="pc-csv-validate-issue is-curriculum">
                          New curriculum — created on import
                        </p>
                      )}
                    </div>
                    <span className={'pc-csv-status is-' + state}>{label}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <aside className="pc-csv-split-aside pc-scroll">
            {curriculumPlan.length > 0 && (
              <>
                <p className="pc-csv-kicker">New curriculum</p>
                <div className="pc-csv-curriculum-panel">
                  <p className="pc-csv-curriculum-lead">
                    These entries will be created when you import.
                  </p>
                  <ul>
                    {curriculumPlan.map((item) => (
                      <li key={item.key}>
                        <span>Class {item.classNumber}</span>
                        <span>
                          {item.subject}
                          {item.chapter ? ` · ${item.chapter}` : ''}
                        </span>
                        <span className="pc-num">{item.questionCount}q</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {summary.failed > 0 && (
              <div className="pc-csv-issue-panel is-danger">
                <strong>{summary.failed} rows need fixes</strong>
                <p>Update your file and re-upload, or continue without them.</p>
              </div>
            )}
          </aside>
        </div>
      )}

      {step === 'summary' && validated && summary && (
        <div className="pc-csv-summary pc-scroll">
          <div className="pc-csv-summary-inner">
            <div className="pc-csv-step-head">
              <p className="pc-csv-kicker">Step 4 of 5 · Final review</p>
              <h2 className="pc-csv-summary-title pc-serif">
                You&apos;re about to import{' '}
                <span className="pc-num">{summary.importable}</span> questions
              </h2>
              <p className="pc-csv-step-lead">
                {summary.ready} ready · {summary.newCurriculum} new curriculum ·{' '}
                {summary.failed} skipped (failed)
              </p>
            </div>

            <div className="pc-csv-summary-strip">
              {[
                { label: 'Will publish', v: summary.importable, hint: 'to repository' },
                { label: 'Skipped', v: summary.failed, hint: 'failed validation' },
                {
                  label: 'New curriculum',
                  v: curriculumPlan.length,
                  hint: 'entries to create',
                },
              ].map((s, i) => (
                <div key={s.label} className="pc-csv-summary-strip-cell">
                  {i > 0 && <span className="pc-csv-summary-strip-div" />}
                  <span className="pc-csv-kicker">{s.label}</span>
                  <span className="pc-csv-summary-strip-val pc-serif pc-num">
                    {s.v}
                  </span>
                  <span className="pc-csv-summary-strip-hint">{s.hint}</span>
                </div>
              ))}
            </div>

            <div className="pc-csv-summary-grid">
              <div className="pc-panel pc-panel-pad">
                <p className="pc-csv-kicker">Curriculum breakdown</p>
                <ul className="pc-csv-summary-list">
                  {curriculumPlan.map((item) => (
                    <li key={item.key}>
                      Class {item.classNumber} · {item.subject}
                      {item.chapter ? ` · ${item.chapter}` : ''} —{' '}
                      <span className="pc-num">{item.questionCount}</span> questions
                    </li>
                  ))}
                  {curriculumPlan.length === 0 && (
                    <li>All chapters already exist in PaperCraft.</li>
                  )}
                </ul>
              </div>

              <div className="pc-csv-draft-panel is-published">
                <CheckCircle2 size={16} strokeWidth={1.6} />
                <div>
                  <p className="pc-csv-draft-panel-title pc-serif">
                    Auto-publish on import
                  </p>
                  <p>
                    Questions are published immediately and appear in the repository.
                    Use bulk upload filters to find this file later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ImportWizardLayout>
  )
}
