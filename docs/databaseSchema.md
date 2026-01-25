## users

```
id              → uuid
username        → string (unique)
email           → string (unique)
password        → string (hashed)
first_name      → string
last_name       → string
created_at      → timestamp
deleted_at      → timestamp (nullable, soft delete)
```

## posts

```
id              → uuid
author_id       → uuid → users.id (cascade delete)
content         → text
likes_count     → integer (default 0)
comments_count  → integer (default 0)
created_at      → timestamp
updated_at      → timestamp
deleted_at      → timestamp (nullable, soft delete)
```

## comments

```
id              → uuid
post_id         → uuid → posts.id (cascade delete)
author_id       → uuid → users.id (cascade delete)
content         → text
created_at      → timestamp
updated_at      → timestamp
deleted_at      → timestamp (nullable, soft delete)
```

## likes

```
id              → uuid
user_id         → uuid → users.id (cascade delete)
post_id         → uuid → posts.id (cascade delete)
created_at      → timestamp
deleted_at      → timestamp (nullable, soft delete)

unique(user_id, post_id)
```

## followers

```
id              → uuid
follower_id     → uuid → users.id (cascade delete)
following_id    → uuid → users.id (cascade delete)
created_at      → timestamp

unique(follower_id, following_id)
```

## notifications

```
id               → uuid
user_id          → uuid → users.id (cascade delete)
type             → enum (LIKE, COMMENT, NEW FOLLOWER)
related_user_id  → uuid → users.id (cascade delete)
related_post_id  → uuid → posts.id (optional, cascade delete)
message          → string
read             → boolean (default false)
created_at       → timestamp
deleted_at       → timestamp (nullable, soft delete)
```
