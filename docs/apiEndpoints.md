# Social Media MVP - API Endpoints

## Authentication Endpoints

```
POST   /api/auth/register           # Register new user
POST   /api/auth/login              # Login user
POST   /api/auth/logout             # Logout user
GET    /api/auth/me                 # Get current user
```

## User Endpoints

```
GET    /api/users/:userId          # Get user profile
PATCH  /api/users/:userId          # Update own profile
```

## Post Endpoints

```
POST   /api/posts                   # Create new post
GET    /api/posts/feed              # Get personalized feed (limit, offset)
GET    /api/posts/:postId           # Get single post
DELETE /api/posts/:postId           # Delete own post
GET    /api/users/:userId/posts     # Get user's posts (timeline)
```

## Like Endpoints

```
POST   /api/posts/:postId/likes     # Like a post
DELETE /api/posts/:postId/likes     # Unlike a post
```

## Comment Endpoints

```
POST   /api/posts/:postId/comments  # Create comment on post
GET    /api/posts/:postId/comments  # Get all comments (limit, offset)
DELETE /api/comments/:commentId     # Delete own comment
```

## Friend Endpoints

```
POST   /api/friendships             # Send friend request
GET    /api/friendships             # Get user's friends
PATCH  /api/friendships/:friendshipId  # Accept friend request
DELETE /api/friendships/:friendshipId  # Reject/unfriend
```

## Notification Endpoints

```
GET    /api/notifications           # Get all notifications (limit, offset)
```