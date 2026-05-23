import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  deleteNotification,
  markNotificationRead,
  subscribeNotifications,
} from '@/services/firebase/notifications'
import type { NotificationRecord } from '@/types/notification'

type NotificationContextValue = {
  notifications: NotificationRecord[]
  unreadCount: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  clear: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeNotifications(
      user.uid,
      (rows) => {
        setNotifications(rows)
        setLoading(false)
      },
      () => setLoading(false),
    )
    return unsub
  }, [user?.uid])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id)
  }, [])

  const markAllRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.read)
    await Promise.all(unread.map((n) => markNotificationRead(n.id).catch(() => undefined)))
  }, [notifications])

  const clear = useCallback(async (id: string) => {
    await deleteNotification(id)
  }, [])

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      markRead,
      markAllRead,
      clear,
    }),
    [notifications, unreadCount, loading, markRead, markAllRead, clear],
  )

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  )
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
