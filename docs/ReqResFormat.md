# Social Media MVP - Request/Response Format

## Authentication Endpoints

### POST /api/auth/register

**Request:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

**Response (201):**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "ISO 8601 timestamp",
  "token": "string (JWT)"
}
```

### POST /api/auth/login

**Request:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "token": "string (JWT)"
}
```

### POST /api/auth/logout

**Request:** (empty body, requires auth token)

**Response (200):**

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/auth/me

**Request:** (requires auth token)

**Response (200):**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

---

## User Endpoints

### GET /api/users/:userId

**Request:** (no body)

**Response (200):**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "createdAt": "ISO 8601 timestamp",
  "postsCount": "integer",
  "friendsCount": "integer"
}
```

### PATCH /api/users/:userId

**Request:** (requires auth token, userId must be current user)

```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "password": "string (optional)"
}
```

**Response (200):**

```json
{
  "id": "string (UUID)",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "createdAt": "ISO 8601 timestamp"
}
```

---

## Post Endpoints

### POST /api/posts

**Request:** (requires auth token)

```json
{
  "content": "string (required, 1-5000 chars)"
}
```

**Response (201):**

```json
{
  "id": "string (UUID)",
  "content": "string",
  "authorId": "string (UUID)",
  "author": {
    "id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",
  "likesCount": 0,
  "commentsCount": 0
}
```

### GET /api/posts/feed

**Query Parameters:**

- `limit` (optional): integer, default 20
- `offset` (optional): integer, default 0

**Response (200):**

```json
{
  "posts": [
    {
      "id": "string (UUID)",
      "content": "string",
      "authorId": "string (UUID)",
      "author": {
        "id": "string",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "createdAt": "ISO 8601 timestamp",
      "likesCount": "integer",
      "commentsCount": "integer",
      "liked": "boolean (whether current user liked)"
    }
  ],
  "total": "integer",
  "hasMore": "boolean"
}
```

### GET /api/posts/:postId

**Response (200):**

```json
{
  "id": "string (UUID)",
  "content": "string",
  "authorId": "string (UUID)",
  "author": {
    "id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp",
  "likesCount": "integer",
  "commentsCount": "integer",
  "liked": "boolean"
}
```

### DELETE /api/posts/:postId

**Request:** (requires auth token, user must own post)

**Response (200):**

```json
{
  "message": "Post deleted successfully"
}
```

### GET /api/users/:userId/posts

**Query Parameters:**

- `limit` (optional): integer, default 20
- `offset` (optional): integer, default 0

**Response (200):**

```json
{
  "posts": [
    {
      "id": "string (UUID)",
      "content": "string",
      "authorId": "string (UUID)",
      "createdAt": "ISO 8601 timestamp",
      "likesCount": "integer",
      "commentsCount": "integer",
      "liked": "boolean"
    }
  ],
  "total": "integer",
  "hasMore": "boolean"
}
```

---

## Like Endpoints

### POST /api/posts/:postId/likes

**Request:** (requires auth token, empty body)

**Response (201):**

```json
{
  "id": "string (UUID)",
  "userId": "string (UUID)",
  "postId": "string (UUID)",
  "createdAt": "ISO 8601 timestamp"
}
```

### DELETE /api/posts/:postId/likes

**Request:** (requires auth token)

**Response (200):**

```json
{
  "message": "Like removed successfully"
}
```

---

## Comment Endpoints

### POST /api/posts/:postId/comments

**Request:** (requires auth token)

```json
{
  "content": "string (required, 1-1000 chars)"
}
```

**Response (201):**

```json
{
  "id": "string (UUID)",
  "content": "string",
  "authorId": "string (UUID)",
  "author": {
    "id": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "postId": "string (UUID)",
  "createdAt": "ISO 8601 timestamp"
}
```

### GET /api/posts/:postId/comments

**Query Parameters:**

- `limit` (optional): integer, default 20
- `offset` (optional): integer, default 0

**Response (200):**

```json
{
  "comments": [
    {
      "id": "string (UUID)",
      "content": "string",
      "authorId": "string (UUID)",
      "author": {
        "id": "string",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "postId": "string (UUID)",
      "createdAt": "ISO 8601 timestamp"
    }
  ],
  "total": "integer",
  "hasMore": "boolean"
}
```

### DELETE /api/comments/:commentId

**Request:** (requires auth token, user must own comment)

**Response (200):**

```json
{
  "message": "Comment deleted successfully"
}
```

---

## Friend Endpoints

### POST /api/friendships

**Request:** (requires auth token)

```json
{
  "recipientId": "string (UUID)"
}
```

**Response (201):**

```json
{
  "id": "string (UUID)",
  "senderId": "string (UUID)",
  "recipientId": "string (UUID)",
  "status": "PENDING",
  "createdAt": "ISO 8601 timestamp"
}
```

### GET /api/friendships

**Query Parameters:**

- `limit` (optional): integer, default 20
- `offset` (optional): integer, default 0

**Response (200):**

```json
{
  "friends": [
    {
      "id": "string (UUID)",
      "username": "string",
      "firstName": "string",
      "lastName": "string",
      "friendedAt": "ISO 8601 timestamp"
    }
  ],
  "total": "integer",
  "hasMore": "boolean"
}
```

### PATCH /api/friendships/:friendshipId

**Request:** (requires auth token, user must be recipient)

```json
{
  "status": "ACCEPTED"
}
```

**Response (200):**

```json
{
  "id": "string (UUID)",
  "senderId": "string (UUID)",
  "recipientId": "string (UUID)",
  "status": "ACCEPTED",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

### DELETE /api/friendships/:friendshipId

**Request:** (requires auth token)

**Response (200):**

```json
{
  "message": "Friendship removed successfully"
}
```

---

## Notification Endpoints

### GET /api/notifications

**Query Parameters:**

- `limit` (optional): integer, default 20
- `offset` (optional): integer, default 0

**Response (200):**

```json
{
  "notifications": [
    {
      "id": "string (UUID)",
      "userId": "string (UUID)",
      "type": "string (LIKE | COMMENT | FRIEND_REQUEST)",
      "relatedUserId": "string (UUID)",
      "relatedUser": {
        "id": "string",
        "username": "string",
        "firstName": "string",
        "lastName": "string"
      },
      "relatedPostId": "string (UUID, optional)",
      "message": "string",
      "read": "boolean",
      "createdAt": "ISO 8601 timestamp"
    }
  ],
  "total": "integer",
  "hasMore": "boolean"
}
```

---

## Error Response Format

All errors follow this format:

**Response (400, 401, 403, 404, 500, etc.):**

```json
{
  "error": "string (error message)",
  "code": "string (error code)",
  "statusCode": "integer"
}
```
