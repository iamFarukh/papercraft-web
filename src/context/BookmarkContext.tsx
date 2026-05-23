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
  addQuestionToBookmarkFolder,
  createBookmarkFolder,
  deleteBookmarkFolder,
  removeQuestionFromBookmarkFolder,
  renameBookmarkFolder,
  subscribeBookmarkFolders,
} from '@/services/firebase/bookmarks'
import type { BookmarkFolder } from '@/types/bookmark'

type BookmarkContextValue = {
  folders: BookmarkFolder[]
  loading: boolean
  error: string | null
  createFolder: (name: string) => Promise<string>
  renameFolder: (folderId: string, name: string) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  addToFolder: (folderId: string, questionId: string) => Promise<void>
  removeFromFolder: (folderId: string, questionId: string) => Promise<void>
  toggleInFolder: (folderId: string, questionId: string, inFolder: boolean) => Promise<void>
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.uid) {
      setFolders([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeBookmarkFolders(
      user.uid,
      (next) => {
        setFolders(next)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
    return unsub
  }, [user?.uid])

  const requireUid = useCallback(() => {
    if (!user?.uid) throw new Error('Sign in to use bookmarks')
    return user.uid
  }, [user?.uid])

  const createFolder = useCallback(
    async (name: string) => {
      const uid = requireUid()
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Folder name is required')

      const now = Date.now()
      const tempId = `opt-${now}`
      const optimistic: BookmarkFolder = {
        id: tempId,
        name: trimmed,
        questionCount: 0,
        createdAtMs: now,
        updatedAtMs: now,
      }

      setFolders((prev) => [optimistic, ...prev])

      try {
        const id = await createBookmarkFolder(uid, trimmed)
        setFolders((prev) => {
          const withoutTemp = prev.filter((f) => f.id !== tempId)
          if (withoutTemp.some((f) => f.id === id)) return withoutTemp
          return [
            {
              id,
              name: trimmed,
              questionCount: 0,
              createdAtMs: now,
              updatedAtMs: now,
            },
            ...withoutTemp,
          ]
        })
        return id
      } catch (err) {
        setFolders((prev) => prev.filter((f) => f.id !== tempId))
        throw err
      }
    },
    [requireUid],
  )

  const renameFolder = useCallback(
    async (folderId: string, name: string) => {
      await renameBookmarkFolder(requireUid(), folderId, name)
    },
    [requireUid],
  )

  const deleteFolder = useCallback(
    async (folderId: string) => {
      await deleteBookmarkFolder(requireUid(), folderId)
    },
    [requireUid],
  )

  const addToFolder = useCallback(
    async (folderId: string, questionId: string) => {
      await addQuestionToBookmarkFolder(requireUid(), folderId, questionId)
    },
    [requireUid],
  )

  const removeFromFolder = useCallback(
    async (folderId: string, questionId: string) => {
      await removeQuestionFromBookmarkFolder(requireUid(), folderId, questionId)
    },
    [requireUid],
  )

  const toggleInFolder = useCallback(
    async (folderId: string, questionId: string, inFolder: boolean) => {
      if (inFolder) await removeFromFolder(folderId, questionId)
      else await addToFolder(folderId, questionId)
    },
    [addToFolder, removeFromFolder],
  )

  const value = useMemo(
    () => ({
      folders,
      loading,
      error,
      createFolder,
      renameFolder,
      deleteFolder,
      addToFolder,
      removeFromFolder,
      toggleInFolder,
    }),
    [
      folders,
      loading,
      error,
      createFolder,
      renameFolder,
      deleteFolder,
      addToFolder,
      removeFromFolder,
      toggleInFolder,
    ],
  )

  return (
    <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider')
  return ctx
}
