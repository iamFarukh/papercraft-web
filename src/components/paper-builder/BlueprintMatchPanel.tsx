import { FadeIn } from '@/components/motion/FadeIn'
import {
  computeBlueprintMatch,
  formatBlueprintMatchLabel,
  type BlueprintMatchResult,
} from '@/lib/blueprint-paper-bridge'
import type { PaperComposition, PaperSectionDef, PaperStats } from '@/lib/paper-builder'
import type { PaperBlueprintSnapshot } from '@/types/paper'

type Props = {
  snapshot: PaperBlueprintSnapshot
  blueprintName: string
  composition: PaperComposition
  sections: PaperSectionDef[]
  stats: PaperStats
}

export function BlueprintMatchPanel({
  snapshot,
  blueprintName,
  composition,
  sections,
  stats,
}: Props) {
  const match: BlueprintMatchResult = computeBlueprintMatch(
    snapshot,
    composition,
    sections,
    stats,
  )

  return (
    <FadeIn className="pc-pb-bp-match">
      <div className="pc-pb-bp-match-head">
        <div>
          <span className="pc-pb-bp-match-kicker">Blueprint match</span>
          <span className="pc-pb-bp-match-blueprint pc-serif">{blueprintName}</span>
        </div>
        <div className="pc-pb-bp-match-score">
          <span className="pc-pb-bp-match-pct pc-num">{match.score}%</span>
          <span className="pc-pb-bp-match-label">{formatBlueprintMatchLabel(match.score)}</span>
        </div>
      </div>

      <div className="pc-pb-bp-match-bar">
        <span style={{ width: `${match.score}%` }} />
      </div>

      {match.issues.length > 0 ? (
        <ul className="pc-pb-bp-match-issues">
          {match.issues.slice(0, 5).map((issue) => (
            <li key={issue.message} className={`is-${issue.kind}`}>
              {issue.message}
            </li>
          ))}
        </ul>
      ) : (
        <p className="pc-pb-bp-match-ok">Paper structure aligns with the blueprint.</p>
      )}

      {match.missing.length > 0 ? (
        <div className="pc-pb-bp-match-group">
          <span className="pc-pb-bp-match-group-k">Missing</span>
          <ul>
            {match.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {match.overweight.length > 0 ? (
        <div className="pc-pb-bp-match-group">
          <span className="pc-pb-bp-match-group-k">Overweight</span>
          <ul>
            {match.overweight.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </FadeIn>
  )
}
