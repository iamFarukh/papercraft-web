import { defaultMediumForSubject, normalizePaperMedium } from '@/lib/paper-medium'
import { mapQuestionDoc } from '@/lib/question-mapper'
import {
  emptyComposition,
  type PaperComposition,
  type PaperSectionDef,
  type PaperSectionId,
  type PaperSetupState,
} from '@/lib/paper-builder'
import { createMissingQuestionPlaceholder } from '@/lib/missing-question'
import { getQuestionsByIds } from '@/services/firebase/questions'
import { normalizeInstanceLayer } from '@/lib/paper-instance'
import type { PaperInstanceLayer } from '@/types/paper-instance'
import type { PaperDocument, PaperSectionSnapshot, SavePaperInput } from '@/types/paper'

export function setupToSaveInput(
  setup: PaperSetupState,
  sections: PaperSectionSnapshot[],
  instanceLayer?: PaperInstanceLayer,
): SavePaperInput {
  return {
    title: setup.examinationName.trim(),
    session: setup.academicSession.trim(),
    classLabel: setup.classLabel,
    subject: setup.subject,
    medium: setup.medium,
    examType: setup.examType,
    duration: setup.durationLabel.trim(),
    totalMarks: setup.totalMarks,
    instructions: setup.generalInstructions,
    structureNotes: setup.structureNotes,
    sectionCount: setup.sectionCount,
    sections,
    instanceLayer: normalizeInstanceLayer(instanceLayer),
    blueprintId: setup.blueprintId ?? null,
    blueprintVersion: setup.blueprintVersion ?? null,
    blueprintSnapshot: setup.blueprintSnapshot ?? null,
  }
}

export function paperToInstanceLayer(paper: PaperDocument): PaperInstanceLayer {
  return normalizeInstanceLayer(paper.instanceLayer)
}

export function compositionToPaperSections(
  composition: PaperComposition,
  sectionDefs: PaperSectionDef[],
): PaperSectionSnapshot[] {
  return sectionDefs.map((def) => ({
    id: def.id,
    title: def.name,
    questionIds: composition[def.id].map((q) => q.id),
  }))
}

export function paperToSetup(paper: PaperDocument): PaperSetupState {
  return {
    examinationName: paper.title,
    academicSession: paper.session,
    classLabel: paper.classLabel,
    subject: paper.subject,
    medium: normalizePaperMedium(paper.medium ?? defaultMediumForSubject(paper.subject)),
    examType: paper.examType,
    totalMarks: paper.totalMarks,
    durationLabel: paper.duration,
    sectionCount: paper.sectionCount,
    structureNotes: paper.structureNotes ?? '',
    generalInstructions: paper.instructions,
    blueprintId: paper.blueprintId ?? null,
    blueprintVersion: paper.blueprintVersion ?? null,
    blueprintSnapshot: paper.blueprintSnapshot ?? null,
  }
}

export async function hydrateCompositionFromPaper(
  paper: PaperDocument,
): Promise<{ composition: PaperComposition; missingIds: string[] }> {
  const allIds = paper.sections.flatMap((s) => s.questionIds)
  const docs = await getQuestionsByIds(allIds)
  const missingIds: string[] = []
  const composition = emptyComposition()

  for (const snap of paper.sections) {
    const sectionId = snap.id as PaperSectionId
    if (!(sectionId in composition)) continue
    for (const qid of snap.questionIds) {
      const doc = docs.get(qid)
      if (doc) {
        composition[sectionId].push(mapQuestionDoc(qid, doc))
      } else {
        missingIds.push(qid)
        composition[sectionId].push(createMissingQuestionPlaceholder(qid))
      }
    }
  }

  return { composition, missingIds }
}

export function buildCompositionFingerprint(
  setup: PaperSetupState,
  composition: PaperComposition,
  sectionDefs: PaperSectionDef[],
  instanceLayer?: PaperInstanceLayer,
): string {
  return JSON.stringify({
    setup,
    instanceLayer: normalizeInstanceLayer(instanceLayer),
    sections: sectionDefs.map((s) => ({
      id: s.id,
      ids: composition[s.id].map((q) => q.id),
    })),
  })
}
