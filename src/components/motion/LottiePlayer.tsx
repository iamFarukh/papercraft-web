import { lazy, Suspense, type CSSProperties, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ErrorBoundary } from '@/components/system/ErrorBoundary'

// Lazy so the dotLottie runtime (WASM + player) lands in its own chunk and
// never enters the initial bundle — it loads only when a Lottie actually renders.
const DotLottieReact = lazy(() =>
  import('@lottiefiles/dotlottie-react').then((m) => ({ default: m.DotLottieReact })),
)

type Props = {
  /** Asset URL (Vite import of a .lottie/.json) or hosted URL. Null → fallback. */
  src: string | null
  loop?: boolean
  autoplay?: boolean
  className?: string
  style?: CSSProperties
  ariaLabel?: string
  /**
   * Rendered for reduced-motion users, while the player chunk loads, if the
   * asset is missing, or if the player errors. Always pass the static UI the
   * Lottie is enhancing so the surface degrades gracefully.
   */
  fallback?: ReactNode
}

/**
 * Premium Lottie wrapper. Safe by construction: respects prefers-reduced-motion,
 * code-splits the runtime, and falls back to the provided static UI whenever the
 * animation can't (or shouldn't) play. See src/lib/motion/lottie-assets.ts for
 * the placement registry.
 */
export function LottiePlayer({
  src,
  loop = true,
  autoplay = true,
  className,
  style,
  ariaLabel,
  fallback = null,
}: Props) {
  const reduced = useReducedMotion()

  if (reduced || !src) return <>{fallback}</>

  return (
    <ErrorBoundary fallback={() => <>{fallback}</>}>
      <Suspense fallback={<>{fallback}</>}>
        <div className={className} style={style} role="img" aria-label={ariaLabel}>
          <DotLottieReact
            src={src}
            loop={loop}
            autoplay={autoplay}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </Suspense>
    </ErrorBoundary>
  )
}
