import { useCallback, useEffect, useState } from 'react'
import {
  createChapter,
  createClass,
  createSubject,
  createTopic,
  ensureCurriculumSeeded,
  listChapters,
  listClasses,
  listSubjectsForClass,
  listTopics,
  type CreateTaxonomyResult,
} from '@/services/firebase/curriculum'
import type { RbseStreamId } from '@/lib/rbse-catalog'
import { isSeniorClass } from '@/lib/rbse-catalog'
import type { TaxonomyOption } from '@/types/curriculum'

type UseCurriculumTaxonomyArgs = {
  classNumber: number
  subjectId: string
  chapterId: string
  stream: RbseStreamId | null
}

export function useCurriculumTaxonomy({
  classNumber,
  subjectId,
  chapterId,
  stream,
}: UseCurriculumTaxonomyArgs) {
  const [classes, setClasses] = useState<TaxonomyOption[]>([])
  const [subjects, setSubjects] = useState<TaxonomyOption[]>([])
  const [chapters, setChapters] = useState<TaxonomyOption[]>([])
  const [topics, setTopics] = useState<TaxonomyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const needsStream = isSeniorClass(classNumber)
  const streamReady = !needsStream || stream !== null

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await ensureCurriculumSeeded()
      const cls = await listClasses()
      setClasses(cls)

      if (classNumber && streamReady) {
        setSubjects(await listSubjectsForClass(classNumber, stream))
      } else {
        setSubjects([])
      }

      if (classNumber && subjectId) {
        setChapters(await listChapters(classNumber, subjectId))
      } else {
        setChapters([])
      }

      if (chapterId) {
        setTopics(await listTopics(chapterId))
      } else {
        setTopics([])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not load curriculum.',
      )
    } finally {
      setLoading(false)
    }
  }, [classNumber, subjectId, chapterId, stream, streamReady])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    classes,
    subjects,
    chapters,
    topics,
    loading,
    error,
    needsStream,
    reload,
    createClass: (name: string) => createClass(name),
    createSubject: (name: string): Promise<CreateTaxonomyResult> =>
      createSubject(name, classNumber, stream),
    createChapter: (name: string): Promise<CreateTaxonomyResult> =>
      createChapter(name, classNumber, subjectId),
    createTopic: (name: string): Promise<CreateTaxonomyResult> =>
      createTopic(name, classNumber, subjectId, chapterId),
  }
}
