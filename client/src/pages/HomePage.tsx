import { useState, useEffect, useMemo, useCallback } from "react";
import { postsAPI, likesAPI, followsAPI } from "../services/api";
import { Feed, CommentsModal } from "../components";
import type { PostProps } from "../components";
import { useAuth } from "../context/AuthContext";
import { useComments } from "../hooks";
import { transformPost } from "../utils";

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);

  const comments = useComments();

  // Wire up reply count changes to posts state
  useEffect(() => {
    comments.setOnReplyCountChange((postId: string, delta: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, replies: Math.max(0, p.replies + delta) }
            : p,
        ),
      );
    });
  }, []);

  // Lock body scroll when comments modal is open
  useEffect(() => {
    document.documentElement.style.overflow = comments.openCommentsPostId
      ? "hidden"
      : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [comments.openCommentsPostId]);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiPosts = await postsAPI.getFeed(20, 0);
        setPosts(apiPosts.map((p) => transformPost(p, user?.id)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, [user?.id]);

  // Load following IDs
  useEffect(() => {
    if (!user?.id) return;
    followsAPI
      .getUserFollowing(user.id)
      .then((response) => {
        setFollowingIds(
          response
            .map((item) => item.user?.id)
            .filter((id): id is string => Boolean(id)),
        );
      })
      .catch((err) => console.error("Failed to load following:", err));
  }, [user?.id]);

  const postsWithFollowState = useMemo(() => {
    const followingSet = new Set(followingIds);
    return posts.map((post) => ({
      ...post,
      isFollowing: post.authorId ? followingSet.has(post.authorId) : false,
    }));
  }, [posts, followingIds]);

  const handleFollowToggle = useCallback(
    async (authorId: string, isFollowing: boolean) => {
      if (!user?.id) return;
      const original = followingIds;
      try {
        if (isFollowing) {
          setFollowingIds((prev) => prev.filter((id) => id !== authorId));
          await followsAPI.unfollowUser(user.id, authorId);
        } else {
          setFollowingIds((prev) =>
            prev.includes(authorId) ? prev : [...prev, authorId],
          );
          await followsAPI.followUser(user.id, authorId);
        }
      } catch (err) {
        setFollowingIds(original);
        console.error("Failed to follow/unfollow:", err);
      }
    },
    [user?.id, followingIds],
  );

  const handleLike = useCallback(
    async (postId: string) => {
      if (!user?.id) return;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      try {
        if (post.liked) {
          await likesAPI.unlikePost(postId);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
                : p,
            ),
          );
        } else {
          await likesAPI.likePost(postId);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    },
    [posts, user?.id],
  );

  const selectedPost = comments.openCommentsPostId
    ? (postsWithFollowState.find((p) => p.id === comments.openCommentsPostId) ??
      null)
    : null;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}
        <Feed
          posts={postsWithFollowState}
          isLoading={isLoading}
          onLike={handleLike}
          onReply={comments.toggleComments}
          onFollowToggle={handleFollowToggle}
        />
      </div>

      {comments.openCommentsPostId && selectedPost && (
        <CommentsModal
          post={selectedPost}
          comments={comments.commentsByPost[selectedPost.id] || []}
          commentDraft={comments.commentDrafts[selectedPost.id] || ""}
          isLoading={comments.commentsLoading[selectedPost.id] || false}
          isMoreLoading={comments.commentsMoreLoading[selectedPost.id] || false}
          hasMore={
            !!comments.commentMetaByPost[selectedPost.id] &&
            (comments.commentsByPost[selectedPost.id]?.length ?? 0) <
              comments.commentMetaByPost[selectedPost.id].total
          }
          editingCommentId={
            comments.editingCommentByPost[selectedPost.id] ?? null
          }
          commentEditDrafts={comments.commentEditDrafts}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
          onFollowToggle={handleFollowToggle}
          onAddComment={comments.handleAddComment}
          onCommentDraftChange={comments.setCommentDraft}
          onStartEdit={comments.handleStartEditComment}
          onCancelEdit={comments.handleCancelEditComment}
          onSaveEdit={comments.handleSaveEditComment}
          onDelete={comments.handleDeleteComment}
          onLoadMore={comments.handleLoadMoreComments}
          onCommentEditDraftChange={comments.setCommentEditDraft}
        />
      )}
    </div>
  );
}
