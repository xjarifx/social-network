# Bug Report & Issues

---

## CRITICAL

---

### 1. Prisma schema missing `url` in datasource

**File:** `server/prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  // url is MISSING
}
```

The `url` field is required by Prisma to know which database to connect to. Without it, `prisma generate` and `prisma migrate` will fail unless the `DATABASE_URL` env var is set AND Prisma falls back to it automatically — but this is fragile and non-standard. The schema should explicitly declare it.

**Fix:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 2. `getForYouFeed` returns empty array when user has no second-degree connections

**File:** `server/src/modules/posts/posts.service.ts`

```ts
if (secondDegreeIds.length === 0) {
  return [];
}
```

If the user follows people who don't follow anyone else, the "For You" tab is permanently empty — even though the user has a following list. There's no fallback to show popular/recent public posts. New users or users with small networks get a blank feed with no explanation.

**Fix:** Fall back to recent public posts from non-blocked users when `secondDegreeIds` is empty, or at minimum include the user's own following feed as a fallback.

---

### 3. `getForYouFeed` also returns empty when user follows nobody

**File:** `server/src/modules/posts/posts.service.ts`

```ts
if (directFollowing.length === 0) {
  return [];
}
```

A brand-new user with zero follows sees an empty "For You" feed. This is a terrible onboarding experience. The "For You" feed should show trending/recent public posts to new users.

**Fix:** When `directFollowing.length === 0`, query recent public posts from non-blocked users instead of returning `[]`.

---

### 4. `likesCount` / `commentsCount` denormalized counters can drift out of sync

**File:** `server/prisma/schema.prisma`, `server/src/modules/likes/likes.service.ts`

The schema stores `likesCount` and `commentsCount` as integer columns on `Post` and `Comment`. These are incremented/decremented manually in transactions. If a transaction partially fails, or if a direct DB operation bypasses the service layer (e.g., seed scripts, admin tools, migrations), these counters will silently drift from the actual row counts.

There is no reconciliation job or integrity check anywhere.

**Fix:** Either use `_count` relations from Prisma (computed at query time) and remove the denormalized columns, or add a periodic reconciliation job that resets counts from actual `COUNT(*)` queries.

---

### 5. `refreshToken` expiry is hardcoded to 30 days regardless of `REFRESH_TOKEN_EXPIRES_IN`

**File:** `server/src/modules/auth/auth.service.ts`

```ts
const getRefreshTokenExpiry = (): Date => {
  // 30 days from now
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};
```

The JWT itself uses `REFRESH_TOKEN_EXPIRES_IN` from env, but the database `expiresAt` field is always hardcoded to 30 days. If you set `REFRESH_TOKEN_EXPIRES_IN=7d` in env, the JWT expires in 7 days but the DB record says it's valid for 30 — or vice versa. The two sources of truth are out of sync.

**Fix:** Parse `REFRESH_TOKEN_EXPIRES_IN` and use it to compute `expiresAt` dynamically.

---

## HIGH

---

### 6. `updateUserProfile` service receives `{ userId: currentUserId }` as params but validates it as `req.params`

**File:** `server/src/modules/user/user.controller.ts`

```ts
const updatedUser = await updateUserProfile(
  currentUserId,
  { userId: currentUserId }, // <-- manually constructed params object
  req.body,
);
```

**File:** `server/src/modules/user/user.service.ts`

```ts
const paramValidation = userIdParamSchema.safeParse({ params });
// ...
if (profileUserId !== userId) {
  throw { status: 403, error: "Cannot update other user's profile" };
}
```

The controller passes `{ userId: currentUserId }` as params, then the service validates it and checks `profileUserId !== userId`. Since both are the same value, the 403 check is always false and never fires. This means the ownership check is effectively dead code — it can never protect anything. The route is `PATCH /users/me` so it's not exploitable here, but the logic is misleading and fragile.

**Fix:** Remove the redundant params validation in `updateUserProfile` since the route is `/me` — just use `userId` directly.

---

### 7. `followsAPI.unfollowUser` sends wrong URL

**File:** `client/src/services/api.ts`

```ts
unfollowUser: async (userId: string, followingId: string): Promise<void> => {
  return apiRequest(`/users/${userId}/follow/${followingId}`, {
    method: "DELETE",
  });
},
```

**File:** `server/src/modules/follows/follow.routes.ts`

```ts
router.delete("/:followingId", generalLimiter, authenticate, unfollow);
```

The route is mounted at `/users/:userId/follow`, so the full path is `/users/:userId/follow/:followingId`. The client sends `userId` as the profile owner's ID, but the server only uses the authenticated user's ID from the JWT (`req.userId`). The `userId` in the URL is ignored by the server — it's just noise. This works accidentally but is semantically wrong and confusing.

