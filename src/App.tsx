import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { BookmarkProvider } from '@/context/BookmarkContext'
import { QuestionCountProvider } from '@/context/QuestionCountContext'
import { ToastProvider } from '@/context/ToastContext'
import { BookmarksPage } from '@/pages/BookmarksPage'
import { AppLayout } from '@/pages/AppLayout'
import { ControlCenterPage } from '@/pages/ControlCenterPage'
import { QuestionAuthorPage } from '@/pages/QuestionAuthorPage'
import { BulkImportPage } from '@/pages/BulkImportPage'
import { RepositoryPage } from '@/pages/RepositoryPage'
import { AdminRoute } from '@/routes/AdminRoute'
import { LoginRoute } from '@/routes/LoginRoute'
import { ProtectedRoute } from '@/routes/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/app"
              element={
                <ToastProvider>
                  <BookmarkProvider>
                    <QuestionCountProvider>
                      <AppLayout />
                    </QuestionCountProvider>
                  </BookmarkProvider>
                </ToastProvider>
              }
            >
              <Route index element={<ControlCenterPage />} />
              <Route path="repository" element={<RepositoryPage />} />
              <Route path="bookmarks" element={<BookmarksPage />} />
              <Route path="bookmarks/:folderId" element={<BookmarksPage />} />
              <Route element={<AdminRoute />}>
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
  )
}

export default App
