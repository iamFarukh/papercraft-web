import { lazy, Suspense } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CommandCenterProvider } from '@/context/CommandCenterContext'
import { WorkspaceSettingsProvider } from '@/context/WorkspaceSettingsContext'
import { BookmarkProvider } from '@/context/BookmarkContext'
import { QuestionCountProvider } from '@/context/QuestionCountContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ConnectivityProvider } from '@/context/ConnectivityContext'
import { ToastProvider } from '@/context/ToastContext'
import { AppLayout } from '@/pages/AppLayout'
import { ErrorBoundary } from '@/components/system/ErrorBoundary'
import { RouteFallback } from '@/components/system/RouteFallback'
import { AdminRoute } from '@/routes/AdminRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

// Code-split every route page into its own chunk so the initial bundle no
// longer eagerly ships the editor, export (jspdf/html2canvas/docx) and import
// (xlsx) libraries. AppLayout + route guards stay eager (the shell).
const BookmarksPage = lazy(() =>
  import('@/pages/BookmarksPage').then((m) => ({ default: m.BookmarksPage })),
)
const ControlCenterPage = lazy(() =>
  import('@/pages/ControlCenterPage').then((m) => ({ default: m.ControlCenterPage })),
)
const QuestionAuthorPage = lazy(() =>
  import('@/pages/QuestionAuthorPage').then((m) => ({ default: m.QuestionAuthorPage })),
)
const BulkImportPage = lazy(() =>
  import('@/pages/BulkImportPage').then((m) => ({ default: m.BulkImportPage })),
)
const ExaminationEditorPage = lazy(() =>
  import('@/pages/ExaminationEditorPage').then((m) => ({ default: m.ExaminationEditorPage })),
)
const PaperBuilderCanvasPage = lazy(() =>
  import('@/pages/PaperBuilderCanvasPage').then((m) => ({ default: m.PaperBuilderCanvasPage })),
)
const PaperBuilderSetupPage = lazy(() =>
  import('@/pages/PaperBuilderSetupPage').then((m) => ({ default: m.PaperBuilderSetupPage })),
)
const ApprovalReviewPage = lazy(() =>
  import('@/pages/ApprovalReviewPage').then((m) => ({ default: m.ApprovalReviewPage })),
)
const ApprovalsQueuePage = lazy(() =>
  import('@/pages/ApprovalsQueuePage').then((m) => ({ default: m.ApprovalsQueuePage })),
)
const PaperPrintPreviewPage = lazy(() =>
  import('@/pages/PaperPrintPreviewPage').then((m) => ({ default: m.PaperPrintPreviewPage })),
)
const PapersListPage = lazy(() =>
  import('@/pages/PapersListPage').then((m) => ({ default: m.PapersListPage })),
)
const BlueprintCreatePage = lazy(() =>
  import('@/pages/BlueprintAuthorPage').then((m) => ({ default: m.BlueprintCreatePage })),
)
const BlueprintEditPage = lazy(() =>
  import('@/pages/BlueprintAuthorPage').then((m) => ({ default: m.BlueprintEditPage })),
)
const BlueprintDetailPage = lazy(() =>
  import('@/pages/BlueprintDetailPage').then((m) => ({ default: m.BlueprintDetailPage })),
)
const BlueprintLibraryPage = lazy(() =>
  import('@/pages/BlueprintLibraryPage').then((m) => ({ default: m.BlueprintLibraryPage })),
)
const CurriculumPage = lazy(() =>
  import('@/pages/CurriculumPage').then((m) => ({ default: m.CurriculumPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const TeachersPage = lazy(() =>
  import('@/pages/TeachersPage').then((m) => ({ default: m.TeachersPage })),
)
const RepositoryPage = lazy(() =>
  import('@/pages/RepositoryPage').then((m) => ({ default: m.RepositoryPage })),
)
// Dev-only diagnostic harnesses (see src/pages/dev/)
const PrintLabPage = lazy(() =>
  import('@/pages/dev/PrintLabPage').then((m) => ({ default: m.PrintLabPage })),
)
const EditorLabPage = lazy(() =>
  import('@/pages/dev/EditorLabPage').then((m) => ({ default: m.EditorLabPage })),
)

function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <ErrorBoundary scopeLabel="the application">
      <AuthProvider>
        <WorkspaceSettingsProvider>
        <CommandCenterProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginRoute />} />
          {import.meta.env.DEV ? (
            <>
              <Route
                path="/dev/print-lab"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <PrintLabPage />
                  </Suspense>
                }
              />
              <Route
                path="/dev/editor-lab"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <EditorLabPage />
                  </Suspense>
                }
              />
            </>
          ) : null}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/app/papers/:paperId/preview"
              element={
                <ErrorBoundary scopeLabel="the print preview">
                  <Suspense fallback={<RouteFallback />}>
                    <PaperPrintPreviewPage />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/app"
              element={
                <ToastProvider>
                  <ConnectivityProvider>
                  <NotificationProvider>
                    <BookmarkProvider>
                      <QuestionCountProvider>
                        <AppLayout />
                      </QuestionCountProvider>
                    </BookmarkProvider>
                  </NotificationProvider>
                  </ConnectivityProvider>
                </ToastProvider>
              }
            >
              <Route index element={<ControlCenterPage />} />
              <Route path="repository" element={<RepositoryPage />} />
              <Route path="builder/new" element={<PaperBuilderSetupPage />} />
              <Route path="builder/:paperId/editor" element={<ExaminationEditorPage />} />
              <Route path="builder/:paperId" element={<PaperBuilderCanvasPage />} />
              <Route path="builder" element={<PaperBuilderCanvasPage />} />
              <Route path="papers" element={<PapersListPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="bookmarks/:folderId" element={<BookmarksPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="curriculum" element={<CurriculumPage />} />
              <Route path="blueprints" element={<BlueprintLibraryPage />} />
              <Route element={<AdminRoute />}>
                <Route path="blueprints/new" element={<BlueprintCreatePage />} />
                <Route path="blueprints/:id/edit" element={<BlueprintEditPage />} />
                <Route path="teachers" element={<TeachersPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="approvals" element={<ApprovalsQueuePage />} />
                <Route path="approvals/:paperId" element={<ApprovalReviewPage />} />
                <Route
                  path="repository/import"
                  element={<BulkImportPage />}
                />
                <Route
                  path="repository/new"
                  element={<QuestionAuthorPage mode="create" />}
                />
                <Route
                  path="repository/:id/edit"
                  element={<QuestionAuthorPage mode="edit" />}
                />
              </Route>
              <Route path="blueprints/:id" element={<BlueprintDetailPage />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </BrowserRouter>
        </CommandCenterProvider>
        </WorkspaceSettingsProvider>
      </AuthProvider>
      </ErrorBoundary>
    </LazyMotion>
  )
}

export default App
