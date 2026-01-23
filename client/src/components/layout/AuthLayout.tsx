import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-grid text-sand">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
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
          </Link>
        </header>

        <main className="mt-14 grid flex-1 gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-center gap-6">
            <h1 className="text-4xl font-semibold leading-tight text-sand sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-xl text-lg text-sand/80">{subtitle}</p>

            <div className="flex flex-wrap gap-3 text-sm text-sand/80">
              <span className="badge">Secure authentication</span>
              <span className="badge">Privacy-focused</span>
              <span className="badge">Fast & reliable</span>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-sand/15 bg-ink/70 px-8 py-10 shadow-panel backdrop-blur-sm">
              {children}
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
            <span>Encrypted connections</span>
            <span className="h-1 w-1 rounded-full bg-sand/40" aria-hidden />
            <span>Secure sessions</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
