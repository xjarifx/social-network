# Social Media MVP - API Endpoints

## Authentication Endpoints

```
POST   /auth/register           # Register new user
POST   /auth/login              # Login user
POST   /auth/logout             # Logout user
```

## User Endpoints

```
GET    /users/:userId           # Get user profile
GET    /users/:userId/posts     # Get user's posts (timeline)
PATCH  /users/:userId           # Update own profile
```

## Post Endpoints

```
POST   /posts                   # Create new post
GET    /posts/:postId           # Get single post
PATCH  /posts/:postId           # Update own post
DELETE /posts/:postId           # Delete own post
```

## Like Endpoints

```
POST   /posts/:postId/likes     # Like a post
DELETE /posts/:postId/likes     # Unlike a post
```

## Comment Endpoints

```
POST   /posts/:postId/comments  # Create comment on post
GET    /posts/:postId/comments  # Get all comments (limit, offset)
PATCH  /comments/:commentId     # Update own comment
DELETE /comments/:commentId     # Delete own comment
```

## Friend Endpoints

```
POST   /friendships             # Send friend request
GET    /friendships             # Get user's friends
PATCH  /friendships/:friendshipId  # Accept friend request
DELETE /friendships/:friendshipId  # Reject/unfriend
```

## Notification Endpoints

```
GET    /notifications           # Get all notifications (limit, offset)
```
