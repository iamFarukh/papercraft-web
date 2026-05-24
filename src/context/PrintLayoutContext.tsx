import { createContext, useContext, type ReactNode } from 'react'
import type { PrintBlock, PrintPageModel } from '@/lib/paper-print-layout'

export type PrintLayoutContextValue = {
  pages: PrintPageModel[]
  blocks: PrintBlock[]
  pageCount: number
  layoutSource: 'measured' | 'estimated'
  isLayoutReady: boolean
}

const PrintLayoutContext = createContext<PrintLayoutContextValue | null>(null)

export function PrintLayoutProvider({
  value,
  children,
}: {
  value: PrintLayoutContextValue
  children: ReactNode
}) {
  return <PrintLayoutContext.Provider value={value}>{children}</PrintLayoutContext.Provider>
}

export function usePrintLayout(): PrintLayoutContextValue {
  const ctx = useContext(PrintLayoutContext)
  if (!ctx) {
    throw new Error('usePrintLayout must be used within PrintLayoutProvider')
  }
  return ctx
}

export function usePrintLayoutOptional(): PrintLayoutContextValue | null {
  return useContext(PrintLayoutContext)
}
