-- 1. USERS TABLE
users
├── id (UUID, PK)
├── email (VARCHAR(255), UNIQUE, NOT NULL)
├── username (VARCHAR(50), UNIQUE, NOT NULL)
├── password_hash (VARCHAR(255), NOT NULL)
├── first_name (VARCHAR(100), NOT NULL)
├── last_name (VARCHAR(100), NOT NULL)
├── bio (TEXT, NULL)
├── date_of_birth (DATE, NOT NULL)
├── show_birth_year (BOOLEAN, DEFAULT TRUE) -- privacy option
├── status (ENUM: active, inactive, suspended, deleted, DEFAULT active)
├── privacy_setting (ENUM: public, friends_only, DEFAULT public)
├── email_verified (BOOLEAN, DEFAULT FALSE)
├── email_verification_token (VARCHAR(255), NULL)
├── email_verification_expires_at (TIMESTAMP, NULL)
├── created_at (TIMESTAMP, DEFAULT NOW)
├── updated_at (TIMESTAMP, DEFAULT NOW)
├── last_login_at (TIMESTAMP, NULL)
└── deleted_at (TIMESTAMP, NULL) -- soft delete for users too

CONSTRAINTS:

- CHECK email format
- CHECK age >= 13 years
- CHECK (status != 'deleted' OR deleted_at IS NOT NULL)

INDEXES:

- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (username)
- INDEX (status, created_at)
- INDEX (email_verified) -- for filtering unverified users
- INDEX (username) -- for quick username lookups

-- 2. SESSIONS TABLE (for auth management)
sessions
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── token_hash (VARCHAR(255), UNIQUE, NOT NULL) -- hashed JWT for revocation
├── ip_address (INET, NULL)
├── user_agent (TEXT, NULL)
├── expires_at (TIMESTAMP, NOT NULL)
├── created_at (TIMESTAMP, DEFAULT NOW)
└── last_used_at (TIMESTAMP, DEFAULT NOW)

INDEXES:

- PRIMARY KEY (id)
- UNIQUE (token_hash)
- INDEX (user_id, expires_at DESC)
- INDEX (expires_at) -- for cleanup

-- 3. FRIENDSHIPS TABLE (simplified with helper view)
friendships
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── friend_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── status (ENUM: pending, accepted, DEFAULT pending) -- removed 'blocked'
├── action_user_id (UUID, FK -> users.id, ON DELETE SET NULL)
├── created_at (TIMESTAMP, DEFAULT NOW)
├── updated_at (TIMESTAMP, DEFAULT NOW)
└── accepted_at (TIMESTAMP, NULL)

CONSTRAINTS:

- CHECK (user_id != friend_id)
- CHECK (user_id < friend_id) -- canonical ordering
- UNIQUE (user_id, friend_id)

INDEXES:

- PRIMARY KEY (id)
- INDEX (user_id, status, accepted_at DESC)
- INDEX (friend_id, status, accepted_at DESC)
- UNIQUE INDEX (user_id, friend_id)

-- Helper view for bidirectional queries
CREATE VIEW friendship_connections AS
SELECT user_id as user_a, friend_id as user_b, status, accepted_at, id
FROM friendships
UNION ALL
SELECT friend_id as user_a, user_id as user_b, status, accepted_at, id
FROM friendships;

-- 4. BLOCKS TABLE (separate from friendships)
blocks
├── id (UUID, PK)
├── blocker_id (UUID, FK -> users.id, ON DELETE CASCADE) -- who blocked
├── blocked_id (UUID, FK -> users.id, ON DELETE CASCADE) -- who got blocked
├── reason (TEXT, NULL) -- optional reason for blocking
└── created_at (TIMESTAMP, DEFAULT NOW)

CONSTRAINTS:

- CHECK (blocker_id != blocked_id)
- UNIQUE (blocker_id, blocked_id)

INDEXES:

- PRIMARY KEY (id)
- UNIQUE INDEX (blocker_id, blocked_id)
- INDEX (blocked_id) -- to check if user is blocked by someone

