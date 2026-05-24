export const NAV_ROUTES: Record<string, string> = {
  home: '/app',
  feed: '/app/feed',
  repo: '/app/repository',
  bookmarks: '/app/bookmarks',
  curriculum: '/app/curriculum',
  blueprint: '/app/blueprints',
  papers: '/app/papers',
  builder: '/app/builder/new',
  approval: '/app/approvals',
  teachers: '/app/teachers',
  analytics: '/app/analytics',
  profile: '/app/profile',
  settings: '/app/settings',
}

export function isRepositoryAuthorPath(pathname: string): boolean {
  return (
    pathname === '/app/repository/new' ||
    pathname === '/app/repository/import' ||
    /\/app\/repository\/[^/]+\/edit$/.test(pathname)
  )
}

export function paperPrintPreviewPath(
  paperId: string,
  from?: 'builder' | 'library' | 'approval' | 'editor',
): string {
  return from
    ? `/app/papers/${paperId}/preview?from=${from}`
    : `/app/papers/${paperId}/preview`
}

export function navKeyFromPath(pathname: string): string {
  if (pathname.startsWith('/app/repository')) return 'repo'
  if (pathname.startsWith('/app/curriculum')) return 'curriculum'
  if (pathname.startsWith('/app/bookmarks')) return 'bookmarks'
  if (/^\/app\/papers\/[^/]+\/preview/.test(pathname)) return 'papers'
  if (pathname.startsWith('/app/papers')) return 'papers'
  if (pathname.startsWith('/app/builder')) return 'builder'
  if (pathname.startsWith('/app/approvals')) return 'approval'
  if (pathname.startsWith('/app/blueprints')) return 'blueprint'
  if (pathname.startsWith('/app/teachers')) return 'teachers'
  if (pathname.startsWith('/app/profile')) return 'profile'
  if (pathname.startsWith('/app/settings')) return 'settings'
  return 'home'
}

