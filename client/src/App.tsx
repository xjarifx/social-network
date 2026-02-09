import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LeftSidebar, MobileNav } from "./components";
import { ThemeToggle } from "./components/ThemeToggle";
import { useTheme } from "./components/theme/ThemeProvider";
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
    <div className="min-h-screen bg-background text-foreground px-4 pb-24 pt-4 lg:pl-80 lg:pr-6 lg:py-6">
      <LeftSidebar />
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-glass backdrop-blur-xl lg:hidden">
          <div>
            <div className="text-sm font-semibold">Social Network</div>
            <div className="text-xs text-muted-foreground">Your orbit</div>
          </div>
          <ThemeToggle />
        </div>
        {children}
      </main>
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
  const { theme } = useTheme();

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster position="top-right" theme={theme} />
    </BrowserRouter>
  );
}

export default App;
