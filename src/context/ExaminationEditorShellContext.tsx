import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ShellContextValue = {
  shellNavOpen: boolean
  toggleShellNav: () => void
  leftPanelOpen: boolean
  toggleLeftPanel: () => void
}

const ExaminationEditorShellContext = createContext<ShellContextValue | null>(null)

export function ExaminationEditorShellProvider({ children }: { children: ReactNode }) {
  const [shellNavOpen, setShellNavOpen] = useState(false)
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('pc-ee-route')
    return () => {
      root.classList.remove('pc-ee-route', 'pc-ee-shell-nav-open', 'pc-ee-left-closed')
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (shellNavOpen) root.classList.add('pc-ee-shell-nav-open')
    else root.classList.remove('pc-ee-shell-nav-open')
  }, [shellNavOpen])

  useEffect(() => {
    const root = document.documentElement
    if (leftPanelOpen) root.classList.remove('pc-ee-left-closed')
    else root.classList.add('pc-ee-left-closed')
  }, [leftPanelOpen])

  const toggleShellNav = useCallback(() => setShellNavOpen((v) => !v), [])
  const toggleLeftPanel = useCallback(() => setLeftPanelOpen((v) => !v), [])

  const value = useMemo(
    () => ({
      shellNavOpen,
      toggleShellNav,
      leftPanelOpen,
      toggleLeftPanel,
    }),
    [shellNavOpen, toggleShellNav, leftPanelOpen, toggleLeftPanel],
  )

  return (
    <ExaminationEditorShellContext.Provider value={value}>
      {children}
    </ExaminationEditorShellContext.Provider>
  )
}

export function useExaminationEditorShell() {
  const ctx = useContext(ExaminationEditorShellContext)
  if (!ctx) {
    throw new Error('useExaminationEditorShell must be used within ExaminationEditorShellProvider')
  }
  return ctx
}
