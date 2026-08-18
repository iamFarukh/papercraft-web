import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { moveSectionOrder } from '@/lib/paper-instance'
import {
  pageIndexForSelection,
  scrollRootToPage,
  scrollRootToSelection,
} from '@/lib/paper-editor-navigation'
import { useExaminationEditorShell } from '@/context/ExaminationEditorShellContext'
import { toolbarTitleFromSetup, type PaperSectionId } from '@/lib/paper-builder'
import type { EditSelection } from '@/types/paper-instance'
import type { PaperPrintPreviewSnapshot } from '@/types/paper-print-preview'
import {
  useExaminationEditorSession,
} from '@/hooks/useExaminationEditorSession'
import { PaperStructureNavigator } from '@/components/paper-builder/editing/PaperStructureNavigator'
import { EditablePrintDocument } from '@/components/paper-builder/editing/EditablePrintDocument'
import { PrintLayoutProvider } from '@/context/PrintLayoutContext'
import { useMeasuredPrintLayout } from '@/hooks/useMeasuredPrintLayout'
import { PrintMeasureSurface } from '@/components/print/PrintMeasureSurface'
import { DraftRecoveryBanner } from '@/components/ui/DraftRecoveryBanner'
import { ExaminationEditorChrome, type EditorSurfaceMode } from './ExaminationEditorChrome'
import { ExaminationEditorToolbar } from './ExaminationEditorToolbar'
import { ExaminationEditorLeaveDialog } from './ExaminationEditorLeaveDialog'
import { ExaminationEditorOfficialPreview } from './ExaminationEditorOfficialPreview'
import { ExaminationEditorReadOnlyNotice } from './ExaminationEditorReadOnlyNotice'
import { PaperExportLink } from '@/components/print/PaperExportLink'
import { readContinuityState, writeContinuityState } from '@/lib/workflow-continuity'

type SessionProps = Parameters<typeof useExaminationEditorSession>[0]
type EditorContinuityState = {
  surfaceMode?: EditorSurfaceMode
  activePage?: number
  centerScrollTop?: number
  selection?: EditSelection
}

