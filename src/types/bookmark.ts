import type { Timestamp } from 'firebase/firestore'

export type BookmarkFolderDocument = {
  name: string
  questionCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type BookmarkItemDocument = {
  questionId: string
  addedAt: Timestamp
}

/** Quick lookup: which folders contain a question */
export type BookmarkIndexDocument = {
  folderIds: string[]
  updatedAt: Timestamp
}

export type BookmarkFolder = {
  id: string
  name: string
  questionCount: number
  createdAtMs: number
  updatedAtMs: number
}
