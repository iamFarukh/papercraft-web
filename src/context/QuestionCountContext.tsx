import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  fetchQuestionCount,
  subscribeQuestionCountRefresh,
} from '@/services/firebase/question-count'

type QuestionCountContextValue = {
  count: number | null
  loading: boolean
  formattedCount: string
  refetch: () => void
}

const QuestionCountContext = createContext<QuestionCountContextValue | null>(null)

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export function QuestionCountProvider({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const hasCountRef = useRef(false)

  const refetch = useCallback(async () => {
    if (!user) {
      setCount(null)
      setLoading(false)
      hasCountRef.current = false
      return
    }
    try {
      const n = await fetchQuestionCount(isAdmin)
      setCount(n)
      hasCountRef.current = true
    } catch {
      if (!hasCountRef.current) setCount(null)
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setCount(null)
      setLoading(false)
      hasCountRef.current = false
      return
    }

    if (!hasCountRef.current) setLoading(true)
    void refetch()

    const unsub = subscribeQuestionCountRefresh(isAdmin, () => {
      void refetch()
    })
    return unsub
  }, [authLoading, user, isAdmin, refetch])

  const value = useMemo(
    () => ({
      count,
      loading,
      formattedCount: count === null ? '—' : formatCount(count),
      refetch,
    }),
    [count, loading, refetch],
  )

  return (
    <QuestionCountContext.Provider value={value}>
      {children}
    </QuestionCountContext.Provider>
  )
}

export function useQuestionCount() {
  const ctx = useContext(QuestionCountContext)
  if (!ctx) {
    throw new Error('useQuestionCount must be used within QuestionCountProvider')
  }
  return ctx
}
