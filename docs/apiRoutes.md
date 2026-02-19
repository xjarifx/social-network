

---

## **1. Auth Module**

**Endpoints:**

| Method | Endpoint       | Description                                |
| ------ | -------------- | ------------------------------------------ |
| POST   | /auth/register | Create a new user account                  |
| POST   | /auth/login    | Authenticate user and receive access token |
| POST   | /auth/logout   | Revoke current access token                |
| POST   | /auth/refresh  | Refresh access token using refresh token   |

---

## **2. Users Module**

**Endpoints:**

| Method | Endpoint                 | Description                                                     |
| ------ | ------------------------ | --------------------------------------------------------------- |
| GET    | /users/me                | Get current user's profile                                      |
| PATCH  | /users/me                | Update current user's profile                                   |
| GET    | /users/search            | Search users (`?username=&name=`)                               |
| GET    | /users/:userId           | Get a specific user's profile                                   |
| GET    | /users/:userId/posts     | Get a user's posts/timeline (supports `?cursor=&limit=`)        |
| GET    | /users/:userId/followers | Get list of followers (supports `?cursor=&limit=`)              |
| GET    | /users/:userId/following | Get list of users the user follows (supports `?cursor=&limit=`) |

**Nested Routes:**

* Follow: `/users/:userId/follow` (see Follows Module)

---

## **3. Follows Module**

| Method | Endpoint                           | Description                                              |
| ------ | ---------------------------------- | -------------------------------------------------------- |
| POST   | /users/:userId/follow/             | Follow a user                                            |
| DELETE | /users/:userId/follow/:followingId | Unfollow a user                                          |
| GET    | /users/:userId/followers           | List followers (supports `?cursor=&limit=`)              |
| GET    | /users/:userId/following           | List users the user follows (supports `?cursor=&limit=`) |

---

## **4. Blocks Module**

| Method | Endpoint        | Description                                     |
| ------ | --------------- | ----------------------------------------------- |
| POST   | /blocks/:userId | Block a user                                    |
| GET    | /blocks/        | List blocked users (supports `?cursor=&limit=`) |
| DELETE | /blocks/:userId | Unblock a user                                  |

---

## **5. Posts Module**

| Method | Endpoint       | Description                                                     |
| ------ | -------------- | --------------------------------------------------------------- |
| POST   | /posts/        | Create a new post (supports image/video upload)                 |
| GET    | /posts/feed    | Get posts feed from followed users (supports `?cursor=&limit=`) |
| GET    | /posts/for-you | Get personalized "For You" feed (supports `?cursor=&limit=`)    |
| GET    | /posts/        | Get all posts (general feed) (supports `?cursor=&limit=`)       |
| GET    | /posts/:postId | Get a specific post                                             |
| PATCH  | /posts/:postId | Update a post                                                   |
| DELETE | /posts/:postId | Delete a post                                                   |

**Nested Routes:**

* Likes: `/posts/:postId/likes`
* Comments: `/posts/:postId/comments`

---

## **6. Comments Module**

| Method | Endpoint                                 | Description                                                |
| ------ | ---------------------------------------- | ---------------------------------------------------------- |
| POST   | /posts/:postId/comments/                 | Create a new comment                                       |
| GET    | /posts/:postId/comments/                 | Get all comments (supports `?cursor=&limit=`)              |
| PATCH  | /posts/:postId/comments/:commentId       | Update a comment                                           |
| DELETE | /posts/:postId/comments/:commentId       | Delete a comment                                           |
| POST   | /posts/:postId/comments/:commentId/likes | Like a comment                                             |
| DELETE | /posts/:postId/comments/:commentId/likes | Unlike a comment                                           |
| GET    | /posts/:postId/comments/:commentId/likes | Get users who liked a comment (supports `?cursor=&limit=`) |

---

## **7. Likes Module**

| Method | Endpoint             | Description                                             |
| ------ | -------------------- | ------------------------------------------------------- |
| POST   | /posts/:postId/likes | Like a post                                             |
| DELETE | /posts/:postId/likes | Unlike a post                                           |
| GET    | /posts/:postId/likes | Get users who liked a post (supports `?cursor=&limit=`) |

---

## **8. Notifications Module**

| Method | Endpoint                       | Description                                                         |
| ------ | ------------------------------ | ------------------------------------------------------------------- |
| GET    | /notifications/                | Get all notifications for current user (supports `?cursor=&limit=`) |
| GET    | /notifications/:notificationId | Get a specific notification                                         |
| PATCH  | /notifications/:notificationId | Update notification (e.g., mark as read)                            |
| DELETE | /notifications/:notificationId | Delete a notification                                               |
| PATCH  | /notifications/mark-read       | Bulk mark notifications as read                                     |

---

## **9. Billing Module**

| Method | Endpoint                                | Description                                          |
| ------ | --------------------------------------- | ---------------------------------------------------- |
| GET    | /billing/webhook-health                 | Check Stripe webhook endpoint status                 |
| POST   | /billing/create-checkout-session        | Create Stripe checkout session for subscription      |
| POST   | /billing/create-payment-intent          | Create payment intent for one-time payment           |
| GET    | /billing/me                             | Get current user's billing status/subscription info  |
| GET    | /billing/payment-confirmation           | Confirm payment after checkout redirect              |
| POST   | /billing/webhook                        | Stripe webhook handler (signature verification only) |
| GET    | /billing/debug/recent-checkout-sessions | Debug endpoint for recent sessions                   |

---

