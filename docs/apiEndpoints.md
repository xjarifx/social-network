### Authentication

```
POST   /api/auth/register                    # Register new user
POST   /api/auth/login                       # Login
POST   /api/auth/logout                      # Logout (invalidate session)
POST   /api/auth/logout-all                  # Logout all sessions
GET    /api/auth/me                          # Get current user
POST   /api/auth/verify-email                # Verify email with token
POST   /api/auth/resend-verification         # Resend verification email
POST   /api/auth/forgot-password             # Request password reset
POST   /api/auth/reset-password              # Reset password with token
GET    /api/auth/sessions                    # List active sessions
DELETE /api/auth/sessions/:sessionId         # Revoke specific session
```

### Users

```
GET    /api/users/:userId                    # Get user profile
PATCH  /api/users/:userId                    # Update own profile
DELETE /api/users/:userId                    # Deactivate account (soft delete)
GET    /api/users/search                     # Search users (q, limit, offset)

# Media uploads
POST   /api/users/:userId/media/profile-picture    # Upload profile pic
POST   /api/users/:userId/media/cover-photo        # Upload cover photo
DELETE /api/users/:userId/media/:mediaId           # Delete media
GET    /api/users/:userId/media                   # List user media (type, limit, offset)

# Preferences
GET    /api/users/:userId/preferences        # Get user preferences
PATCH  /api/users/:userId/preferences        # Update preferences
```

### Friendships

```
POST   /api/friendships                      # Send friend request
GET    /api/friendships                      # Get friends list (status filter)
GET    /api/friendships/requests/sent        # Friend requests sent
GET    /api/friendships/requests/received    # Friend requests received
PATCH  /api/friendships/:friendshipId        # Accept/reject request
DELETE /api/friendships/:friendshipId        # Unfriend
GET    /api/friendships/mutual/:userId       # Get mutual friends with user
GET    /api/friendships/suggestions          # Friend suggestions (optional)
```

### Blocks

```
POST   /api/blocks                           # Block a user
GET    /api/blocks                           # List blocked users
DELETE /api/blocks/:blockId                  # Unblock user
GET    /api/blocks/check/:userId             # Check if user is blocked
```

### Posts

```
POST   /api/posts                            # Create post (with optional media)
GET    /api/posts/:postId                    # Get single post
PATCH  /api/posts/:postId                    # Edit post
DELETE /api/posts/:postId                    # Delete post (soft)
GET    /api/posts/feed                       # Personalized feed (cursor, limit)
GET    /api/users/:userId/posts              # User timeline

# Media for posts
POST   /api/posts/:postId/media              # Add media to post
DELETE /api/posts/:postId/media/:mediaId     # Remove media from post
PATCH  /api/posts/:postId/media/order        # Update post media order

# Moderation
POST   /api/posts/:postId/report             # Report post
```

### Likes

```
POST   /api/posts/:postId/likes              # Like post
DELETE /api/posts/:postId/likes              # Unlike post
GET    /api/posts/:postId/likes              # Get list of users who liked
GET    /api/posts/:postId/likes/check        # Check if current user liked
```

### Comments

```
POST   /api/posts/:postId/comments           # Create comment
GET    /api/posts/:postId/comments           # Get comments (limit, offset)
GET    /api/comments/:commentId              # Get single comment
PATCH  /api/comments/:commentId              # Edit comment
DELETE /api/comments/:commentId              # Delete comment (soft)

# Nested replies
POST   /api/comments/:commentId/replies      # Reply to comment
GET    /api/comments/:commentId/replies      # Get replies

# Moderation
POST   /api/comments/:commentId/report       # Report comment
```

### Notifications

```
GET    /api/notifications                    # Get notifications (is_read filter)
GET    /api/notifications/unread/count       # Count unread notifications
PATCH  /api/notifications/:notificationId    # Mark as read
PATCH  /api/notifications/mark-all-read      # Mark all as read
DELETE /api/notifications/:notificationId    # Delete notification
DELETE /api/notifications/clear-all          # Clear all read notifications
```

### Reports (Admin/Moderation - optional for MVP)

```
GET    /api/reports                          # List all reports (admin)
GET    /api/reports/:reportId                # Get report details
PATCH  /api/reports/:reportId                # Update report status
```

### Activity (Analytics - optional)

```
GET    /api/users/:userId/activity           # User activity log
GET    /api/analytics/daily-active-users     # DAU (admin)
GET    /api/analytics/engagement             # Engagement metrics (admin)
```