**Fix:** The client should call `DELETE /users/${followingId}/follow` (or the server should be updated to use the URL param consistently).

---

### 8. `apiRequest` infinite redirect loop on token refresh failure

**File:** `client/src/services/api.ts`

```ts
} catch (error) {
  console.error("Token refresh failed:", error);
  clearTokens();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
  throw error;
}
```

If the refresh endpoint itself returns a 401 (e.g., the refresh token is expired), `apiRequest` is called recursively for the refresh request. That inner call also gets a 401, tries to refresh again (no refresh token now since it was just cleared), and throws. The outer catch then redirects. This is fragile — if `clearTokens()` fails to run before the recursive call, you get a loop.

**Fix:** The refresh call should bypass the 401 retry logic. Pass a flag like `{ skipRefresh: true }` to the inner `fetch` call for the refresh endpoint.

---

### 9. `cache.invalidatePattern` uses `KEYS` command — dangerous in production Redis

**File:** `server/src/lib/cache.ts`

```ts
export const invalidatePattern = async (pattern: string): Promise<void> => {
  const keys = await client!.keys(pattern);
  if (keys.length > 0) await client!.del(keys);
};
```

`KEYS` is an O(N) blocking command that scans the entire keyspace. In production with thousands of cached keys, calling `KEYS feed:*` after every post creation will block Redis for the duration of the scan, causing latency spikes across all cache operations.

**Fix:** Use `SCAN` with cursor iteration instead of `KEYS`, or use Redis key sets/tags to track invalidation groups.

---

### 10. `getPostsFeed` and `getForYouPostsFeed` controllers swallow service errors

**File:** `server/src/modules/posts/posts.controller.ts`

```ts
} catch (error: unknown) {
  console.error("Get feed error:", error);
  res.status(500).json({ error: "Unable to fetch feed" });
}
```

Unlike other controllers (e.g., `getPost`, `createNewPost`) which properly forward 400/403/404 status codes from the service, the feed controllers always return 500 regardless of what the service throws. If the service throws a `{ status: 400, error: "..." }`, the client gets a 500 instead.

**Fix:** Add status-aware error handling like the other controllers.

---

### 11. `Post.content` is `String @db.Text` but allows empty string

**File:** `server/prisma/schema.prisma`

```prisma
content String @db.Text
```

The schema has no `@db.VarChar` minimum length constraint. The service checks `if (!normalizedContent && !file)` but if someone sends `content: "   "` (whitespace only) with a file, the post is created with empty content. The `normalizedContent` is trimmed to `""` but the file path is set, so the check passes.

This is partially handled in the service but the schema itself has no constraint, meaning direct DB inserts bypass validation entirely.

---

### 12. `updatePost` enforces character limit on new content but not on existing posts

**File:** `server/src/modules/posts/posts.service.ts`

```ts
await enforcePostLimitForUser(authorId, content);
```

When a PRO user creates a post with 80 characters, then downgrades to FREE (20 char limit), they can no longer edit that post at all — even to fix a typo — because the existing content (80 chars) exceeds the FREE limit. The edit is blocked even if the user isn't changing the length.

**Fix:** Only enforce the limit if the new content is longer than the existing content, or only enforce it on the delta.

---

## MEDIUM

---

### 13. `HomePage` has two conflicting `useEffect` hooks that both set `overflow: hidden`

**File:** `client/src/pages/HomePage.tsx`

```ts
// Effect 1: locks scroll when comments modal is open
useEffect(() => {
  document.documentElement.style.overflow = comments.openCommentsPostId ? "hidden" : "";
  // ...
}, [comments.openCommentsPostId]);

// Effect 2: ALWAYS locks scroll, runs once on mount
useEffect(() => {
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  return () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };
}, []);
```

Effect 2 unconditionally sets `overflow: hidden` on mount and clears it on unmount. Effect 1 tries to toggle it based on modal state. When the modal closes, Effect 1 sets overflow to `""`, but Effect 2's cleanup only runs on unmount. The two effects fight each other and the page scroll behavior is unpredictable.

**Fix:** Remove Effect 2 entirely. The page uses custom scroll containers (`overflow-y-auto` on inner divs), so locking `document` scroll is unnecessary and causes bugs.

---

### 14. `transformPost` timestamp shows minimum "1h" even for brand-new posts

**File:** `client/src/utils/transformPost.ts`

```ts
if (diffHours < 24) {
  return `${Math.max(diffHours, 1)}h`;
}
```

`Math.max(diffHours, 1)` means a post created 30 seconds ago shows "1h". Posts under 1 hour old should show minutes or seconds.

