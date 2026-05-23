import { Plus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { EmptyStatePanel } from '@/components/ui/EmptyStatePanel'
import { TeacherCard } from '@/components/teachers/TeacherCard'
import { TeacherFormDialog } from '@/components/teachers/TeacherFormDialog'
import { listTeachers } from '@/services/firebase/teachers'
import type { TeacherListItem } from '@/types/teacher'

export function TeacherWorkspace() {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TeacherListItem | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    listTeachers()
      .then(setTeachers)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Could not load teachers.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const activeCount = teachers.filter((t) => t.active).length

  return (
    <main className="pc-teachers-page pc-scroll">
      <header className="pc-teachers-head">
        <div>
          <p className="pc-teachers-kicker">Organization</p>
          <h1 className="pc-teachers-title pc-serif">Teachers</h1>
          <p className="pc-teachers-lead">
            Assign classes and subjects. Teachers see only their scope in the
            repository and paper builder.
          </p>
        </div>
        <button
          type="button"
          className="pc-btn is-primary"
          onClick={() => {
            setEditing(null)
            setDialogOpen(true)
          }}
        >
          <Plus size={14} strokeWidth={1.6} />
          Add teacher
        </button>
      </header>

      {!loading && !error ? (
        <p className="pc-teachers-summary pc-num">
          {teachers.length} teacher{teachers.length === 1 ? '' : 's'} · {activeCount} active
        </p>
      ) : null}

      {loading ? (
        <div className="pc-teachers-grid" aria-busy>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="pc-teacher-card pc-skeleton-card" />
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="pc-teachers-error">{error}</p>
      ) : null}

      {!loading && !error && teachers.length === 0 ? (
        <EmptyStatePanel
          icon={Users}
          title="No teachers yet"
          description="Add teachers with class and subject assignments. They can sign in with their school email when ready."
        />
      ) : null}

      {!loading && !error && teachers.length > 0 ? (
        <div className="pc-teachers-grid">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onEdit={() => {
                setEditing(teacher)
                setDialogOpen(true)
              }}
            />
          ))}
        </div>
      ) : null}

      <TeacherFormDialog
        open={dialogOpen}
        teacher={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={load}
      />
    </main>
  )
}
