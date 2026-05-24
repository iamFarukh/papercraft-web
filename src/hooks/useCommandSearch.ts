import { useEffect, useRef, useState } from 'react'
import { searchCommandCenter } from '@/lib/command-center/search'
import type { CommandResult } from '@/types/command-center'

type UseCommandSearchOpts = {
  query: string
  isAdmin: boolean
  userId: string
  enabled: boolean
}

export function useCommandSearch({
  query,
  isAdmin,
  userId,
  enabled,
}: UseCommandSearchOpts) {
  const [results, setResults] = useState<CommandResult[]>([])
  const [loading, setLoading] = useState(false)
  const requestRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const requestId = ++requestRef.current
    setLoading(true)

    const timer = setTimeout(() => {
      void searchCommandCenter({ query, isAdmin, userId })
        .then((rows) => {
          if (requestRef.current !== requestId) return
          setResults(rows)
        })
        .catch(() => {
          if (requestRef.current !== requestId) return
          setResults([])
        })
        .finally(() => {
          if (requestRef.current !== requestId) return
          setLoading(false)
        })
    }, query.trim() ? 180 : 0)

    return () => clearTimeout(timer)
  }, [query, isAdmin, userId, enabled])

  return { results, loading }
}
