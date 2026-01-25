## Authentication Endpoints

```
POST   /auth/v1/register        # Register new user
POST   /auth/v1/login           # Login user
POST   /auth/v1/logout          # Logout user
```

## User Endpoints

```
GET    /users/v1/:userId        # Get user profile
PATCH  /users/v1/me             # Update own profile
```

## Post Endpoints

```
POST   /posts/v1                # Create new post
GET    /posts/v1/feed           # NewsFeed (more specifically DOOM SCROLLING page)
GET    /posts/v1/:userId/posts  # Get user's uploaded all posts (self or, other users)
GET    /posts/v1/:postId        # Get single post by ID
PATCH  /posts/v1/:postId        # Update own post
DELETE /posts/v1/:postId        # Delete own post
```

## Like Endpoints

```
POST   /likes/v1/post/:postId               # Like a post
DELETE /likes/v1/post/:postId               # Unlike a post
GET    /likes/v1/:likeId                    # Get single like by ID
```

## Comment Endpoints

```
POST   /comments/v1/:postId             # Create comment on post
GET    /comments/v1/post/:postId        # Get comments for post
GET    /comments/v1/:commentId          # Get single comment by ID
PATCH  /comments/v1/:commentId          # Update own comment
DELETE /comments/v1/:commentId          # Delete own comment
```

## Follow/Follower Endpoints

```
POST   /followers/v1/:userId            # Follow a user
GET    /followers/v1/:userId            # Get user's followers
DELETE /followers/v1/:userId            # Unfollow a user
GET    /following/v1/:userId            # Get user's following
```

## Notification Endpoints

```
GET    /notifications/v1/:userId          # Get user's notifications
GET    /notifications/v1/:notificationId  # Get single notification by ID
PATCH  /notifications/v1/:notificationId  # Mark notification as read
```
