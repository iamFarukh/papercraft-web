import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { auth } from '@/lib/firebase'
import { ensureUserProfile, type UserRole } from '@/services/firebase/users'

type AuthContextValue = {
  user: User | null
  role: UserRole | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)

      if (nextUser) {
        ensureUserProfile(nextUser.uid, nextUser.email)
          .then(setRole)
          .catch(() => setRole('teacher'))
      } else {
        setRole(null)
      }
    })
    return unsubscribe
  }, [])

  const login = useCallback(
    async (email: string, password: string, remember = true) => {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence,
      )
      await signInWithEmailAndPassword(auth, email.trim(), password)
    },
    [],
  )

  const logout = useCallback(async () => {
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role !== 'teacher',
      loading,
      login,
      logout,
    }),
    [user, role, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
