## Authentication Endpoints

```
POST   /api/v1/auth/register     # Create new user account
POST   /api/v1/auth/login        # Authenticate user and get tokens
POST   /api/v1/auth/logout       # Invalidate user session
POST   /api/v1/auth/refresh      # Refresh access token using refresh token
```

## User Endpoints

```
GET    /api/v1/users/:userId                                # Fetch user profile by ID
PATCH  /api/v1/users/me                                     # Update current user's profile
```

## Post Endpoints

```
POST   /api/v1/posts                                    # Create new post
GET    /api/v1/posts/feed?limit=20&offset=0             # Get feed posts from followed users
GET    /api/v1/posts/:postId                            # Fetch single post by ID
GET    /api/v1/users/:userId/posts?limit=20&offset=0    # Get all posts by specific user
PATCH  /api/v1/posts/:postId                            # Update post content
DELETE /api/v1/posts/:postId                            # Delete post
```

## Like Endpoints

```
POST   /api/v1/posts/:postId/likes                      # Like a post
DELETE /api/v1/posts/:postId/likes/:likeId              # Remove like from post
GET    /api/v1/posts/:postId/likes?limit=20&offset=0    # Get list of users who liked the post
```

## Comment Endpoints

```
POST   /api/v1/posts/:postId/comments                   # Create comment on post
GET    /api/v1/posts/:postId/comments?limit=20&offset=0 # Get all comments on post
GET    /api/v1/posts/:postId/comments/:commentId        # Fetch single comment by ID
PATCH  /api/v1/posts/:postId/comments/:commentId        # Update comment content
DELETE /api/v1/posts/:postId/comments/:commentId        # Delete comment
```

## Follow Endpoints

```
POST   /api/v1/users/:userId/followers                      # Follow a user
DELETE /api/v1/users/:userId/followers/:followerId          # Unfollow a user
GET    /api/v1/users/:userId/followers?limit=20&offset=0    # Get list of user's followers
GET    /api/v1/users/:userId/following?limit=20&offset=0    # Get list of users that user is following
```

## Notification Endpoints

```
GET    /api/v1/notifications?limit=20&offset=0&read=false # Get user's notifications
GET    /api/v1/notifications/:notificationId              # Fetch single notification by ID
PATCH  /api/v1/notifications/:notificationId              # Mark notification as read/update status
DELETE /api/v1/notifications/:notificationId              # Delete notification
```
