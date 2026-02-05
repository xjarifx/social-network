# API Integration Guide

This document explains how the frontend connects to the backend API and provides quick start instructions.

## 🔄 Architecture Overview

```
Frontend (React + TypeScript)
    ↓
Router (react-router-dom)
    ↓ (Auth Protected)
Home Page / Auth Pages
    ↓
Components (UI Layer)
    ↓
Hooks (State Management)
    ↓
API Service Layer (api.ts)
    ↓
Backend API (Express.js)
```

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in the `/client` directory:

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```
API_URL=http://localhost:3000/api/v1
```

### 2. Start Backend Server

```bash
cd server
npm install
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Start Frontend Client

In a new terminal:

```bash
cd client
npm install --legacy-peer-deps
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📡 API Service Layer

The API service (`src/services/api.ts`) provides type-safe methods for all backend endpoints:

### Authentication

```typescript
import { authAPI, setTokens } from "@/services/api";

// Register new user
const response = await authAPI.register({
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
});
setTokens(response.accessToken, response.refreshToken);

// Login
const response = await authAPI.login({
  email: "john@example.com",
  password: "SecurePass123!",
});
setTokens(response.accessToken, response.refreshToken);

// Logout
await authAPI.logout();
```

### Posts

```typescript
import { postsAPI } from "@/services/api";

// Create post
const post = await postsAPI.create("Hello World!");

// Get feed
const posts = await postsAPI.getFeed(20, 0); // limit 20, offset 0

// Get single post
const post = await postsAPI.getPost(postId);

// Update post
const updated = await postsAPI.updatePost(postId, "Updated content");

// Delete post
await postsAPI.deletePost(postId);
```

### Users

```typescript
import { usersAPI } from "@/services/api";

// Get current user profile
const user = await usersAPI.getCurrentProfile();

// Get user profile by ID
const user = await usersAPI.getProfile(userId);

// Update profile
const updated = await usersAPI.updateProfile({
  firstName: "Jane",
  lastName: "Doe",
});

// Get user timeline/posts
const posts = await usersAPI.getTimeline(userId);
```

### Likes

```typescript
import { likesAPI } from "@/services/api";

// Like a post
const like = await likesAPI.likePost(postId);

// Unlike a post
await likesAPI.unlikePost(likeId);

// Get post likes
const likes = await likesAPI.getPostLikes(postId);
```

### Comments

```typescript
import { commentsAPI } from "@/services/api";

// Create comment
const comment = await commentsAPI.createComment(postId, "Great post!");

// Get post comments
const comments = await commentsAPI.getPostComments(postId);

// Update comment
const updated = await commentsAPI.updateComment(
  postId,
  commentId,
  "Updated comment",
);

// Delete comment
await commentsAPI.deleteComment(postId, commentId);
```

### Follows

```typescript
import { followsAPI } from "@/services/api";

// Follow user
const follower = await followsAPI.followUser(followingId);

// Unfollow user
await followsAPI.unfollowUser(followingId);

// Get user followers
const followers = await followsAPI.getUserFollowers(userId);

// Get user following
const following = await followsAPI.getUserFollowing(userId);
```

## 🔐 Authentication Context

The `AuthContext` manages user authentication state globally:

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuth();

  // Use auth state and methods
  if (isLoading) return <Loader />;

  if (!isAuthenticated) return <LoginPage />;

  return <Dashboard user={user} />;
}
```

### Auth Context Properties

- **user** (User | null) - Current authenticated user
- **isLoading** (boolean) - Whether auth is being verified
- **isAuthenticated** (boolean) - Whether user is logged in
- **error** (string | null) - Auth error message
- **login** (email, password) - Login user
- **register** (data) - Register new user
- **logout** () - Logout user
- **clearError** () - Clear error message

## 🛡️ Protected Routes

Pages requiring authentication use `ProtectedRoute`:

```typescript
import { ProtectedRoute } from '@/components';
import { HomePage } from '@/pages/HomePage';

<Route
  path="/"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
```

Unauthenticated users are redirected to `/login`.

## 🎯 Example: Creating a Post

Here's a complete example of creating and displaying a post:

```typescript
import { postsAPI } from '@/services/api';
import { useState } from 'react';

function CreatePost() {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const post = await postsAPI.create(content);
      console.log('Post created:', post);
      setContent('');
      // Refresh feed
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <button disabled={isLoading}>
        {isLoading ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
```

## 🔄 Token Management

Tokens are automatically managed:

```typescript
import { getAccessToken, setTokens, clearTokens } from "@/services/api";

// Get current access token
const token = getAccessToken();

// Set new tokens
setTokens(accessToken, refreshToken);

// Clear tokens (logout)
clearTokens();
```

### Token Refresh Flow

When a request gets a 401 response:

1. The API service attempts to refresh the token
2. If successful, retries the original request with new token
3. If failed, redirects to login page

## 📝 Error Handling

API errors are thrown and should be caught:

```typescript
try {
  await postsAPI.create("");
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("API Error:", message);
}
```

Common error messages:

- 400: Invalid request (missing/invalid fields)
- 401: Unauthorized (token expired)
- 403: Forbidden (not allowed)
- 404: Not found (resource doesn't exist)
- 429: Too many requests (rate limited)
- 500: Server error

## 🧪 Testing API Integration

### Using Postman

1. Import the Postman collection from `postman/collections/social-network-api.postman_collection.json`
2. Set environment variables in Postman
3. Test endpoints manually

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"SecurePass123!","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Create post (with auth token)
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"Hello world!"}'
```

## 🔍 Debugging

### Enable API Logging

Add to `src/services/api.ts`:

```typescript
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  console.log("→ API Request:", options.method || "GET", endpoint);
  // ... rest of function
  console.log("← API Response:", response.status, response);
  // ...
}
```

### Check Network Tab

In browser DevTools:

1. Open Network tab
2. Filter by XHR/Fetch
3. Click requests to see headers, body, response

### Check Auth Context

```typescript
const { user, isAuthenticated, error } = useAuth();
console.log("Auth State:", { user, isAuthenticated, error });
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

Set environment variables in deployment settings:

```
API_URL=https://your-backend-api.com/api/v1
```

### Backend Deployment (Railway/Heroku)

Ensure CORS is configured correctly in server:

```typescript
app.use(
  cors({
    origin: "https://your-frontend.vercel.app",
    credentials: true,
  }),
);
```

## 📚 Additional Resources

- [React Router Docs](https://reactrouter.com/)
- [API Service Implementation](./src/services/api.ts)
- [Auth Context](./src/context/AuthContext.tsx)
- [Backend API Endpoints](../server/docs/apiEndpoints.md)

---

**For questions or issues, check the browser console and network tab for error details.**