-- 5. MEDIA TABLE (centralized file management)
media
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── type (ENUM: profile_picture, cover_photo, post_image)
├── url (VARCHAR(500), NOT NULL)
├── storage_path (VARCHAR(500), NOT NULL) -- for deletion from storage
├── file_size (INTEGER, NOT NULL) -- in bytes
├── mime_type (VARCHAR(100), NOT NULL)
├── width (INTEGER, NULL) -- for images
├── height (INTEGER, NULL) -- for images
├── is_active (BOOLEAN, DEFAULT TRUE) -- soft delete
├── created_at (TIMESTAMP, DEFAULT NOW)
└── deleted_at (TIMESTAMP, NULL)

INDEXES:

- PRIMARY KEY (id)
- INDEX (user_id, type, is_active, created_at DESC)
- INDEX (is_active, created_at) -- for cleanup jobs

-- 6. POSTS TABLE
posts
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── content (TEXT, NOT NULL)
├── privacy (ENUM: public, friends_only, DEFAULT friends_only)
├── likes_count (INTEGER, DEFAULT 0)
├── comments_count (INTEGER, DEFAULT 0)
├── shares_count (INTEGER, DEFAULT 0) -- for future
├── is_edited (BOOLEAN, DEFAULT FALSE)
├── is_deleted (BOOLEAN, DEFAULT FALSE)
├── is_flagged (BOOLEAN, DEFAULT FALSE) -- moderation
├── flag_count (INTEGER, DEFAULT 0)
├── created_at (TIMESTAMP, DEFAULT NOW)
├── updated_at (TIMESTAMP, DEFAULT NOW)
└── deleted_at (TIMESTAMP, NULL)

CONSTRAINTS:

- CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000)
- CHECK (likes_count >= 0)
- CHECK (comments_count >= 0)

INDEXES:

- PRIMARY KEY (id)
- INDEX (user_id, is_deleted, created_at DESC)
- INDEX (is_deleted, is_flagged, created_at DESC) -- for moderation
- INDEX (created_at DESC) -- for global feed

-- 7. POST_MEDIA TABLE (many-to-many for multiple images per post)
post_media
├── id (UUID, PK)
├── post_id (UUID, FK -> posts.id, ON DELETE CASCADE)
├── media_id (UUID, FK -> media.id, ON DELETE CASCADE)
├── display_order (INTEGER, DEFAULT 0) -- for ordering images
└── created_at (TIMESTAMP, DEFAULT NOW)

CONSTRAINTS:

- UNIQUE (post_id, media_id)
- UNIQUE (post_id, display_order)

INDEXES:

- PRIMARY KEY (id)
- INDEX (post_id, display_order)
- INDEX (media_id)

-- 8. LIKES TABLE
likes
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── post_id (UUID, FK -> posts.id, ON DELETE CASCADE)
└── created_at (TIMESTAMP, DEFAULT NOW)

CONSTRAINTS:

- UNIQUE (user_id, post_id)

INDEXES:

- PRIMARY KEY (id)
- UNIQUE INDEX (user_id, post_id)
- INDEX (post_id, created_at DESC)
- INDEX (user_id, created_at DESC)

-- 9. COMMENTS TABLE
comments
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── post_id (UUID, FK -> posts.id, ON DELETE CASCADE)
├── parent_comment_id (UUID, FK -> comments.id, ON DELETE CASCADE, NULL) -- for replies
├── content (TEXT, NOT NULL)
├── is_edited (BOOLEAN, DEFAULT FALSE)
├── is_deleted (BOOLEAN, DEFAULT FALSE)
├── is_flagged (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP, DEFAULT NOW)
├── updated_at (TIMESTAMP, DEFAULT NOW)
└── deleted_at (TIMESTAMP, NULL)

CONSTRAINTS:

- CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 2000)

INDEXES:

- PRIMARY KEY (id)
- INDEX (post_id, is_deleted, created_at ASC)
- INDEX (parent_comment_id, is_deleted, created_at ASC) -- for nested replies
- INDEX (user_id, is_deleted, created_at DESC)

-- 10. NOTIFICATIONS TABLE
notifications
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── actor_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── type (ENUM: friend_request, friend_accept, post_like, post_comment, comment_reply)
├── reference_type (ENUM: post, comment, friendship, NULL)
├── reference_id (UUID, NULL)
├── is_read (BOOLEAN, DEFAULT FALSE)
├── created_at (TIMESTAMP, DEFAULT NOW)
└── read_at (TIMESTAMP, NULL)

CONSTRAINTS:

- CHECK (user_id != actor_id)

INDEXES:

