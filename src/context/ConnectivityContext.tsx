import { createContext, useContext, type ReactNode } from 'react'
import { useConnectivity } from '@/hooks/useConnectivity'

type ConnectivityContextValue = ReturnType<typeof useConnectivity>

const ConnectivityContext = createContext<ConnectivityContextValue | null>(null)

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const value = useConnectivity()
  return (
    <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
  )
}

export function useConnectivityState(): ConnectivityContextValue {
  const ctx = useContext(ConnectivityContext)
  if (!ctx) {
    throw new Error('useConnectivityState must be used within ConnectivityProvider')
  }
  return ctx
}

/** Safe when provider is absent (e.g. login route). */
export function useConnectivityOptional(): ConnectivityContextValue | null {
  return useContext(ConnectivityContext)
}
