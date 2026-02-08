import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  usersAPI,
  followsAPI,
  blocksAPI,
  likesAPI,
  commentsAPI,
} from "../services/api";
import type { User, Follower, Comment as ApiComment } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed, PostCard } from "../components";
import type { PostProps } from "../components";
import { X } from "lucide-react";

export function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const commentsPageSize = 5;
  const [profile, setProfile] = useState<User | null>(null);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
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
  const [isBlocking, setIsBlocking] = useState(false);
  const hasInitializedFollowState = useRef(false);

  const canFollow = useMemo(
    () => !!user?.id && !!userId && user.id !== userId,
    [user?.id, userId],
  );

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
      if (!userId) {
        return;
      }
      try {
        setIsLoading(true);
        const result = await usersAPI.getProfile(userId);
        setProfile(result);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load user";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!userId) {
        return;
      }

      try {
        setPostsLoading(true);
        setPostsError(null);
        const response = await usersAPI.getUserPosts(userId, 20, 0);
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
  }, [user?.id, userId]);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const response = await followsAPI.getUserFollowing(user.id);
        setFollowing(response);
      } catch (err) {
        console.error("Failed to load following:", err);
      }
    };

    loadFollowing();
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

  // Set initial following state only on first load of following data
  useEffect(() => {
    if (
      !userId ||
      following.length === 0 ||
      hasInitializedFollowState.current
    ) {
      return;
    }
    const shouldBeFollowing = following.some(
      (item) => item.user?.id === userId,
    );
    setIsFollowing(shouldBeFollowing);
    hasInitializedFollowState.current = true;
  }, [following, userId]);

  // Reset initialization flag when userId changes
  useEffect(() => {
    hasInitializedFollowState.current = false;
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user?.id || !userId) {
      return;
    }

    // Store original state for rollback
    const wasFollowing = isFollowing;
    const originalFollowing = following;

    try {
      if (isFollowing) {
        // Optimistically update both states together
        setIsFollowing(false);
        setFollowing((prev) => prev.filter((item) => item.user?.id !== userId));
        await followsAPI.unfollowUser(user.id, userId);
      } else {
        // Optimistically update UI first
        setIsFollowing(true);
        // Create temporary follower object for optimistic update
        const tempFollower = {
          id: "temp-" + Date.now(),
          followedAt: new Date().toISOString(),
          user: {
            id: userId,
            username: profile?.username || "",
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
          },
        };
        setFollowing((prev) => [...prev, tempFollower]);

        // Make API call and replace temp with real data
        const response = await followsAPI.followUser(user.id, userId);
        setFollowing((prev) =>
          prev.map((item) => (item.id === tempFollower.id ? response : item)),
        );
      }
    } catch (err) {
      // Revert both states on error
      setIsFollowing(wasFollowing);
      setFollowing(originalFollowing);
      console.error("Failed to follow/unfollow:", err);
    }
  };

  const handleBlock = async () => {
    if (!userId) {
      return;
    }

    try {
      setIsBlocking(true);
      await blocksAPI.blockUser(userId);
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setIsBlocking(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading user...</div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-lg text-brand font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </div>
                <div className="text-sm text-muted">@{profile?.username}</div>
                <div className="text-sm text-muted">{profile?.email}</div>
              </div>

              {canFollow && (
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold ${
                      isFollowing
                        ? "bg-neutral-100 text-neutral-700"
                        : "btn-primary"
                    }`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </button>
                  <button
                    className="px-5 py-2 rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleBlock}
                    disabled={isBlocking}
                  >
                    {isBlocking ? "Blocking..." : "Block"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 pt-2">
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