export function ExaminationEditorWorkspace(props: SessionProps) {
  const navigate = useNavigate()
  const { toggleShellNav, shellNavOpen } = useExaminationEditorShell()
  const session = useExaminationEditorSession(props)
  const {
    paperId,
    setup,
    setSetup,
    composition,
    instanceLayer,
    setInstanceLayer,
    sections,
    resolved,
    readOnly,
    paperStatus,
    saveStatus,
    saveHint,
    isDirty,
    save,
    persist,
    tabConflict,
    draftRecovery,
  } = session
  const continuity = readContinuityState<EditorContinuityState>(
    'examination-editor',
    paperId,
  )

  const [selection, setSelection] = useState<EditSelection>(
    continuity?.selection ?? { kind: 'paper' },
  )
  const [surfaceMode, setSurfaceMode] = useState<EditorSurfaceMode>(
    continuity?.surfaceMode ?? 'edit',
  )
  const [activePage, setActivePage] = useState(continuity?.activePage ?? 0)
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [leaveSaving, setLeaveSaving] = useState(false)

  const centerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const pendingNavRef = useRef<string | null>(null)

  const printLayout = useMeasuredPrintLayout(resolved)
  const { pages, pageCount, blocks, layoutSource, isLayoutReady, onPrintMeasured } = printLayout
  const sectionIds = sections.map((s) => s.id)
  const cleanSurface = surfaceMode === 'preview'

  useEffect(() => {
    writeContinuityState(
      'examination-editor',
      {
        surfaceMode,
        activePage,
        selection,
      },
      paperId,
    )
  }, [paperId, surfaceMode, activePage, selection])

  useEffect(() => {
    const el = centerRef.current
    if (!el) return
    if (typeof continuity?.centerScrollTop === 'number') {
      el.scrollTop = continuity.centerScrollTop
    }
    const onScroll = () => {
      writeContinuityState(
        'examination-editor',
        {
          surfaceMode,
          activePage,
          selection,
          centerScrollTop: el.scrollTop,
        },
        paperId,
      )
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [paperId, continuity?.centerScrollTop, surfaceMode, activePage, selection])

  const handleMoveSection = useCallback(
    (sectionId: PaperSectionId, direction: 'up' | 'down') => {
      setInstanceLayer(moveSectionOrder(instanceLayer, sectionIds, sectionId, direction))
    },
    [instanceLayer, sectionIds, setInstanceLayer],
  )

  const scrollToPage = useCallback((pageIndex: number) => {
    setActivePage(pageIndex)
    scrollRootToPage(centerRef.current, pageIndex)
    stripRef.current
      ?.querySelector(`[data-ee-page-thumb="${pageIndex}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  useEffect(() => {
    scrollRootToSelection(centerRef.current, selection)
    const pageIdx = pageIndexForSelection(resolved, selection, pages)
    if (pageIdx != null) {
      setActivePage(pageIdx)
      stripRef.current
        ?.querySelector(`[data-ee-page-thumb="${pageIdx}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selection, resolved, pages])

  useEffect(() => {
    if (!isDirty) return
    function onDocumentClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a[href]')
      if (!anchor || anchor.getAttribute('target') === '_blank') return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http')) return
      if (href.includes(`/builder/${paperId}/editor`)) return
      e.preventDefault()
      e.stopPropagation()
      pendingNavRef.current = href
      setLeaveOpen(true)
    }
    document.addEventListener('click', onDocumentClick, true)
    return () => document.removeEventListener('click', onDocumentClick, true)
  }, [isDirty, paperId])

  const requestLeave = useCallback(() => {
    if (isDirty) {
      pendingNavRef.current = `/app/builder/${paperId}`
      setLeaveOpen(true)
      return
    }
    navigate(`/app/builder/${paperId}`)
  }, [isDirty, navigate, paperId])

  const closeLeaveDialog = useCallback(() => {
    setLeaveOpen(false)
    pendingNavRef.current = null
  }, [])

  const confirmDiscardLeave = useCallback(() => {
    const target = pendingNavRef.current ?? `/app/builder/${paperId}`
    pendingNavRef.current = null
    setLeaveOpen(false)
    navigate(target)
  }, [navigate, paperId])

  const confirmSaveAndLeave = useCallback(async () => {
    const target = pendingNavRef.current ?? `/app/builder/${paperId}`
    setLeaveSaving(true)
    const ok = await persist()
    setLeaveSaving(false)
    if (!ok) return
    pendingNavRef.current = null
    setLeaveOpen(false)
    navigate(target)
  }, [navigate, paperId, persist])

  const buildPrintSnapshot = useCallback(
    (): PaperPrintPreviewSnapshot => ({
      setup,
      composition,
      instanceLayer,
      pages: isLayoutReady ? pages : undefined,
    }),
    [setup, composition, instanceLayer, pages, isLayoutReady],
  )

  const openFullPreview = useCallback(() => {
    navigate(`/app/papers/${paperId}/preview?from=editor`, {
      state: {
        printSnapshot: buildPrintSnapshot(),
        editorContinuity: {
          surfaceMode,
          activePage,
          selection,
        },
      },
    })
  }, [navigate, paperId, buildPrintSnapshot, surfaceMode, activePage, selection])

  return (
    <PrintLayoutProvider
      value={{
        pages,
        blocks,
        pageCount,
        layoutSource,
        isLayoutReady,
      }}
    >
      <PrintMeasureSurface
        resolved={resolved}
        blocks={blocks}
        onMeasured={onPrintMeasured}
      />
      <div className={`pc-ee-workspace${readOnly ? ' is-read-only' : ''}${cleanSurface ? ' is-preview-surface' : ''}`}>
      {draftRecovery.showRecovery && draftRecovery.recoveryLabel ? (
        <DraftRecoveryBanner
          savedLabel={draftRecovery.recoveryLabel}
          onRecover={draftRecovery.applyRecovery}
          onDismiss={draftRecovery.dismissRecovery}
        />
      ) : null}
      {tabConflict ? (
        <div className="pc-pb-missing-banner" role="status">
          This paper may be open in another tab. Save here before editing elsewhere.
        </div>
      ) : null}
      <ExaminationEditorChrome
        title={toolbarTitleFromSetup(setup)}
        saveStatus={saveStatus}
        saveHint={saveHint}
        paperStatus={paperStatus}
        surfaceMode={surfaceMode}
        readOnly={readOnly}
        isDirty={isDirty}
        shellNavOpen={shellNavOpen}
        onToggleShellNav={toggleShellNav}
        onBack={requestLeave}
        onSave={() => void save()}
        onSurfaceModeChange={setSurfaceMode}
        onOpenFullPreview={openFullPreview}
        exportSlot={
          <PaperExportLink
            paperId={paperId}
            canExport={paperStatus === 'approved'}
            from="editor"
          />
        }
      />

      {!cleanSurface ? (
        <ExaminationEditorToolbar
          resolved={resolved}
          selection={selection}
          setup={setup}
          instanceLayer={instanceLayer}
          pageCount={pageCount}
          readOnly={readOnly}
          onSelect={setSelection}
          onInstanceChange={setInstanceLayer}
          onSetupChange={(patch) => setSetup({ ...setup, ...patch })}
          onMoveSection={handleMoveSection}
        />
      ) : null}

      {readOnly ? (
        <div className="pc-ee-readonly-bar">
          <ExaminationEditorReadOnlyNotice onOpenPrintPreview={openFullPreview} />
        </div>
      ) : null}

      <div className="pc-ee-panels">
        <aside className="pc-ee-left">
          <PaperStructureNavigator
            variant="embed"
            resolved={resolved}
            selection={selection}
            onSelect={setSelection}
            onMoveSection={handleMoveSection}
            readOnly={readOnly}
          />
        </aside>

        <div className="pc-ee-center">
          <div className="pc-ee-center-label">
            <span className="pc-ee-center-tag">
              {cleanSurface ? 'Preview surface' : 'Editable paper'}
            </span>
            <span className="pc-ee-center-hint">
              {cleanSurface
                ? 'Clean surface — no editing overlays'
                : isLayoutReady
                  ? 'Select blocks to edit · layout synced to print preview'
                  : 'Measuring print layout…'}
            </span>
          </div>
          <div
            className={`pc-ee-center-scroll pc-scroll${cleanSurface ? ' pc-ee-center-scroll--clean' : ''}`}
            ref={centerRef}
          >
            <EditablePrintDocument
              resolved={resolved}
              pages={pages}
              selection={selection}
              instanceLayer={instanceLayer}
              readOnly={readOnly || cleanSurface}
              cleanSurface={cleanSurface}
              onSelect={setSelection}
              onInstanceChange={setInstanceLayer}
            />
            {cleanSurface ? (
              <p className="pc-ee-center-footnote">
                Preview surface · clean, no editing chrome
              </p>
            ) : null}
          </div>
        </div>

        <ExaminationEditorOfficialPreview
          scrollRef={stripRef}
          resolved={resolved}
          pages={pages}
          setup={setup}
          sections={sections}
          composition={composition}
          syncSelection={selection}
          activePage={activePage}
          onPageSelect={scrollToPage}
        />
      </div>

      <ExaminationEditorLeaveDialog
        open={leaveOpen}
        saving={leaveSaving}
        onStay={closeLeaveDialog}
        onDiscard={confirmDiscardLeave}
        onSaveAndLeave={() => void confirmSaveAndLeave()}
      />
    </div>
    </PrintLayoutProvider>
  )
}
