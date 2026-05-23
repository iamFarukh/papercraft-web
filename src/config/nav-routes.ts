export const NAV_ROUTES: Record<string, string> = {
  home: '/app',
  feed: '/app/feed',
  repo: '/app/repository',
  bookmarks: '/app/bookmarks',
  curriculum: '/app/curriculum',
  blueprint: '/app/blueprint',
  papers: '/app/papers',
  builder: '/app/builder',
  approval: '/app/approval',
  teachers: '/app/teachers',
  analytics: '/app/analytics',
}

export function isRepositoryAuthorPath(pathname: string): boolean {
  return (
    pathname === '/app/repository/new' ||
    pathname === '/app/repository/import' ||
    /\/app\/repository\/[^/]+\/edit$/.test(pathname)
  )
}

export function navKeyFromPath(pathname: string): string {
  if (pathname.startsWith('/app/repository')) return 'repo'
  if (pathname.startsWith('/app/bookmarks')) return 'bookmarks'
  return 'home'
}

