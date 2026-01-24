# Social Network Database Schema - MVP Minimum

## users

```
id              → uuid
username        → string (unique)
email           → string (unique)
password        → string (hashed)
first_name      → string
last_name       → string
created_at      → timestamp
```

## posts

```
id              → uuid
author_id       → uuid → users.id
content         → text
likes_count     → integer (default 0)
comments_count  → integer (default 0)
created_at      → timestamp
updated_at      → timestamp
```

## comments

```
id              → uuid
post_id         → uuid → posts.id (cascade delete)
author_id       → uuid → users.id
content         → text
created_at      → timestamp
```

## likes

```
id              → uuid
user_id         → uuid → users.id
post_id         → uuid → posts.id (cascade delete)
created_at      → timestamp

unique(user_id, post_id)
```

## friendships

```
id              → uuid
sender_id       → uuid → users.id
recipient_id    → uuid → users.id
status          → enum (PENDING, ACCEPTED)
created_at      → timestamp
updated_at      → timestamp

unique(sender_id, recipient_id)
```

## notifications

```
id               → uuid
user_id          → uuid → users.id
type             → enum (LIKE, COMMENT, FRIEND_REQUEST)
related_user_id  → uuid → users.id
related_post_id  → uuid → posts.id (optional)
message          → string
read             → boolean (default false)
created_at       → timestamp
```