**Fix:**
```ts
const diffMinutes = Math.floor(diffMs / (1000 * 60));
if (diffMinutes < 1) return "just now";
if (diffMinutes < 60) return `${diffMinutes}m`;
if (diffHours < 24) return `${diffHours}h`;
```

---

### 15. `useComments` `handleDeleteComment` has a logic bug with `deletedParentId`

**File:** `client/src/hooks/useComments.ts`

```ts
let deletedParentId: string | null | undefined;
setCommentsByPost((prev) => {
  const list = prev[postId] || [];
  const target = list.find((c) => c.id === commentId);
  deletedParentId = target?.parentId;  // set inside setState callback
  // ...
});
setRepliesByComment((prev) => {
  // ...
  // also tries to set deletedParentId here
});
```

`deletedParentId` is set inside a `setState` callback. React state updater functions can be called asynchronously and may be called multiple times in strict mode. Reading a closure variable that was set inside a state updater in a subsequent state updater is a race condition — `deletedParentId` may be `undefined` when the second `setRepliesByComment` runs.

**Fix:** Determine `deletedParentId` before calling any `setState`, by looking it up from the current state snapshot directly.

---

### 16. `blocksAPI.list` has overly complex normalization for a response that should have a stable shape

**File:** `client/src/services/api.ts`

The `blocksAPI.list` function has ~40 lines of defensive normalization code to handle multiple possible response shapes. This suggests the server API response format is inconsistent or was changed without updating the client. The server should return a stable `{ blocked: BlockedUser[], total, limit, offset }` shape always.

**Fix:** Audit the blocks endpoint response and standardize it. Remove the client-side normalization once the server is consistent.

---

### 17. `getTimeline` in `user.service.ts` runs two separate DB queries (posts + count) that can return inconsistent results

**File:** `server/src/modules/user/user.service.ts`

```ts
const posts = await prisma.post.findMany({ ... take: limit, skip: offset });
const total = await prisma.post.count({ where: ... });
```

Between the `findMany` and `count` calls, another user could create or delete a post. The `total` returned may not match the actual number of posts fetched, causing pagination to skip or repeat items.

**Fix:** Use a Prisma transaction or use `$transaction([findMany, count])` to run both queries atomically.

---

### 18. `searchUsers` in `user.service.ts` runs two separate DB queries with the same race condition

**File:** `server/src/modules/user/user.service.ts`

Same issue as #17 — `findMany` and `count` are separate queries. Use `prisma.$transaction`.

---

### 19. `notification.service.ts` cache invalidation uses wrong key pattern

**File:** `server/src/modules/notifications/notification.service.ts`

```ts
await cacheDel([
  `notification:${notificationId}`,
  `notifications:user:${ownerId}`,
]);
```

But the cache keys are built with `buildCacheKey("notifications", ownerId, ...)` which produces keys like `notifications:userId:all:20:0`. The `cacheDel` call uses `notifications:user:${ownerId}` which will never match any actual key. Notification cache is never properly invalidated after mark-read or delete.

**Fix:** Use `invalidatePattern(`notifications:${ownerId}*`)` instead of `cacheDel` with a hardcoded non-matching key.

---

### 20. `Post` model has `deletedAt` field (soft delete) but queries never filter it out

**File:** `server/prisma/schema.prisma`, `server/src/modules/posts/posts.service.ts`

```prisma
deletedAt DateTime? @map("deleted_at")
```

The schema has `deletedAt` on `Post`, `Comment`, `Like`, `CommentLike`, and `User`, suggesting soft deletes were planned. But `deletePost` uses `prisma.post.delete` (hard delete), and all `findMany` queries never add `deletedAt: null` to the where clause. The soft delete fields are dead weight — either implement them consistently or remove them.

---

### 21. `getProfile` in `user.service.ts` exposes email in public profile

**File:** `server/src/modules/user/user.service.ts`

```ts
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    username: true,
    email: true,  // <-- exposed publicly
    firstName: true,
    lastName: true,
    createdAt: true,
    plan: true,
  },
});
```

`GET /users/:userId` is a public endpoint (no `authenticate` middleware). Any unauthenticated request can enumerate user emails by ID. Email is PII and should not be in the public profile response.

**Fix:** Remove `email` from the public profile select. Keep it only in `/users/me`.

---

## LOW

---

### 22. `billing.service.ts` has excessive `console.log` debug output in production code

**File:** `server/src/modules/billing/billing.service.ts`

The `createCheckoutSession` and `confirmPayment` functions have dozens of `console.log` statements including full Stripe session objects. This pollutes production logs, can expose sensitive payment metadata, and makes log monitoring harder.

**Fix:** Replace with structured logging at appropriate levels, or guard with `if (process.env.NODE_ENV !== 'production')`.

---

### 23. `getRecentSessions` debug endpoint is exposed in production

