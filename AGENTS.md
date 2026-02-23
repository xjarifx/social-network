# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

A full-stack social network application with a React (Vite) client and Express/TypeScript server. PostgreSQL for persistence, Redis for caching, Cloudinary for media uploads, and Stripe for billing/subscriptions.

## Development Commands

### Setup & Run
- **First-time setup:** `bash scripts/setup.sh` (installs deps, starts Docker, runs migrations, seeds DB)
- **Start all services:** `bash scripts/dev.sh` (starts Postgres/Redis Docker containers, Prisma Studio, server, and client)
- **Server only:** `cd server && npm run dev` (uses `tsx watch`)
- **Client only:** `cd client && npm run dev` (Vite dev server on port 5173)
- **Seed database:** `cd server && npm run seed`

### Infrastructure
- **Start Docker (Postgres + Redis):** `cd server && docker compose up -d`
- **Prisma migrations:** `cd server && npx prisma migrate dev`
- **Generate Prisma client:** `cd server && npx prisma generate`
- **Prisma Studio:** `cd server && npx prisma studio`

### Build & Lint
- **Build server:** `cd server && npm run build` (runs `tsc`)
- **Build client:** `cd client && npm run build` (runs `tsc -b && vite build`)
- **Lint client:** `cd client && npm run lint` (ESLint)

### Environment
- Server env: `server/.env` (copy from `server/.env.example`)
- Client env: `client/.env` (copy from `client/.env.example`)
- Server runs on `PORT` from env (default 3000), client on 5173

## Architecture

### Monorepo Structure
Two independent npm packages (`client/` and `server/`) with no shared workspace tooling. Each has its own `package.json` and `node_modules`.

### Server (`server/src/`)

**Module pattern:** Each domain feature lives in `server/src/modules/<name>/` with a consistent 4-file structure:
- `<name>.routes.ts` — Express Router, mounts middleware (auth, rate limiters), delegates to controller
- `<name>.controller.ts` — Request/response handling only, calls service functions, maps service errors to HTTP status codes
- `<name>.service.ts` — Business logic, Prisma queries, caching, validation. Uses `type any` for inputs but validates with Zod schemas early (per project convention)
- `<name>.validation.ts` — Zod schemas for input validation

Modules: `auth`, `user`, `posts`, `comments`, `likes`, `follows`, `blocks`, `billing`, `notifications`

**Middleware** (`server/src/middleware/`):
- `authenticate.middleware.ts` — JWT verification; sets `req.userId` on authenticated requests. Also exports `authenticateOptional` for routes that work with or without auth.
- `rateLimit.middleware.ts` — Multiple rate limiters (auth, general, posts, comments, likes, follows)

**Shared libs** (`server/src/lib/`):
- `prisma.ts` — PrismaClient with `@prisma/adapter-pg` (uses raw `pg` Pool)
- `cache.ts` — Redis wrapper with tag-based invalidation (`buildCacheKey`, `cacheGet`, `cacheSet`, `invalidateTags`). Has a global on/off switch (`setCacheEnabled`).
- `cloudinary.ts` — Media upload via buffer stream (used for post images/videos)

**Database:** Prisma ORM with schema at `server/prisma/schema.prisma`. Generated client outputs to `server/src/generated/prisma/`. Uses `@map` annotations to map camelCase fields to snake_case DB columns. All models use UUID primary keys and soft-delete via `deletedAt` where applicable.

**Route mounting:** All API routes mount under `/api/v1/` in `server/src/index.ts`. Posts routes nest likes (`/:postId/likes`) and comments (`/:postId/comments`) as sub-routers.

### Client (`client/src/`)

**Stack:** React 19 + TypeScript, Vite, Tailwind CSS, React Router v6, Radix UI primitives, Framer Motion, Sonner (toasts), Lucide icons.

**Key structure:**
- `services/api.ts` — Single API client module. Exports typed API objects (`authAPI`, `usersAPI`, `postsAPI`, `likesAPI`, `commentsAPI`, `followsAPI`, `notificationsAPI`, `blocksAPI`, `billingAPI`). Handles JWT token storage in localStorage, automatic token refresh on 401, and redirect to `/login` on session expiry.
- `context/AuthContext.tsx` — Auth state provider. Provides `useAuth()` hook with `user`, `login`, `register`, `logout`, `isAuthenticated`.
- `pages/` — Route-level components, lazy-loaded via `React.lazy()` in `App.tsx`
- `components/` — Reusable UI. `components/ui/` contains Radix-based primitives (button, input, dialog, etc.). Uses `cn()` utility from `lib/utils.ts` for Tailwind class merging.
- `hooks/useComments.ts` — Complex stateful hook managing comments, replies, likes, and pagination per post

**Routing:** `App.tsx` defines all routes. Auth routes (`/login`, `/register`) redirect to `/` if authenticated. All other routes wrapped in `<ProtectedRoute>` and `<AppLayout>`.

## Project Conventions (from docs/CONVENTIONS.md)

1. Use `type any` for inputs but validate with Zod — validation in the validation file, called from the service
2. Throw complete Error objects with context (e.g., `throw new Error("EMAIL_TAKEN")`)
3. Never trust client input for identity — always use `req.userId` from auth middleware
4. One validation file per module; validate in controller for param checks/early exit, business logic validation in service
5. API response format: `{ "success": true, "data": {}, "error": null }`

## API Routes

All routes prefixed with `/api/v1/`. Full route documentation is in `docs/apiRoutes.md`. Key modules:
- Auth: `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/refresh`
- Users: `/users/me`, `/users/:userId`, `/users/search`, `/users/:userId/posts`
- Posts: `/posts/`, `/posts/feed`, `/posts/for-you`, `/posts/:postId`
- Comments: `/posts/:postId/comments/` (nested)
- Likes: `/posts/:postId/likes` (nested)
- Follows: `/users/:userId/follow`
- Blocks: `/blocks/`
- Notifications: `/notifications/`
- Billing: `/billing/` (Stripe integration)
