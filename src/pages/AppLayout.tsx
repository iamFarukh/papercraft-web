import { Suspense } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { PageTransition } from '@/components/motion/PageTransition'
import { ErrorBoundary } from '@/components/system/ErrorBoundary'
import { RouteFallback } from '@/components/system/RouteFallback'
import { isRepositoryAuthorPath, navKeyFromPath } from '@/config/nav-routes'
import { pageMotionKey } from '@/lib/motion/page-key'
import { useAuth } from '@/context/AuthContext'

const CRUMBS: Record<string, string[]> = {
  home: ['Saraswati Vidya Niketan', 'Control Center'],
  repo: ['Academic', 'Question Repository', 'RBSE · Classes V–VIII'],
  repoNew: ['Academic', 'Question Repository', 'Compose'],
  repoEdit: ['Academic', 'Question Repository', 'Edit'],
  repoImport: ['Academic', 'Question Repository', 'Bulk import'],
  bookmarks: ['Academic', 'Bookmarks'],
  bookmarksFolder: ['Academic', 'Bookmarks', 'Folder'],
  builder: ['Academic', 'Paper Builder', 'Compose'],
  builderEditor: ['Academic', 'Paper Builder', 'Examination editor'],
  builderNew: ['Academic', 'Paper Builder', 'New paper'],
  papers: ['Academic', 'Paper Library', 'Recent papers'],
  approval: ['Papers', 'Approvals'],
  approvalReview: ['Papers', 'Approvals', 'Review'],
  curriculum: ['Academic', 'Curriculum', 'Taxonomy'],
  blueprint: ['Academic', 'Blueprints'],
  blueprintNew: ['Academic', 'Blueprints', 'New blueprint'],
  blueprintDetail: ['Academic', 'Blueprints', 'Detail'],
  blueprintEdit: ['Academic', 'Blueprints', 'Edit'],
  teachers: ['Organization', 'Teachers'],
  profile: ['Account', 'My profile'],
  settings: ['Organization', 'Workspace settings'],
}

export function AppLayout() {
  const { pathname } = useLocation()
  const { isAdmin } = useAuth()
  const activeNav = navKeyFromPath(pathname)
  const isAuthor = isRepositoryAuthorPath(pathname)

  let crumbKey = activeNav
  if (pathname === '/app/repository/import') crumbKey = 'repoImport'
  else if (pathname.endsWith('/new')) crumbKey = 'repoNew'
  else if (pathname.match(/\/app\/builder\/[^/]+\/editor$/)) crumbKey = 'builderEditor'
  else if (pathname.includes('/edit')) crumbKey = 'repoEdit'
  else if (pathname.match(/\/app\/bookmarks\/[^/]+/)) crumbKey = 'bookmarksFolder'
  else if (pathname.startsWith('/app/bookmarks')) crumbKey = 'bookmarks'
  else if (pathname.startsWith('/app/papers')) crumbKey = 'papers'
  else if (pathname === '/app/builder/new') crumbKey = 'builderNew'
  else if (pathname.startsWith('/app/builder')) crumbKey = 'builder'
  else if (pathname.match(/\/app\/approvals\/[^/]+/)) crumbKey = 'approvalReview'
  else if (pathname.startsWith('/app/curriculum')) crumbKey = 'curriculum'
  else if (pathname === '/app/blueprints/new') crumbKey = 'blueprintNew'
  else if (pathname.match(/\/app\/blueprints\/[^/]+\/edit$/)) crumbKey = 'blueprintEdit'
  else if (pathname.match(/\/app\/blueprints\/[^/]+$/)) crumbKey = 'blueprintDetail'
  else if (pathname.startsWith('/app/blueprints')) crumbKey = 'blueprint'
  else if (pathname.startsWith('/app/profile')) crumbKey = 'profile'
  else if (pathname.startsWith('/app/settings')) crumbKey = 'settings'
  else if (pathname.startsWith('/app/teachers')) crumbKey = 'teachers'
  else if (pathname.startsWith('/app/approvals')) crumbKey = 'approval'

  const crumbs = CRUMBS[crumbKey] ?? CRUMBS.home

  const isImport = pathname === '/app/repository/import'

  const topbarActions = isImport ? (
    <Link to="/app/repository" className="pc-btn is-sm is-ghost">
      <ArrowLeft size={14} strokeWidth={1.6} />
      Cancel import
    </Link>
  ) : activeNav === 'blueprint' && isAdmin && pathname === '/app/blueprints' ? (
    <Link to="/app/blueprints/new" className="pc-btn is-primary">
      <Plus size={14} strokeWidth={1.6} />
      New blueprint
    </Link>
  ) : activeNav === 'repo' && !isAuthor && isAdmin ? (
    <Link to="/app/repository/new" className="pc-btn is-primary">
      <Plus size={14} strokeWidth={1.6} />
      New Question
    </Link>
  ) : undefined

  const motionKey = pageMotionKey(pathname)

  return (
    <AppShell activeNav={activeNav} crumbs={crumbs} topbarActions={topbarActions}>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={motionKey} motionKey={motionKey}>
          <ErrorBoundary key={pathname} scopeLabel="this page">
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      </AnimatePresence>
    </AppShell>
  )
}
