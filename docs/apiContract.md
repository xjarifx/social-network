# API Contract (Derived from Current Codebase)

## Base URL

- Base path configured in server: `api/v1` (see routing setup). Prefix all paths below with `/` when calling the server.

## Auth

- **Access token**: `Authorization: Bearer <jwt>`
- **Refresh token**: provided in auth responses; used in `/auth/refresh` and `/auth/logout` request bodies.

## Standard Error Shape

- General errors: `{ "error": "message" }`
- Validation errors (Zod flatten): `{ "error": { "fieldErrors": { ... }, "formErrors": [...] } }`

---

## Authentication

### POST /api/v1/auth/register

**Auth:** None

**Request Body**

```json
{
  "username": "string (2-30)",
  "email": "string (email)",
  "password": "string (min 8, 1 upper, 1 lower, 1 number, 1 special)",
  "firstName": "string (1-50)",
  "lastName": "string (1-50)"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "datetime",
  "token": "jwt",
  "refreshToken": "jwt"
}
```

**Errors**

- 409 `Email already in use`
- 409 `Username already in use`

---

### POST /api/v1/auth/login

**Auth:** None

**Request Body**

```json
{
  "email": "string (email)",
  "password": "string"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "datetime",
  "token": "jwt",
  "refreshToken": "jwt"
}
```

**Errors**

- 401 `Invalid email or password`

---

### POST /api/v1/auth/logout

**Auth:** None

**Request Body**

```json
{
  "refreshToken": "jwt"
}
```

**Response 200**

```json
{ "message": "Logged out successfully" }
```

**Errors**

- 400 `Refresh token is required`
- 401 `Invalid refresh token`
- 400 `Token already revoked`

---

### POST /api/v1/auth/refresh

**Auth:** None

**Request Body**

```json
{
  "refreshToken": "jwt"
}
```

**Response 200**

```json
{
  "token": "jwt",
  "refreshToken": "jwt"
}
```

**Errors**

- 400 `Refresh token is required`
- 401 `Invalid refresh token`
- 401 `Refresh token has been revoked`
- 401 `Refresh token has expired`

---

## Users

### GET /api/v1/users/:userId

**Auth:** None

**Path Params**

- `userId`: uuid

**Response 200**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 404 `User not found`

---

### PATCH /api/v1/users/me

**Auth:** Bearer

**Request Body** (at least one field)

```json
{
  "firstName": "string (1-50)",
  "lastName": "string (1-50)"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 403 `Cannot update other user's profile`
- 404 `User not found`

---

### Routes wired to follower router

The following user routes delegate to the followers router:

- `POST /api/v1/users/:userId/followers`
- `DELETE /api/v1/users/:userId/followers`
- `GET /api/v1/users/:userId/followers`
- `GET /api/v1/users/:userId/following`

See **Followers** section for behavior. The `:userId` param is not used by the handlers; the authenticated user is used instead.

---

## Posts

### POST /api/v1/posts

**Auth:** Bearer

**Request Body**

```json
{
  "content": "string (1-5000)"
}
```

**Response 201**

