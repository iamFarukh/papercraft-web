import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  BlueprintBuilderWorkspace,
  blueprintDraftFromDuplicateParam,
} from '@/components/blueprints/BlueprintEditor'
import { createEmptyBlueprintDraft } from '@/lib/blueprint-defaults'
import { getBlueprintById } from '@/services/firebase/blueprints'

export function BlueprintCreatePage() {
  const [params] = useSearchParams()
  const fromId = params.get('from')
  const nameParam = params.get('name')
  const [initialDraft, setInitialDraft] = useState(createEmptyBlueprintDraft())
  const [loading, setLoading] = useState(Boolean(fromId))
  const [seedKey, setSeedKey] = useState(0)

  useEffect(() => {
    if (!fromId) return
    let cancelled = false
    getBlueprintById(fromId)
      .then((doc) => {
        if (!cancelled) {
          const draft = blueprintDraftFromDuplicateParam(doc)
          if (draft) {
            if (nameParam?.trim()) {
              draft.name = decodeURIComponent(nameParam.trim())
            }
            setInitialDraft(draft)
            setSeedKey((k) => k + 1)
          }
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fromId, nameParam])

  if (loading) {
    return <p className="pc-bp-muted pc-bp-page-pad">Preparing blueprint…</p>
  }

  return (
    <BlueprintBuilderWorkspace
      key={seedKey}
      mode="create"
      initialDraft={initialDraft}
    />
  )
}

export function BlueprintEditPage() {
  return <BlueprintBuilderWorkspace mode="edit" />
}
