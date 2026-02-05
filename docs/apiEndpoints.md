## Authentication Endpoints

```
POST   /api/v1/auth/register     # Create new user account
POST   /api/v1/auth/login        # Authenticate user and get tokens
POST   /api/v1/auth/logout       # Invalidate user session (requires authentication)
POST   /api/v1/auth/refresh      # Refresh access token using refresh token (requires authentication)
```

## User Endpoints

```
GET    /api/v1/users/:userId     # Fetch user profile by ID
PATCH  /api/v1/users/me          # Update current user's profile (requires authentication)
```

## Post Endpoints

```
POST   /api/v1/posts                          # Create new post (requires authentication)
GET    /api/v1/posts                          # Get all posts/timeline (requires authentication)
GET    /api/v1/posts/feed                     # Get news feed (requires authentication)
GET    /api/v1/posts/:postId                  # Fetch single post by ID
PATCH  /api/v1/posts/:postId                  # Update post content (requires authentication)
DELETE /api/v1/posts/:postId                  # Delete post (requires authentication)
```

## Like Endpoints

```
POST   /api/v1/posts/:postId/likes            # Like a post (requires authentication)
DELETE /api/v1/posts/:postId/likes            # Remove like from post (requires authentication)
GET    /api/v1/posts/:postId/likes            # Get list of users who liked the post (requires authentication)
```

## Comment Endpoints

```
POST   /api/v1/posts/:postId/comments               # Create comment on post (requires authentication)
GET    /api/v1/posts/:postId/comments               # Get all comments on post
GET    /api/v1/posts/:postId/comments/:commentId    # Fetch single comment by ID
PATCH  /api/v1/posts/:postId/comments/:commentId    # Update comment content (requires authentication)
DELETE /api/v1/posts/:postId/comments/:commentId    # Delete comment (requires authentication)
```

## Follow Endpoints

```
POST   /api/v1/users/:userId/follow                 # Follow a user (requires authentication)
DELETE /api/v1/users/:userId/follow/:followingId    # Unfollow a user (requires authentication)
GET    /api/v1/users/:userId/followers              # Get list of user's followers (requires authentication)
GET    /api/v1/users/:userId/following              # Get list of users that user is following (requires authentication)
```

## Notification Endpoints

```
GET    /api/v1/notifications                  # Get user's notifications (requires authentication)
GET    /api/v1/notifications/:notificationId  # Fetch single notification by ID (requires authentication)
PATCH  /api/v1/notifications/:notificationId  # Mark notification as read/update status (requires authentication)
DELETE /api/v1/notifications/:notificationId  # Delete notification (requires authentication)
```

## Block Endpoints

```
POST   /api/v1/blocks                         # Block a user (requires authentication)
GET    /api/v1/blocks                         # Get list of blocked users (requires authentication)
DELETE /api/v1/blocks/:userId                 # Unblock a user (requires authentication)
```

## Billing Endpoints

```
POST   /api/v1/billing/checkout-session       # Create subscription checkout session (requires authentication)
GET    /api/v1/billing/me                     # Get billing status (requires authentication)
POST   /api/v1/billing/webhook                # Stripe webhook
GET    /api/v1/billing/success                # Billing success callback (requires authentication)
GET    /api/v1/billing/cancel                 # Billing cancel callback (requires authentication)
```