import { BlueprintDifficultyBar, BlueprintStructurePreview } from '@/components/blueprints/BlueprintShared'
import {
  buildBlueprintMarksTree,
  blueprintGuidanceForExamType,
} from '@/lib/blueprint-paper-bridge'
import type { PaperBlueprintSnapshot } from '@/types/paper'
import { BLUEPRINT_QUESTION_TYPE_LABELS, type BlueprintQuestionType } from '@/types/blueprint'

type Props = {
  snapshot: PaperBlueprintSnapshot
}

function MarksTreeNode({
  node,
  depth = 0,
}: {
  node: ReturnType<typeof buildBlueprintMarksTree>
  depth?: number
}) {
  return (
    <li className="pc-bp-viz-tree-node" style={{ paddingLeft: depth * 14 }}>
      <div className="pc-bp-viz-tree-row">
        <span className="pc-bp-viz-tree-label">{node.label}</span>
        <span className="pc-bp-viz-tree-marks pc-num">{node.marks}m</span>
      </div>
      {node.children?.length ? (
        <ul className="pc-bp-viz-tree-children">
          {node.children.map((child) => (
            <MarksTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function BlueprintStructureViz({ snapshot }: Props) {
  const tree = buildBlueprintMarksTree(snapshot)
  const guidance = blueprintGuidanceForExamType(snapshot)

  const previewSections = snapshot.sections.map((s) => ({
    id: s.blueprintSectionId,
    title: s.title,
    description: s.description,
    marksAllocation: s.marksAllocation,
    questionCount: s.questionCount,
    marksPerQuestion: s.marksPerQuestion,
    allowedQuestionTypes: s.allowedQuestionTypes,
    internalChoice: s.internalChoice,
    instructions: s.instructions,
  }))

  const typeTotals = new Map<string, number>()
  for (const section of snapshot.sections) {
    for (const type of section.allowedQuestionTypes) {
      typeTotals.set(type, (typeTotals.get(type) ?? 0) + section.questionCount)
    }
  }

  return (
    <div className="pc-bp-viz">
      <div className="pc-bp-viz-grid">
        <section className="pc-panel pc-bp-viz-panel">
          <h3 className="pc-bp-viz-title">Marks tree</h3>
          <ul className="pc-bp-viz-tree">
            <MarksTreeNode node={tree} />
          </ul>
        </section>

        <section className="pc-panel pc-bp-viz-panel">
          <h3 className="pc-bp-viz-title">Difficulty balance</h3>
          <BlueprintDifficultyBar mix={snapshot.difficultyDistribution} />
        </section>
      </div>

      <section className="pc-panel pc-bp-viz-panel">
        <h3 className="pc-bp-viz-title">Section hierarchy</h3>
        <BlueprintStructurePreview
          sections={previewSections}
          totalMarks={snapshot.totalMarks}
        />
      </section>

      <div className="pc-bp-viz-grid">
        <section className="pc-panel pc-bp-viz-panel">
          <h3 className="pc-bp-viz-title">Question type distribution</h3>
          <ul className="pc-bp-viz-type-list">
            {[...typeTotals.entries()].map(([type, count]) => (
              <li key={type}>
                <span>
                  {BLUEPRINT_QUESTION_TYPE_LABELS[type as BlueprintQuestionType] ?? type}
                </span>
                <span className="pc-num">× {count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pc-panel pc-bp-viz-panel">
          <h3 className="pc-bp-viz-title">Syllabus coverage</h3>
          <p className="pc-bp-viz-copy">
            {snapshot.chapterCoverage.mode === 'full_syllabus'
              ? 'Full syllabus — all chapters eligible during composition.'
              : `${snapshot.chapterCoverage.chapters.filter((c) => c.included !== false).length} selected chapters with weightage.`}
          </p>
          {snapshot.chapterCoverage.mode === 'selected_chapters' ? (
            <ul className="pc-bp-viz-chapters">
              {snapshot.chapterCoverage.chapters
                .filter((c) => c.included !== false)
                .slice(0, 8)
                .map((c) => (
                  <li key={c.chapterName}>
                    <span>{c.chapterName}</span>
                    <span className="pc-num">{c.marksWeight}m</span>
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      </div>

      {guidance.length > 0 ? (
        <section className="pc-panel pc-bp-viz-panel pc-bp-viz-guidance">
          <h3 className="pc-bp-viz-title">Academic guidance</h3>
          <ul>
            {guidance.map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
