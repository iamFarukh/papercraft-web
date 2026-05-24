/** Screen-only divider between paginated A4 pages in builder / preview. */
export function PrintPageBreakRibbon({
  pageNumber,
  pageCount,
}: {
  pageNumber: number
  pageCount: number
}) {
  return (
    <div className="pc-print-page-break" aria-hidden>
      <span className="pc-print-page-break-line" />
      <span className="pc-print-page-break-label pc-num">
        Page break · {pageNumber} / {pageCount}
      </span>
      <span className="pc-print-page-break-line" />
    </div>
  )
}
