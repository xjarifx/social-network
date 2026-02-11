# API Routes

## Auth Routes

**Base Path:** `/api/auth`

| Method | Endpoint  | Description                                |
| ------ | --------- | ------------------------------------------ |
| POST   | /register | Create a new user account                  |
| POST   | /login    | Authenticate user and receive access token |
| POST   | /logout   | Invalidate current session                 |
| POST   | /refresh  | Refresh access token using refresh token   |

## Billing Routes

**Base Path:** `/api/billing`

| Method | Endpoint                 | Description                                             |
| ------ | ------------------------ | ------------------------------------------------------- |
| GET    | /webhook-health          | Check webhook endpoint status                           |
| POST   | /create-checkout-session | Create Stripe checkout session for subscription         |
| POST   | /create-payment-intent   | Create payment intent for one-time payment              |
| GET    | /me                      | Get current user's billing status and subscription info |
| GET    | /confirm                 | Confirm payment after checkout redirect                 |
| GET    | /debug/recent-sessions   | Debug endpoint to view recent checkout sessions         |
| POST   | /webhook                 | Stripe webhook handler for payment events               |

## Blocks Routes

**Base Path:** `/api/blocks`

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| POST   | /        | Block a user              |
| GET    | /        | Get list of blocked users |
| DELETE | /:userId | Unblock a user            |

## Comments Routes

**Base Path:** `/api/posts/:postId/comments`

| Method | Endpoint          | Description                    |
| ------ | ----------------- | ------------------------------ |
| POST   | /                 | Create a new comment on a post |
| GET    | /                 | Get all comments for a post    |
| GET    | /:commentId       | Get a specific comment         |
| PATCH  | /:commentId       | Update a comment               |
| DELETE | /:commentId       | Delete a comment               |
| POST   | /:commentId/likes | Like a comment                 |
| DELETE | /:commentId/likes | Unlike a comment               |
| GET    | /:commentId/likes | Get users who liked a comment  |

## Follows Routes

**Base Path:** `/api/users/:userId/follow`

| Method | Endpoint      | Description     |
| ------ | ------------- | --------------- |
| POST   | /             | Follow a user   |
| DELETE | /:followingId | Unfollow a user |

## Likes Routes

**Base Path:** `/api/posts/:postId/likes`

| Method | Endpoint | Description                |
| ------ | -------- | -------------------------- |
| POST   | /        | Like a post                |
| DELETE | /        | Unlike a post              |
| GET    | /        | Get users who liked a post |

## Notifications Routes

**Base Path:** `/api/notifications`

| Method | Endpoint         | Description                            |
| ------ | ---------------- | -------------------------------------- |
| GET    | /                | Get all notifications for current user |
| GET    | /:notificationId | Get a specific notification            |
| PATCH  | /:notificationId | Update notification (mark as read)     |
| DELETE | /:notificationId | Delete a notification                  |

## Posts Routes

**Base Path:** `/api/posts`

| Method | Endpoint | Description                                     |
| ------ | -------- | ----------------------------------------------- |
| POST   | /        | Create a new post (supports image/video upload) |
| GET    | /feed    | Get posts feed from followed users              |
| GET    | /for-you | Get personalized "For You" feed                 |
| GET    | /        | Get all posts (general feed)                    |
| GET    | /:postId | Get a specific post                             |
| PATCH  | /:postId | Update a post                                   |
| DELETE | /:postId | Delete a post                                   |

**Nested Routes:**

- Likes: `/api/posts/:postId/likes` (see Likes Routes)
- Comments: `/api/posts/:postId/comments` (see Comments Routes)

## User Routes

**Base Path:** `/api/users`

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | /me                | Get current user's profile           |
| GET    | /search            | Search for users by username or name |
| GET    | /:userId           | Get a user's profile                 |
| GET    | /:userId/posts     | Get a user's timeline/posts          |
| PATCH  | /me                | Update current user's profile        |
| GET    | /:userId/followers | Get list of user's followers         |
| GET    | /:userId/following | Get list of users that user follows  |

**Nested Routes:**

- Follow: `/api/users/:userId/follow` (see Follows Routes)
