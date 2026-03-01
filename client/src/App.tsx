import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth-context";
import { TopNav } from "./components/TopNav";
import { RightSidebar } from "./components/RightSidebar";
import { MobileNav } from "./components";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PostComposerModal } from "./components/PostComposerModal";

// Route-level code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const UserProfilePage = lazy(() => import("./pages/UserProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const BillingPage = lazy(() => import("./pages/BillingPage"));
const BillingSuccessPage = lazy(() => import("./pages/BillingSuccessPage"));
const BillingCancelPage = lazy(() => import("./pages/BillingCancelPage"));
const BlocksPage = lazy(() => import("./pages/BlocksPage"));
const FollowersPage = lazy(() => import("./pages/FollowersPage"));
const FollowingPage = lazy(() => import("./pages/FollowingPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="border-primary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [mediaPickerRequestId, setMediaPickerRequestId] = useState(0);

  useEffect(() => {
    const handleOpenComposer = (event: Event) => {
      setIsPostComposerOpen(true);
      const detail = (event as CustomEvent<{ openMediaPicker?: boolean }>)
        .detail;
      if (detail?.openMediaPicker) {
        setMediaPickerRequestId((prev) => prev + 1);
      }
    };
    window.addEventListener("open-post-composer", handleOpenComposer);
    return () => {
      window.removeEventListener("open-post-composer", handleOpenComposer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-4 xl:gap-6">
          <TopNav onOpenPostComposer={() => setIsPostComposerOpen(true)} />
          <div className="min-h-screen min-w-0 flex-1 pt-16 pb-20 lg:pt-0 lg:pb-8">
            <div className="mx-auto min-h-screen w-full max-w-150 border-x border-white/15">
              <main className="w-full">{children}</main>
            </div>
          </div>
          <RightSidebar />
        </div>
      </div>
      <PostComposerModal
        open={isPostComposerOpen}
        onOpenChange={setIsPostComposerOpen}
        mediaPickerRequestId={mediaPickerRequestId}
      />
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
        path="/billing/success"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <BillingSuccessPage />
              </Suspense>
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/billing/cancel"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Suspense fallback={<PageFallback />}>
                <BillingCancelPage />
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
            <Navigate to="/" replace />
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
      <Toaster position="top-right" theme="dark" />
    </BrowserRouter>
  );
}

export default App;