**File:** `server/src/modules/billing/billing.service.ts`

```ts
export const getRecentSessions = async (userId: unknown) => {
  // Returns recent Stripe checkout sessions for a user
```

If this is wired to a route, it exposes Stripe session data to authenticated users. Even if auth-gated, this is a debug endpoint that should not exist in production.

**Fix:** Remove or gate behind an admin role check.

---

### 24. `Feed.tsx` uses `key={post.id}-${index}` which defeats React's reconciliation

**File:** `client/src/components/Feed.tsx`

```tsx
<div key={`${post.id}-${index}`}>
```

Adding `index` to the key means if a post is inserted at the top of the feed (e.g., after creating a new post), every existing post gets a new key and React re-mounts all of them instead of just inserting the new one. This causes unnecessary DOM destruction and re-creation.

**Fix:** Use `key={post.id}` only.

---

### 25. `PostCard` double-updates like state — both locally and via parent

**File:** `client/src/components/PostCard.tsx`

```ts
const handleLike = useCallback(async () => {
  setIsLiked(!isLiked);         // local optimistic update
  setLikeCount(...);             // local optimistic update
  if (onLike) await onLike(id); // parent also updates its state
}, [...]);
```

**File:** `client/src/pages/HomePage.tsx`

```ts
// onLike handler also updates state:
updatePostsById((p) => ({ ...p, liked: true, likes: p.likes + 1 }));
```

And `PostCard` also has:
```ts
useEffect(() => {
  setIsLiked(liked);
  setLikeCount(likes);
}, [liked, likes]);
```

The flow is: PostCard updates local state → calls parent → parent updates its state → prop changes → useEffect in PostCard syncs again. This causes a double render and the like count briefly flickers. The optimistic update in PostCard is redundant since the parent already does it.

**Fix:** Either do optimistic updates only in the parent and pass down the result, or do them only in PostCard and don't update parent state on success.

---

### 26. `useDraft` hook name collision — `homepage-composer-draft` key is hardcoded

**File:** `client/src/pages/HomePage.tsx`

```ts
const { draft: composerText, ... } = useDraft("homepage-composer-draft");
```

If the user opens the app in two tabs, both tabs share the same localStorage draft key. Typing in one tab will overwrite the draft in the other tab on next load. This is a minor UX issue but worth noting.

---

### 27. `prisma.config.js` at server root — unclear purpose

**File:** `server/prisma.config.js`

This file exists at the server root but Prisma's config is in `prisma/schema.prisma`. If this is a custom config file for a non-standard Prisma setup, it should be documented. If it's unused, it should be removed to avoid confusion.

---

## SUMMARY TABLE

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | Critical | DB | Prisma schema missing `url` in datasource |
| 2 | Critical | API | `getForYouFeed` returns `[]` when no 2nd-degree connections |
| 3 | Critical | API | `getForYouFeed` returns `[]` for new users with no follows |
| 4 | Critical | DB | Denormalized like/comment counters can drift |
| 5 | Critical | Auth | Refresh token DB expiry hardcoded to 30 days, ignores env var |
| 6 | High | API | `updateUserProfile` ownership check is dead code |
| 7 | High | API | `unfollowUser` client sends semantically wrong URL |
| 8 | High | Auth | Token refresh can cause infinite redirect loop |
| 9 | High | Cache | `KEYS` command blocks Redis in production |
| 10 | High | API | Feed controllers swallow non-500 errors |
| 11 | High | DB | `Post.content` allows empty string at DB level |
| 12 | High | API | Edit blocked for downgraded users with long existing posts |
| 13 | Medium | UI | Two conflicting `overflow: hidden` effects on HomePage |
| 14 | Medium | UI | New posts always show "1h" instead of minutes/seconds |
| 15 | Medium | UI | `handleDeleteComment` race condition with `deletedParentId` |
| 16 | Medium | API | `blocksAPI.list` has fragile multi-shape normalization |
| 17 | Medium | DB | Timeline queries have TOCTOU race between findMany and count |
| 18 | Medium | DB | Search queries have same TOCTOU race |
| 19 | Medium | Cache | Notification cache invalidation uses wrong key pattern |
| 20 | Medium | DB | Soft delete fields exist but are never used |
| 21 | Medium | Security | Public profile endpoint exposes user email |
| 22 | Low | Ops | Excessive debug logging in billing service |
| 23 | Low | Security | Debug endpoint `getRecentSessions` may be exposed |
| 24 | Low | UI | Feed uses `post.id + index` as key, defeats reconciliation |
| 25 | Low | UI | PostCard double-updates like state causing flicker |
| 26 | Low | UX | Draft key collision across browser tabs |
| 27 | Low | Config | `prisma.config.js` at server root is unexplained |
