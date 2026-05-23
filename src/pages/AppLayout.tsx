import { ArrowLeft, Plus } from 'lucide-react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { isRepositoryAuthorPath, navKeyFromPath } from '@/config/nav-routes'
import { useAuth } from '@/context/AuthContext'

const CRUMBS: Record<string, string[]> = {
  home: ['Saraswati Vidya Niketan', 'Control Center'],
  repo: ['Academic', 'Question Repository', 'RBSE · Classes V–VIII'],
  repoNew: ['Academic', 'Question Repository', 'Compose'],
  repoEdit: ['Academic', 'Question Repository', 'Edit'],
  repoImport: ['Academic', 'Question Repository', 'Bulk import'],
  bookmarks: ['Academic', 'Bookmarks'],
  bookmarksFolder: ['Academic', 'Bookmarks', 'Folder'],
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

  const crumbs = CRUMBS[crumbKey] ?? CRUMBS.home

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
      <Outlet />
    </AppShell>
  )
}
