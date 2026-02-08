import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  usersAPI,
  followsAPI,
  blocksAPI,
  likesAPI,
  commentsAPI,
} from "../services/api";
import type {
  User,
  Follower,
  BlockedUser,
  Comment as ApiComment,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed, PostCard } from "../components";
import type { PostProps } from "../components";
import { X } from "lucide-react";

export function ProfilePage() {
  const { user } = useAuth();
  const commentsPageSize = 5;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null,
  );
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, ApiComment[]>
  >({});
  const [commentMetaByPost, setCommentMetaByPost] = useState<
    Record<string, { total: number; limit: number; offset: number }>
  >({});
  const [editingCommentByPost, setEditingCommentByPost] = useState<
    Record<string, string | null>
  >({});
  const [commentEditDrafts, setCommentEditDrafts] = useState<
    Record<string, string>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean>
  >({});
  const [commentsMoreLoading, setCommentsMoreLoading] = useState<
    Record<string, boolean>
  >({});

  const formatPostTime = (isoDate: string) => {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      const hours = Math.max(diffHours, 1);
      return `${hours}h`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const current = await usersAPI.getCurrentProfile();
        setProfile(current);
        setFirstName(current.firstName || "");
        setLastName(current.lastName || "");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      const currentUserId = user?.id || profile?.id;
      if (!currentUserId) {
        return;
      }

      try {
        setPostsLoading(true);
        setPostsError(null);
        const response = await usersAPI.getUserPosts(currentUserId, 20, 0);
        const mappedPosts: PostProps[] = response.posts.map((post) => ({
          id: post.id,
          authorId: post.author?.id,
          author: {
            name:
              post.author?.firstName && post.author?.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author?.username || "Unknown",
            handle: post.author?.username || "user",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.id || post.author?.username || post.id}`,
          },
          content: post.content,
          timestamp: formatPostTime(post.createdAt),
          likes: post.likesCount,
          replies: post.commentsCount,
          liked: user?.id ? post.likes?.includes(user.id) : false,
        }));
        setPosts(mappedPosts);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load posts";
        setPostsError(message);
      } finally {
        setPostsLoading(false);
      }
    };

    loadPosts();
  }, [profile?.id, user?.id]);

  useEffect(() => {
    const loadFollows = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const [followersResponse, followingResponse, blockedResponse] =
          await Promise.all([
            followsAPI.getUserFollowers(user.id),
            followsAPI.getUserFollowing(user.id),
            blocksAPI.list(),
          ]);
        setFollowers(followersResponse);
        setFollowing(followingResponse);
        setBlocked(blockedResponse.blocked);
      } catch (err) {
        console.error("Failed to load followers/following:", err);
      }
    };

    loadFollows();
  }, [user?.id]);

  useEffect(() => {
    if (openCommentsPostId) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [openCommentsPostId]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await usersAPI.updateProfile({ firstName, lastName });
      setProfile(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) {
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      if (post.liked) {
        await likesAPI.unlikePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
              : p,
          ),
        );
      } else {
        await likesAPI.likePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleComments = async (postId: string) => {
    const nextOpen = openCommentsPostId === postId ? null : postId;
    setOpenCommentsPostId(nextOpen);

    if (nextOpen && !commentsByPost[postId]) {
      try {
        setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
        const response = await commentsAPI.getPostComments(postId, {
          limit: commentsPageSize,
          offset: 0,
        });
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: response.comments,
        }));
        setCommentMetaByPost((prev) => ({
          ...prev,
          [postId]: {
            total: response.total,
            limit: response.limit,
            offset: response.comments.length,
          },
        }));
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = (commentDrafts[postId] || "").trim();
    if (!content) {
      return;
    }

    try {
      const newComment = await commentsAPI.createComment(postId, content);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])],
      }));
      setCommentMetaByPost((prev) => {
        const current = prev[postId];
        const loaded = (commentsByPost[postId] || []).length + 1;
        if (!current) {
          return {
            ...prev,
            [postId]: {
              total: loaded,
              limit: commentsPageSize,
              offset: loaded,
            },
          };
        }
        return {
          ...prev,
          [postId]: {
            ...current,
            total: current.total + 1,
            offset: current.offset + 1,
          },
        };
      });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, replies: p.replies + 1 } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  const handleStartEditComment = (postId: string, comment: ApiComment) => {
    setEditingCommentByPost((prev) => ({ ...prev, [postId]: comment.id }));
    setCommentEditDrafts((prev) => ({
      ...prev,
      [comment.id]: comment.content,
    }));
  };

  const handleCancelEditComment = (postId: string, commentId: string) => {
    setEditingCommentByPost((prev) => ({ ...prev, [postId]: null }));
    setCommentEditDrafts((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  };

  const handleSaveEditComment = async (postId: string, commentId: string) => {
    const content = (commentEditDrafts[commentId] || "").trim();
    if (!content) {
      return;
    }

    try {
      const updated = await commentsAPI.updateComment(
        postId,
        commentId,
        content,
      );
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).map((comment) =>
          comment.id === commentId
            ? { ...comment, content: updated.content }
            : comment,
        ),
      }));
      handleCancelEditComment(postId, commentId);
    } catch (err) {
      console.error("Failed to update comment:", err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      await commentsAPI.deleteComment(postId, commentId);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(
          (comment) => comment.id !== commentId,
        ),
      }));
      setCommentMetaByPost((prev) => {
        const current = prev[postId];
        if (!current) {
          return prev;
        }
        return {
          ...prev,
          [postId]: {
            ...current,
            total: Math.max(0, current.total - 1),
            offset: Math.max(0, current.offset - 1),
          },
        };
      });
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, replies: Math.max(0, p.replies - 1) } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleLoadMoreComments = async (postId: string) => {
    const currentComments = commentsByPost[postId] || [];
    const meta = commentMetaByPost[postId];
    const nextOffset = currentComments.length;
    const limit = meta?.limit ?? commentsPageSize;

    if (meta && currentComments.length >= meta.total) {
      return;
    }

    try {
      setCommentsMoreLoading((prev) => ({ ...prev, [postId]: true }));
      const response = await commentsAPI.getPostComments(postId, {
        limit,
        offset: nextOffset,
      });
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), ...response.comments],
      }));
      setCommentMetaByPost((prev) => ({
        ...prev,
        [postId]: {
          total: response.total,
          limit: response.limit,
          offset: nextOffset + response.comments.length,
        },
      }));
    } catch (err) {
      console.error("Failed to load more comments:", err);
    } finally {
      setCommentsMoreLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const selectedPost = openCommentsPostId
    ? posts.find((post) => post.id === openCommentsPostId) || null
    : null;

  const handleCloseComments = () => setOpenCommentsPostId(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">Your Profile</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading profile...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">Username</label>
                  <div className="input bg-neutral-50">{profile?.username}</div>
                </div>
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <div className="input bg-neutral-50">{profile?.email}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">First name</label>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Last name</label>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn-primary px-5 py-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <button
            onClick={() => navigate("/followers")}
            className="card p-6 hover:shadow-lg hover:border-brand-500 transition-all cursor-pointer text-left"
          >
            <h2 className="text-brand font-semibold mb-4">Followers</h2>
            <p className="text-2xl font-bold text-brand mb-2">
              {followers.length}
            </p>
            <p className="text-sm text-muted">
              {followers.length === 0
                ? "No followers yet."
                : "Click to see all"}
            </p>
          </button>

          <button
            onClick={() => navigate("/following")}
            className="card p-6 hover:shadow-lg hover:border-brand-500 transition-all cursor-pointer text-left"
          >
            <h2 className="text-brand font-semibold mb-4">Following</h2>
            <p className="text-2xl font-bold text-brand mb-2">
              {following.length}
            </p>
            <p className="text-sm text-muted">
              {following.length === 0
                ? "Not following anyone yet."
                : "Click to see all"}
            </p>
          </button>

          <button
            onClick={() => navigate("/blocks")}
            className="card p-6 hover:shadow-lg hover:border-brand-500 transition-all cursor-pointer text-left"
          >
            <h2 className="text-brand font-semibold mb-4">Blocked</h2>
            <p className="text-2xl font-bold text-brand mb-2">
              {blocked.length}
            </p>
            <p className="text-sm text-muted">
              {blocked.length === 0 ? "No blocked users." : "Click to see all"}
            </p>
          </button>
        </div>

        <div className="card p-6">
          <h2 className="text-brand text-lg font-semibold mb-4">Posts</h2>

          {postsError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {postsError}
            </div>
          )}

          <Feed
            posts={posts}
            isLoading={postsLoading}
            onLike={handleLike}
            onReply={toggleComments}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {openCommentsPostId && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseComments}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(event) => event.stopPropagation()}
              className="card w-full max-w-3xl max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
                <h2 className="text-brand text-lg sm:text-xl">Post</h2>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCloseComments}
                  className="icon-btn"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
                <PostCard {...selectedPost} onLike={handleLike} />

                <div className="card p-4 sm:p-5">
                  <div className="space-y-4">
                    <div className="text-sm text-muted">Comments</div>

                    <div className="flex items-center gap-2">
                      <input
                        value={commentDrafts[selectedPost.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({
                            ...prev,
                            [selectedPost.id]: e.target.value,
                          }))
                        }
                        placeholder="Write a comment..."
                        className="input flex-1"
                      />
                      <button
                        className="btn-primary px-4 py-2 text-sm"
                        onClick={() => handleAddComment(selectedPost.id)}
                      >
                        Send
                      </button>
                    </div>

                    {commentsLoading[selectedPost.id] ? (
                      <div className="text-sm text-muted">
                        Loading comments...
                      </div>
                    ) : (commentsByPost[selectedPost.id] || []).length > 0 ? (
                      <div className="space-y-3">
                        {(commentsByPost[selectedPost.id] || []).map(
                          (comment) => {
                            const isEditing =
                              editingCommentByPost[selectedPost.id] ===
                              comment.id;
                            const canManageComment =
                              !!user?.id && comment.author?.id === user.id;

                            return (
                              <div
                                key={comment.id}
                                className="rounded-lg bg-neutral-50 px-3 py-2"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="text-xs text-muted">
                                    {comment.author
                                      ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
                                        comment.author.username
                                      : "User"}
                                  </div>
                                  {canManageComment && !isEditing && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleStartEditComment(
                                            selectedPost.id,
                                            comment,
                                          )
                                        }
                                        className="text-neutral-600 hover:text-neutral-900"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteComment(
                                            selectedPost.id,
                                            comment.id,
                                          )
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="mt-2 space-y-2">
                                    <input
                                      value={
                                        commentEditDrafts[comment.id] || ""
                                      }
                                      onChange={(e) =>
                                        setCommentEditDrafts((prev) => ({
                                          ...prev,
                                          [comment.id]: e.target.value,
                                        }))
                                      }
                                      className="input w-full"
                                    />
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleSaveEditComment(
                                            selectedPost.id,
                                            comment.id,
                                          )
                                        }
                                        className="btn-primary px-3 py-1 text-xs"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCancelEditComment(
                                            selectedPost.id,
                                            comment.id,
                                          )
                                        }
                                        className="text-xs text-neutral-600 hover:text-neutral-900"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-neutral-900">
                                    {comment.content}
                                  </div>
                                )}
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted">No comments yet.</div>
                    )}

                    {(() => {
                      const comments = commentsByPost[selectedPost.id] || [];
                      const meta = commentMetaByPost[selectedPost.id];
                      const hasMore = meta && comments.length < meta.total;

                      if (!hasMore) {
                        return null;
                      }

                      const isMoreLoading =
                        commentsMoreLoading[selectedPost.id];

                      return (
                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              handleLoadMoreComments(selectedPost.id)
                            }
                            disabled={isMoreLoading}
                            className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-60"
                          >
                            {isMoreLoading ? "Loading..." : "More comments"}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
