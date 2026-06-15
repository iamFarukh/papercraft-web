import { WifiOff } from 'lucide-react'
import { useConnectivityOptional } from '@/context/ConnectivityContext'
import { isBrowserOnline } from '@/lib/connectivity'

export function ConnectivityBanner() {
  const ctx = useConnectivityOptional()
  const isOnline = ctx?.isOnline ?? isBrowserOnline()

  if (isOnline) return null

  return (
    <p className="pc-connectivity-banner" role="status">
      <WifiOff size={14} strokeWidth={1.6} aria-hidden />
      You are offline. Your work stays on this device and will sync when connection returns.
    </p>
  )
}
