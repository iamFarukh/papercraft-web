import { useEffect, useRef, useState } from 'react'
import { isBrowserOnline, subscribeConnectivity } from '@/lib/connectivity'

export function useConnectivity() {
  const [isOnline, setIsOnline] = useState(() => isBrowserOnline())
  const wasOfflineRef = useRef(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    return subscribeConnectivity((online) => {
      setIsOnline(online)
      if (!online) {
        wasOfflineRef.current = true
        setJustReconnected(false)
      } else if (wasOfflineRef.current) {
        setJustReconnected(true)
        wasOfflineRef.current = false
      }
    })
  }, [])

  const clearReconnected = () => setJustReconnected(false)

  return { isOnline, justReconnected, clearReconnected }
}