```json
{
  "id": "uuid",
  "content": "string",
  "author": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Errors**

- 400 validation errors

---

### GET /api/v1/posts/:postId

**Auth:** None

**Path Params**

- `postId`: uuid

**Response 200**

```json
{
  "id": "uuid",
  "content": "string",
  "author": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "likesCount": 0,
  "commentsCount": 0,
  "likes": ["uuid"],
  "comments": [
    {
      "id": "uuid",
      "content": "string",
      "author": {
        "id": "uuid",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "createdAt": "datetime"
    }
  ],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 404 `Post not found`

---

### PATCH /api/v1/posts/:postId

**Auth:** Bearer

**Request Body**

```json
{
  "content": "string (1-5000)"
}
```

**Response 200**

```json
{
  "id": "uuid",
  "content": "string",
  "author": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "likesCount": 0,
  "commentsCount": 0,
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 403 `Cannot update other user's post`
- 404 `Post not found`

---

### DELETE /api/v1/posts/:postId

**Auth:** Bearer

**Response 200**

```json
{ "message": "Post deleted successfully" }
```

**Errors**

- 400 validation errors
- 403 `Cannot delete other user's post`
- 404 `Post not found`

---

### GET /api/v1/posts/feed

**Auth:** Bearer
**Note:** Route is registered without a handler in the current code. Behavior is unspecified.

---

### GET /api/v1/posts

**Auth:** Bearer
**Note:** Route is registered without a handler in the current code. Behavior is unspecified.

---

## Comments

All comment routes are nested under posts.

### POST /api/v1/posts/:postId/comments

**Auth:** Bearer

**Request Body**

```json
{ "content": "string (1-2000)" }
```

**Response 201**

```json
{
  "id": "uuid",
  "content": "string",
  "author": {
    "id": "uuid",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "postId": "uuid",
  "createdAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 404 `Post not found`

---

### GET /api/v1/posts/:postId/comments

**Auth:** None

**Query Params**

- `limit` (number, default 10)
- `offset` (number, default 0)

**Response 200**

```json
{
  "comments": [
    {
      "id": "uuid",
      "content": "string",
      "author": {
        "id": "uuid",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "postId": "uuid",
      "createdAt": "datetime"
    }
  ],
  "total": 0,
  "limit": 10,
  "offset": 0
}
```

**Errors**

- 400 validation errors
- 404 `Post not found`

---

### GET /api/v1/posts/:postId/comments/:commentId

**Auth:** None

**Response 200**
Same shape as list item above.

**Errors**

- 400 validation errors
- 404 `Comment not found`

---

### PATCH /api/v1/posts/:postId/comments/:commentId

**Auth:** Bearer

**Request Body**

```json
{ "content": "string (1-2000)" }
```

**Response 200**

```json
{
  "id": "uuid",
  "content": "string",
  "author": {
    "id": "uuid",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "postId": "uuid",
  "createdAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 403 `Cannot update other user's comment`
- 404 `Comment not found`

---

### DELETE /api/v1/posts/:postId/comments/:commentId

**Auth:** Bearer

**Response 200**

```json
{ "message": "Comment deleted successfully" }
```

**Errors**

- 400 validation errors
- 403 `Cannot delete other user's comment`
- 404 `Comment not found`

---

## Likes

All like routes are nested under posts.

### POST /api/v1/posts/:postId/likes

**Auth:** Bearer

**Response 201**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "postId": "uuid",
  "user": {
    "id": "uuid",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "datetime",
  "message": "Post liked successfully"
}
```

**Errors**

- 400 validation errors
- 404 `Post not found`

---

### DELETE /api/v1/posts/:postId/likes

**Auth:** Bearer

**Response 200**

```json
{ "message": "Post unliked successfully" }
```

**Errors**

- 400 validation errors
- 404 `Post not found`

---

### GET /api/v1/posts/:postId/likes

**Auth:** Bearer
**Note:** This route is wired to the unlike handler in code. Behavior is unspecified.

---

## Followers

These routes are mounted under `/api/v1/users/:userId/followers` and `/api/v1/users/:userId/following`.

### POST /api/v1/users/:userId/followers

**Auth:** Bearer

**Request Body**

```json
{ "followingId": "uuid" }
```

**Response 201**

```json
{
  "id": "uuid",
  "followerId": "uuid",
  "followingId": "uuid",
  "createdAt": "datetime"
}
```

**Errors**

- 400 validation errors
- 404 `User not found`
- 409 `Already following this user`

---

### DELETE /api/v1/users/:userId/followers

**Auth:** Bearer

**Path Params**

- `followingId`: uuid (from route params in handler)

**Response 204**
No content

**Errors**

- 400 validation errors
- 403 `Not allowed to modify this follow relationship`
- 404 `Follow relationship not found`

---

### GET /api/v1/users/:userId/followers

**Auth:** Bearer

**Response 200**

```json
[
  {
    "id": "uuid",
    "followedAt": "datetime",
    "follower": {
      "id": "uuid",
      "username": "string",
      "firstName": "string",
      "lastName": "string"
    }
  }
]
```

---

### GET /api/v1/users/:userId/following

**Auth:** Bearer

**Response 200**

```json
[
  {
    "id": "uuid",
    "followedAt": "datetime",
    "user": {
      "id": "uuid",
      "username": "string",
      "firstName": "string",
      "lastName": "string"
    }
  }
]
```

---

## Notifications

### GET /api/v1/notifications

**Auth:** Bearer

**Query Params**

- `limit` (int, default 10)
- `offset` (int, default 0)
- `read` (boolean, optional)

**Response 200**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "LIKE | COMMENT | NEW_FOLLOWER",
      "message": "string",
      "read": false,
      "createdAt": "datetime",
      "relatedUser": {
        "id": "uuid",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "relatedPost": {
        "id": "uuid",
        "content": "string"
      }
    }
  ],
  "total": 0,
  "limit": 10,
  "offset": 0
}
```

**Errors**

- 400 validation errors
- 401 `Unauthorized`

---

### GET /api/v1/notifications/:notificationId

**Auth:** Bearer

**Path Params**

- `notificationId`: uuid

**Response 200**

```json
{
  "id": "uuid",
  "type": "LIKE | COMMENT | NEW_FOLLOWER",
  "message": "string",
  "read": false,
  "createdAt": "datetime",
  "relatedUser": {
    "id": "uuid",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "relatedPost": {
    "id": "uuid",
    "content": "string"
  }
}
```

**Errors**

- 400 validation errors
- 401 `Unauthorized`
- 404 `Notification not found`

---

### PATCH /api/v1/notifications/:notificationId

**Auth:** Bearer

**Request Body**

```json
{ "read": true }
```

**Response 200**
Same shape as GET notification.

**Errors**

- 400 validation errors
- 401 `Unauthorized`
- 404 `Notification not found`

---

### DELETE /api/v1/notifications/:notificationId

**Auth:** Bearer

**Response 204**
No content

**Errors**

- 400 validation errors
- 401 `Unauthorized`
- 404 `Notification not found`

---

## Notes on Current Routing

- Base routes are registered as `api/v1/...` in server setup. Paths in this document use `/api/v1/...` for typical HTTP clients.
- `GET /api/v1/posts/feed` and `GET /api/v1/posts` are registered without handlers.
- `GET /api/v1/posts/:postId/likes` is wired to the unlike handler in code.
- Followers routes include a `:userId` param but handlers use the authenticated user id instead.