- PRIMARY KEY (id)
- INDEX (user_id, is_read, created_at DESC)
- INDEX (user_id, created_at DESC) WHERE is_read = FALSE -- partial index for unread
- INDEX (reference_type, reference_id)
- INDEX (created_at) -- for archival

-- Prevent duplicate notifications for same action
UNIQUE INDEX (user_id, type, reference_id, actor_id)
WHERE reference_id IS NOT NULL AND is_read = FALSE;

-- 11. FEED_CACHE TABLE (performance optimization)
feed_cache
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE)
├── post_id (UUID, FK -> posts.id, ON DELETE CASCADE)
├── post_created_at (TIMESTAMP, NOT NULL) -- denormalized for sorting
└── cached_at (TIMESTAMP, DEFAULT NOW)

CONSTRAINTS:

- PRIMARY KEY (user_id, post_id)

INDEXES:

- PRIMARY KEY (user_id, post_id)
- INDEX (user_id, post_created_at DESC)
- INDEX (cached_at) -- for cache invalidation

NOTES:

- Regenerate on: new post, friendship accepted/removed, privacy change
- Can be async/background job
- Dramatically speeds up feed queries

-- 12. USER_PREFERENCES TABLE (extensible settings)
user_preferences
├── user_id (UUID, FK -> users.id, ON DELETE CASCADE, PK)
├── notification_friend_request (BOOLEAN, DEFAULT TRUE)
├── notification_post_like (BOOLEAN, DEFAULT TRUE)
├── notification_post_comment (BOOLEAN, DEFAULT TRUE)
├── notification_comment_reply (BOOLEAN, DEFAULT TRUE)
├── email_notifications (BOOLEAN, DEFAULT TRUE)
├── theme (ENUM: light, dark, system, DEFAULT system)
└── updated_at (TIMESTAMP, DEFAULT NOW)

INDEXES:

- PRIMARY KEY (user_id)

-- 13. REPORTS TABLE (content moderation)
reports
├── id (UUID, PK)
├── reporter_id (UUID, FK -> users.id, ON DELETE SET NULL)
├── reported_type (ENUM: post, comment, user)
├── reported_id (UUID, NOT NULL)
├── reason (ENUM: spam, harassment, inappropriate, hate_speech, other)
├── description (TEXT, NULL)
├── status (ENUM: pending, reviewed, action_taken, dismissed, DEFAULT pending)
├── reviewed_by (UUID, FK -> users.id, ON DELETE SET NULL, NULL)
├── created_at (TIMESTAMP, DEFAULT NOW)
└── reviewed_at (TIMESTAMP, NULL)

INDEXES:

- PRIMARY KEY (id)
- INDEX (reported_type, reported_id, status)
- INDEX (status, created_at)
- INDEX (reporter_id)

-- 14. ACTIVITY_LOG TABLE (audit trail - optional but impressive)
activity_log
├── id (UUID, PK)
├── user_id (UUID, FK -> users.id, ON DELETE SET NULL)
├── action (ENUM: login, logout, post_create, post_delete, profile_update, etc)
├── ip_address (INET, NULL)
├── user_agent (TEXT, NULL)
├── metadata (JSONB, NULL) -- flexible additional data
└── created_at (TIMESTAMP, DEFAULT NOW)

INDEXES:

- PRIMARY KEY (id)
- INDEX (user_id, created_at DESC)
- INDEX (action, created_at DESC)
- INDEX (created_at) -- for partitioning/archival

-- Trigger: Update post likes_count
CREATE TRIGGER increment_post_likes
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count(1);

CREATE TRIGGER decrement_post_likes
AFTER DELETE ON likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count(-1);

-- Trigger: Update post comments_count
CREATE TRIGGER increment_post_comments
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count(1);

CREATE TRIGGER decrement_post_comments
AFTER DELETE ON comments
FOR EACH ROW
WHEN (OLD.is_deleted = FALSE)
EXECUTE FUNCTION update_post_comments_count(-1);

-- Trigger: Auto-update updated_at timestamp
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- (Repeat for posts, comments, friendships, etc.)

-- Trigger: Create notification on like
CREATE TRIGGER create_like_notification
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_like();

-- Trigger: Create notification on comment
CREATE TRIGGER create_comment_notification
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_notification_for_comment();

-- Trigger: Invalidate feed cache on new post
CREATE TRIGGER invalidate_feed_on_new_post
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION invalidate_user_feed_cache();

```

```
