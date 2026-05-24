import { Plus, Search, Target } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BlueprintCard } from '@/components/blueprints/BlueprintCard'
import { FadeIn } from '@/components/motion/FadeIn'
import { MotionList } from '@/components/motion/MotionList'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'
import { useAuth } from '@/context/AuthContext'
import {
  listBlueprints,
  parseBlueprintError,
  seedDefaultBlueprints,
} from '@/services/firebase/blueprints'
import type { BlueprintListItem } from '@/types/blueprint'

export function BlueprintWorkspace() {
  const { user, isAdmin } = useAuth()
  const [blueprints, setBlueprints] = useState<BlueprintListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [examFilter, setExamFilter] = useState<string>('all')
  const [classFilter, setClassFilter] = useState<string>('all')
  const [kindFilter, setKindFilter] = useState<'all' | 'system' | 'custom'>('all')
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      if (!hasLoadedRef.current) setLoading(true)
      setError(null)
      try {
        if (isAdmin) {
          await seedDefaultBlueprints()
        }
        const rows = await listBlueprints()
        if (!cancelled) {
          setBlueprints(rows)
          hasLoadedRef.current = true
        }
      } catch (err) {
        if (!cancelled) {
          setError(parseBlueprintError(err))
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

  const defaults = blueprints.filter((b) => b.isSystem)
  const custom = blueprints.filter((b) => !b.isSystem)

  const filterList = (items: BlueprintListItem[]) => {
    const q = query.trim().toLowerCase()
    return items.filter((b) => {
      if (kindFilter === 'system' && !b.isSystem) return false
      if (kindFilter === 'custom' && b.isSystem) return false
      if (examFilter !== 'all' && b.examType !== examFilter) return false
      if (classFilter !== 'all' && !b.recommendedClasses.some((c) => c.includes(classFilter)))
        return false
      if (!q) return true
      return (
        b.name.toLowerCase().includes(q) ||
        b.examType.toLowerCase().includes(q) ||
        b.recommendedSubjects.some((s) => s.toLowerCase().includes(q))
      )
    })
  }

  const filteredDefaults = useMemo(() => filterList(defaults), [defaults, query, examFilter, classFilter, kindFilter])
  const filteredCustom = useMemo(() => filterList(custom), [custom, query, examFilter, classFilter, kindFilter])

  const examTypes = useMemo(
    () => [...new Set(blueprints.map((b) => b.examType))].sort(),
    [blueprints],
  )
  const classOptions = useMemo(
    () => [...new Set(blueprints.flatMap((b) => b.recommendedClasses))].sort(),
    [blueprints],
  )

  const hasAny = !loading && !error && blueprints.length > 0

  return (
    <div className="pc-bp-workspace pc-dots">
      <div className="pc-bp-workspace-inner">
        <header className="pc-bp-head">
          <div>
            <p className="pc-bp-kicker">Blueprints</p>
            <h1 className="pc-bp-title pc-serif">Academic skeletons for every paper</h1>
            <p className="pc-bp-lead">
              Blueprints control structure, marks, syllabus weight and difficulty — not
              visual identity. Start from a default or define your own examination policy.
            </p>
          </div>
          {isAdmin ? (
            <Link to="/app/blueprints/new" className="pc-btn is-primary">
              <Plus size={14} strokeWidth={1.6} />
              New blueprint
            </Link>
          ) : (
            <span className="pc-bp-readonly-badge">Read-only</span>
          )}
        </header>

        {hasAny ? (
          <FadeIn className="pc-bp-stats pc-panel pc-panel-pad">
            <div className="pc-bp-stat">
              <span className="pc-bp-stat-k">Default blueprints</span>
              <span className="pc-bp-stat-v pc-serif pc-num">{defaults.length}</span>
              <span className="pc-bp-stat-h">Maintained by PaperCraft</span>
            </div>
            <div className="pc-bp-stat">
              <span className="pc-bp-stat-k">School blueprints</span>
              <span className="pc-bp-stat-v pc-serif pc-num">{custom.length}</span>
              <span className="pc-bp-stat-h">Created by your school</span>
            </div>
            <div className="pc-bp-stat">
              <span className="pc-bp-stat-k">Total sections</span>
              <span className="pc-bp-stat-v pc-serif pc-num">
                {blueprints.reduce((n, b) => n + b.sectionCount, 0)}
              </span>
              <span className="pc-bp-stat-h">Across all blueprints</span>
            </div>
          </FadeIn>
        ) : null}

        {hasAny ? (
          <div className="pc-bp-filters pc-panel pc-panel-pad">
            <div className="pc-bp-filters-search">
              <Search size={14} strokeWidth={1.6} />
              <input
                type="search"
                className="pc-bp-input"
                placeholder="Search blueprints…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="pc-bp-select pc-bp-filter-select"
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
            >
              <option value="all">All exam types</option>
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="pc-bp-select pc-bp-filter-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">All classes</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              className="pc-bp-select pc-bp-filter-select"
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as typeof kindFilter)}
            >
              <option value="all">Default & school</option>
              <option value="system">System only</option>
              <option value="custom">School only</option>
            </select>
          </div>
        ) : null}

        {loading ? (
          <p className="pc-bp-muted">Loading blueprints…</p>
        ) : error ? (
          <EmptyStatePanel
            icon={Target}
            title="Could not load blueprints"
            description={error}
            variant="error"
          />
        ) : blueprints.length === 0 ? (
          <EmptyStatePanel
            icon={Target}
            title="No blueprints yet"
            description={
              isAdmin
                ? 'Default examination structures will appear here after seeding.'
                : 'Your administrator has not published any custom blueprints yet.'
            }
            actions={
              isAdmin
                ? [
                    {
                      kind: 'link',
                      label: 'Create blueprint',
                      to: '/app/blueprints/new',
                      primary: true,
                    },
                  ]
                : undefined
            }
          />
        ) : (
          <FadeIn>
            <BlueprintSection
              title="Default blueprints"
              hint="System-provided academic structures"
              tag="PaperCraft"
              count={filteredDefaults.length}
              items={filteredDefaults}
              variant="default"
            />
            {filteredCustom.length > 0 ? (
              <BlueprintSection
                title="School blueprints"
                hint="Custom examination policies for your school"
                tag="School-specific"
                count={filteredCustom.length}
                items={filteredCustom}
                variant="custom"
              />
            ) : isAdmin && custom.length === 0 ? (
              <div className="pc-bp-empty-custom pc-panel pc-panel-pad">
                <p className="pc-bp-empty-custom-title pc-serif">No school blueprints yet</p>
                <p className="pc-bp-empty-custom-lead">
                  Duplicate a default blueprint or create one from scratch to match your
                  internal assessment policy.
                </p>
                <Link to="/app/blueprints/new" className="pc-btn is-sm is-primary">
                  Create school blueprint
                </Link>
              </div>
            ) : null}
          </FadeIn>
        )}
      </div>
    </div>
  )
}

function BlueprintSection({
  title,
  hint,
  tag,
  count,
  items,
  variant,
}: {
  title: string
  hint: string
  tag: string
  count: number
  items: BlueprintListItem[]
  variant: 'default' | 'custom'
}) {
  if (items.length === 0) return null

  return (
    <section className="pc-bp-section">
      <div className="pc-bp-section-head">
        <div>
          <h2 className="pc-bp-section-title pc-serif">{title}</h2>
          <p className="pc-bp-section-hint">{hint}</p>
        </div>
        <span className="pc-tag is-outline">{tag}</span>
        <span className="pc-bp-section-rule" aria-hidden />
        <span className="pc-bp-section-count">{count} blueprint{count === 1 ? '' : 's'}</span>
      </div>
      <MotionList className="pc-bp-grid">
        {items.map((bp) => (
          <BlueprintCard key={bp.id} blueprint={bp} variant={variant} />
        ))}
      </MotionList>
    </section>
  )
}
