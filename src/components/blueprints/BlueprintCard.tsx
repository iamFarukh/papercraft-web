import { ArrowRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MotionListItem } from '@/components/motion/MotionList'
import {
  formatBlueprintDuration,
  formatClassRange,
  formatSubjectList,
} from '@/lib/blueprint-utils'
import type { BlueprintListItem } from '@/types/blueprint'

type Props = {
  blueprint: BlueprintListItem
  variant?: 'default' | 'custom'
}

export function BlueprintCard({ blueprint, variant = 'default' }: Props) {
  const isCustom = variant === 'custom'

  return (
    <MotionListItem className="pc-bp-card-wrap">
      <Link to={`/app/blueprints/${blueprint.id}`} className="pc-bp-card pc-motion-surface">
        <span className="pc-bp-card-badge pc-tag is-outline">
          {blueprint.isSystem ? 'System' : 'Custom'}
        </span>

        <div className="pc-bp-card-head">
          <div className="pc-bp-card-icon-row">
            <span className={`pc-bp-card-icon ${isCustom ? 'is-custom' : ''}`}>
              <Target size={11} strokeWidth={1.6} />
            </span>
            <span className="pc-tag is-outline">{blueprint.examType}</span>
          </div>
          <h3 className="pc-bp-card-title pc-serif">{blueprint.name}</h3>
          {blueprint.description ? (
            <p className="pc-bp-card-hint">{blueprint.description}</p>
          ) : null}
        </div>

        <div className="pc-bp-card-stats">
          <div>
            <span className="pc-bp-card-stat-k">Marks</span>
            <span className="pc-bp-card-stat-v pc-num">{blueprint.totalMarks}</span>
          </div>
          <div>
            <span className="pc-bp-card-stat-k">Time</span>
            <span className="pc-bp-card-stat-v pc-num">
              {formatBlueprintDuration(blueprint.durationMinutes)}
            </span>
          </div>
          <div>
            <span className="pc-bp-card-stat-k">Sections</span>
            <span className="pc-bp-card-stat-v pc-num">{blueprint.sectionCount}</span>
          </div>
        </div>

        <div className="pc-bp-card-foot">
          <div className="pc-bp-card-meta">
            <span>{formatClassRange(blueprint.recommendedClasses)}</span>
            <span className="pc-bp-card-meta-sep">·</span>
            <span>{formatSubjectList(blueprint.recommendedSubjects)}</span>
          </div>
          <div className="pc-bp-card-foot-row">
            {isCustom ? (
              <span className="pc-bp-card-author">by {blueprint.createdByLabel}</span>
            ) : (
              <span className="pc-bp-card-system-label">PaperCraft default</span>
            )}
            {blueprint.usagePaperCount ? (
              <span className="pc-bp-card-usage pc-num">
                {blueprint.usagePaperCount} paper{blueprint.usagePaperCount === 1 ? '' : 's'}
              </span>
            ) : null}
            <span className="pc-bp-card-arrow" aria-hidden>
              <ArrowRight size={12} strokeWidth={1.6} />
            </span>
          </div>
        </div>
      </Link>
    </MotionListItem>
  )
}
