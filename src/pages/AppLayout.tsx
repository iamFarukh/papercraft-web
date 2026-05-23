import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { PageTransition } from '@/components/motion/PageTransition'
import { AppShell } from '@/components/shell/AppShell'
import { isRepositoryAuthorPath, navKeyFromPath } from '@/config/nav-routes'
import { useAuth } from '@/context/AuthContext'
import { pageMotionKey } from '@/lib/motion/page-key'

const CRUMBS: Record<string, string[]> = {
  home: ['Saraswati Vidya Niketan', 'Control Center'],
  repo: ['Academic', 'Question Repository', 'RBSE · Classes V–VIII'],
  repoNew: ['Academic', 'Question Repository', 'Compose'],
  repoEdit: ['Academic', 'Question Repository', 'Edit'],
  repoImport: ['Academic', 'Question Repository', 'Bulk import'],
  bookmarks: ['Academic', 'Bookmarks'],
  bookmarksFolder: ['Academic', 'Bookmarks', 'Folder'],
  builder: ['Academic', 'Paper Builder', 'Compose'],
  builderNew: ['Academic', 'Paper Builder', 'New paper'],
  papers: ['Academic', 'Paper Library', 'Recent papers'],
  approval: ['Papers', 'Approvals'],
  approvalReview: ['Papers', 'Approvals', 'Review'],
  curriculum: ['Academic', 'Curriculum', 'Taxonomy'],
  teachers: ['Organization', 'Teachers'],
}

export function AppLayout() {
  const { pathname } = useLocation()
  const { isAdmin } = useAuth()
  const activeNav = navKeyFromPath(pathname)
  const isAuthor = isRepositoryAuthorPath(pathname)

  let crumbKey = activeNav
  if (pathname === '/app/repository/import') crumbKey = 'repoImport'
  else if (pathname.endsWith('/new')) crumbKey = 'repoNew'
  else if (pathname.includes('/edit')) crumbKey = 'repoEdit'
  else if (pathname.match(/\/app\/bookmarks\/[^/]+/)) crumbKey = 'bookmarksFolder'
  else if (pathname.startsWith('/app/bookmarks')) crumbKey = 'bookmarks'
  else if (pathname.startsWith('/app/papers')) crumbKey = 'papers'
  else if (pathname === '/app/builder/new') crumbKey = 'builderNew'
  else if (pathname.startsWith('/app/builder')) crumbKey = 'builder'
  else if (pathname.match(/\/app\/approvals\/[^/]+/)) crumbKey = 'approvalReview'
  else if (pathname.startsWith('/app/teachers')) crumbKey = 'teachers'
  else if (pathname.startsWith('/app/approvals')) crumbKey = 'approval'

  const crumbs = CRUMBS[crumbKey] ?? CRUMBS.home
  const motionKey = pageMotionKey(pathname)

  const isImport = pathname === '/app/repository/import'

  const topbarActions = isImport ? (
    <Link to="/app/repository" className="pc-btn is-sm is-ghost">
      <ArrowLeft size={14} strokeWidth={1.6} />
      Cancel import
    </Link>
  ) : activeNav === 'repo' && !isAuthor && isAdmin ? (
    <Link to="/app/repository/new" className="pc-btn is-primary">
      <Plus size={14} strokeWidth={1.6} />
      New Question
    </Link>
  ) : undefined

  return (
    <AppShell activeNav={activeNav} crumbs={crumbs} topbarActions={topbarActions}>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={motionKey} motionKey={motionKey}>
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </AppShell>
  )
}
