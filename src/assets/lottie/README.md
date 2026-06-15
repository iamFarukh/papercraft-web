# Lottie assets

Drop premium `.lottie` (dotLottie) animation files here, then wire them in
[`src/lib/motion/lottie-assets.ts`](../../lib/motion/lottie-assets.ts).

## How it works

- [`LottiePlayer`](../../components/motion/LottiePlayer.tsx) renders an animation
  **only** when an asset `src` is set and the user hasn't requested reduced motion.
- Until you supply a file, the registry entry's `src` is `null` and every surface
  falls back to its existing static UI. Nothing breaks; nothing ships in the
  bundle.
- The dotLottie runtime is code-split — it loads lazily the first time a Lottie
  actually renders, never on initial app load.

## Activating an animation

1. Add the file here, e.g. `empty-repository.lottie`.
2. In `lottie-assets.ts`:
   ```ts
   import emptyRepository from '@/assets/lottie/empty-repository.lottie'
   // ...
   emptyRepository: { src: emptyRepository, loop: true, label: '…', note: '…' },
   ```
3. Render it with the static fallback always supplied:
   ```tsx
   import { LottiePlayer } from '@/components/motion/LottiePlayer'
   import { lottiePlacement } from '@/lib/motion/lottie-assets'

   const a = lottiePlacement('emptyRepository')
   <LottiePlayer
     src={a.src}
     loop={a.loop}
     ariaLabel={a.label}
     className="pc-lottie-empty"
     fallback={<ExistingStaticIllustration />}
   />
   ```

## Asset guidelines

- Keep each file ≤ ~50 KB. Prefer `.lottie` over raw `.json`.
- Match the brand: cobalt-forward, calm, no bouncy easing (see DESIGN.md §13).
- Loop only ambient/empty/loading states; play success/error states **once**.

## Planned placements

See the `LottieKey` union in `lottie-assets.ts` for the full roadmap (app boot,
auth, empty/error/offline data states, and success moments like paper approved,
bookmarked, import/export complete).
