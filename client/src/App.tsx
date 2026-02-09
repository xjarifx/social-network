import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LeftSidebar, MobileNav } from "./components";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Route-level code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const BlocksPage = lazy(() => import("./pages/BlocksPage"));
const FollowersPage = lazy(() => import("./pages/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/FollowingPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ComposePage = lazy(() => import("./pages/ComposePage"));

function PageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      <LeftSidebar />
      {/* Main content area offset for sidebar on desktop */}
      <div className="pb-20 pt-0 lg:ml-[280px] lg:pb-0">
        <main className="mx-auto w-full max-w-[720px] px-4 py-6 lg:py-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Auth routes - redirect to home if already logged in */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageFallback />}>
              <LoginPage />
            </Suspense>
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Suspense fallback={<PageFallback />}>
              <RegisterPage />
            </Suspense>
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <HomePage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <ProfilePage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:userId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <UserProfilePage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <NotificationsPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <BillingPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/blocks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <BlocksPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/followers"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <FollowersPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/following"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <FollowingPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <SearchPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/compose"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <ComposePage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster position="top-right" theme="light" />
    </BrowserRouter>
  );
}

export default App;
