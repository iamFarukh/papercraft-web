import { useEffect, useState } from 'react'
import {
  claimTabLock,
  readTabConflict,
  releaseTabLock,
  type TabLockKind,
} from '@/lib/editor-tab-lock'

type Options = {
  kind: TabLockKind
  resourceId: string | null
  enabled?: boolean
}

export function useEditorTabLock({ kind, resourceId, enabled = true }: Options) {
  const [conflict, setConflict] = useState(false)

  useEffect(() => {
    if (!enabled || !resourceId) {
      setConflict(false)
      return
    }

    claimTabLock(kind, resourceId)
    setConflict(readTabConflict(kind, resourceId))

    const interval = window.setInterval(() => {
      claimTabLock(kind, resourceId)
      setConflict(readTabConflict(kind, resourceId))
    }, 4000)

    const onStorage = (e: StorageEvent) => {
      if (!e.key?.includes(resourceId)) return
      setConflict(readTabConflict(kind, resourceId))
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('storage', onStorage)
      releaseTabLock(kind, resourceId)
    }
  }, [kind, resourceId, enabled])

  return { conflict }
}
