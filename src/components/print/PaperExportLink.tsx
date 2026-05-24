import { PaperExportMenu } from './PaperExportMenu'

type Props = {
  paperId: string
  canExport: boolean
  from?: 'builder' | 'library' | 'approval' | 'editor'
  className?: string
}

/** Export menu — opens official preview to download PDF or Word. */
export function PaperExportLink({
  paperId,
  canExport,
  from = 'library',
  className = '',
}: Props) {
  return (
    <PaperExportMenu
      mode="navigate"
      canExport={canExport}
      paperId={paperId}
      from={from}
      className={className}
    />
  )
}
