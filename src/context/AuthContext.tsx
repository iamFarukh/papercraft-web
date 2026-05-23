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
import { subscribeUserProfile } from '@/services/firebase/user-profile'
import { ensureUserProfile, type UserRole } from '@/services/firebase/users'
import type { UserProfile } from '@/types/user-profile'
import type { TeacherAssignment } from '@/types/teacher'

type AuthContextValue = {
  user: User | null
  role: UserRole | null
  profile: UserProfile | null
  isAdmin: boolean
  profileReady: boolean
  assignments: TeacherAssignment[]
  loading: boolean
  login: (email: string, password: string, remember?: boolean) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileReady, setProfileReady] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser)
      setProfile(null)
      setProfileReady(false)

      if (!nextUser) {
        setRole(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const resolved = await ensureUserProfile(nextUser.uid, nextUser.email)
        if (!cancelled && resolved) setRole(resolved)
      } catch {
        if (!cancelled) setRole(null)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user?.uid) return

    const unsub = subscribeUserProfile(
      user.uid,
      (next) => {
        setProfile(next)
        if (next?.role) setRole(next.role)
        else if (next === null) setRole(null)
        setProfileReady(true)
        setLoading(false)
      },
      () => {
        setProfileReady(true)
        setLoading(false)
      },
    )
    return unsub
  }, [user?.uid])

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

  const assignments = useMemo(
    () => (profile?.role === 'teacher' ? profile.assignments : []),
    [profile],
  )

  const isAdmin = profileReady && role === 'admin'

  const value = useMemo(
    () => ({
      user,
      role,
      profile,
      isAdmin,
      profileReady,
      assignments,
      loading,
      login,
      logout,
    }),
    [user, role, profile, isAdmin, profileReady, assignments, loading, login, logout],
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
