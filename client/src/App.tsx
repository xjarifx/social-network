import { useMemo, useState } from "react";

type AuthMode = "signin" | "signup";

export default function App() {
  const [mode, setMode] = useState<AuthMode>("signin");

  const copy = useMemo(
    () =>
      mode === "signin"
        ? {
            title: "Welcome back",
            subtitle: "Pick up where you left off and rejoin the conversation.",
            cta: "Continue with Google",
          }
        : {
            title: "Join the network",
            subtitle: "Create your profile and discover new connections.",
            cta: "Create with Google",
          },
    [mode],
  );

  const handleGoogleAuth = () => {
    // Replace with your Google OAuth URL when backend is ready
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen bg-grid text-sand">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand text-sm font-semibold text-ink shadow-glow">
              SN
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight text-sand">
                Social Network
              </p>
              <p className="text-sm text-sand/70">
                Connect boldly, share freely.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-ink/60 p-1 text-sm shadow-inner">
            <button
              className={`rounded-full px-4 py-2 transition ${
                mode === "signin"
                  ? "bg-sand text-ink shadow-button"
                  : "text-sand/70 hover:text-sand"
              }`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              className={`rounded-full px-4 py-2 transition ${
                mode === "signup"
                  ? "bg-sand text-ink shadow-button"
                  : "text-sand/70 hover:text-sand"
              }`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>
        </header>

        <main className="mt-14 grid flex-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center gap-6">
            <p className="w-fit rounded-full border border-sand/20 bg-ink/60 px-4 py-2 text-xs uppercase tracking-[0.2em] text-sand/70">
              Google only access
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-sand sm:text-5xl">
              {copy.title}
            </h1>
            <p className="max-w-xl text-lg text-sand/80">{copy.subtitle}</p>

            <div className="flex flex-wrap gap-3 text-sm text-sand/80">
              <span className="badge">No passwords to remember</span>
              <span className="badge">Single-tap sign on</span>
              <span className="badge">Secure by Google</span>
              <span className="badge">Fast account recovery</span>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-sand/15 bg-ink/70 px-8 py-10 shadow-panel backdrop-blur-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-sand/60">
                {mode === "signin" ? "Sign in" : "Create account"}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-sand">
                {copy.title}
              </h2>
              <p className="mt-2 text-sm text-sand/70">
                Use your Google account to continue.
              </p>

              <button
                type="button"
                onClick={handleGoogleAuth}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-sand px-4 py-3 text-ink shadow-button transition hover:-translate-y-0.5 hover:shadow-button-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand/80"
              >
                <GoogleGlyph />
                <span className="font-medium">{copy.cta}</span>
              </button>

              <p className="mt-8 text-xs leading-relaxed text-sand/60">
                By continuing, you agree to let Social Network use your Google
                profile for authentication. We never see your password and rely
                on Google for security.
              </p>
            </div>
          </section>
        </main>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-sand/60">
          <p>
            © {new Date().getFullYear()} Social Network. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span>Privacy-first</span>
            <span className="h-1 w-1 rounded-full bg-sand/40" aria-hidden />
            <span>Google OAuth 2.0</span>
            <span className="h-1 w-1 rounded-full bg-sand/40" aria-hidden />
            <span>Secure sessions</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 46 46"
      className="h-5 w-5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.5 19.125v7.635h10.605c-.465 2.566-1.872 4.737-3.981 6.193v5.151h6.435c3.768-3.472 5.941-8.585 5.941-14.63 0-1.406-.126-2.754-.36-4.05H23.5Z"
        fill="#4285F4"
      />
      <path
        d="M13.907 27.457l-1.678 1.287-5.31 4.134C9.785 38.477 16.189 42 23.5 42c5.67 0 10.418-1.87 13.94-5.146l-6.435-5.152c-1.741 1.17-3.967 1.862-7.505 1.862-5.736 0-10.598-3.72-12.393-8.974Z"
        fill="#34A853"
      />
      <path
        d="M6.919 14.122C5.702 16.65 5 19.336 5 22.12c0 2.784.702 5.47 1.919 8.001 0 .152 7.988-6.198 7.988-6.198-.46-1.378-.72-2.874-.72-4.439 0-1.566.26-3.061.72-4.44l-7.988-6.923Z"
        fill="#FBBC05"
      />
      <path
        d="M23.5 9.63c3.439 0 6.487 1.185 8.909 3.53L38.68 7.889C33.91 3.51 28.627 1.5 23.5 1.5 16.19 1.5 9.784 5.026 6.919 14.122l7.988 6.923C12.901 15.306 17.764 9.63 23.5 9.63Z"
        fill="#EA4335"
      />
    </svg>
  );
}
