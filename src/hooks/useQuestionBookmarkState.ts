import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { subscribeBookmarkIndex } from '@/services/firebase/bookmarks'

export function useQuestionBookmarkState(questionId: string | null) {
  const { user } = useAuth()
  const [folderIds, setFolderIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid || !questionId) {
      setFolderIds([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsub = subscribeBookmarkIndex(user.uid, questionId, (ids) => {
      setFolderIds(ids)
      setLoading(false)
    })
    return unsub
  }, [user?.uid, questionId])

  return {
    folderIds,
    isBookmarked: folderIds.length > 0,
    loading,
  }
}
