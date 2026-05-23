import { navKeyFromPath } from '@/config/nav-routes'

/** Stable key for page transitions — one per major workspace area. */
export function pageMotionKey(pathname: string): string {
  if (pathname.startsWith('/app/repository')) return 'repo'
  if (pathname.startsWith('/app/builder')) return 'builder'
  if (pathname.startsWith('/app/curriculum')) return 'curriculum'
  if (pathname.startsWith('/app/approvals')) return 'approval'
  if (pathname.startsWith('/app/papers')) return 'papers'
  if (pathname.startsWith('/app/bookmarks')) return 'bookmarks'
  if (pathname.startsWith('/app/teachers')) return 'teachers'
  if (pathname === '/app' || pathname === '/app/') return 'home'
  return navKeyFromPath(pathname)
}
