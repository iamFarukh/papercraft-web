/** Matches login layout breakpoint in auth.css */
export const MOBILE_MAX_WIDTH_PX = 900

export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_MAX_WIDTH_PX}px)`

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches
}
