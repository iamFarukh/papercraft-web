import { LazyMotion, domAnimation } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { BookmarkProvider } from '@/context/BookmarkContext'
import { QuestionCountProvider } from '@/context/QuestionCountContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ToastProvider } from '@/context/ToastContext'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { AppLayout } from '@/pages/AppLayout'
import { ControlCenterPage } from '@/pages/ControlCenterPage'
import { QuestionAuthorPage } from '@/pages/QuestionAuthorPage'
import { BulkImportPage } from '@/pages/BulkImportPage'
import { PaperBuilderCanvasPage } from '@/pages/PaperBuilderCanvasPage'
import { PaperBuilderSetupPage } from '@/pages/PaperBuilderSetupPage'
import { ApprovalReviewPage } from '@/pages/ApprovalReviewPage'
import { ApprovalsQueuePage } from '@/pages/ApprovalsQueuePage'
import { PaperPrintPreviewPage } from '@/pages/PaperPrintPreviewPage'
import { PapersListPage } from '@/pages/PapersListPage'
import { CurriculumPage } from '@/pages/CurriculumPage'
import { TeachersPage } from '@/pages/TeachersPage'
import { RepositoryPage } from '@/pages/RepositoryPage'
import { AdminRoute } from '@/routes/AdminRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app/papers/:paperId/preview" element={<PaperPrintPreviewPage />} />
            <Route
              path="/app"
              element={
                <ToastProvider>
                  <NotificationProvider>
                    <BookmarkProvider>
                      <QuestionCountProvider>
                        <AppLayout />
                      </QuestionCountProvider>
                    </BookmarkProvider>
                  </NotificationProvider>
                </ToastProvider>
              }
            >
              <Route index element={<ControlCenterPage />} />
              <Route path="repository" element={<RepositoryPage />} />
              <Route path="builder/new" element={<PaperBuilderSetupPage />} />
              <Route path="builder/:paperId" element={<PaperBuilderCanvasPage />} />
              <Route path="builder" element={<PaperBuilderCanvasPage />} />
              <Route path="papers" element={<PapersListPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="bookmarks/:folderId" element={<BookmarksPage />} />
              <Route path="curriculum" element={<CurriculumPage />} />
              <Route element={<AdminRoute />}>
                <Route path="teachers" element={<TeachersPage />} />
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
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LazyMotion>
  )
}

export default App
