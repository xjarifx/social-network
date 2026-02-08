import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { usersAPI, followsAPI, blocksAPI, likesAPI } from "../services/api";
import type { User, Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed, CommentsModal } from "../components";
import type { PostProps } from "../components";
import { useComments } from "../hooks";
import { transformPost } from "../utils";

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const hasInitializedFollowState = useRef(false);

  const comments = useComments();

  const canFollow = useMemo(
    () => !!user?.id && !!userId && user.id !== userId,
    [user?.id, userId],
  );

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
  }, [comments.setOnReplyCountChange]);

  useEffect(() => {
    document.documentElement.style.overflow = comments.openCommentsPostId
      ? "hidden"
      : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [comments.openCommentsPostId]);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);
    usersAPI
      .getProfile(userId)
      .then(setProfile)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load user"),
      )
      .finally(() => setIsLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setPostsLoading(true);
    setPostsError(null);
    usersAPI
      .getUserPosts(userId, 20, 0)
      .then((response) =>
        setPosts(response.posts.map((p) => transformPost(p, user?.id))),
      )
      .catch((err) =>
        setPostsError(err instanceof Error ? err.message : "Failed to load posts"),
      )
      .finally(() => setPostsLoading(false));
  }, [user?.id, userId]);

  useEffect(() => {
    if (!user?.id) return;
    followsAPI
      .getUserFollowing(user.id)
      .then(setFollowing)
      .catch((err) => console.error("Failed to load following:", err));
  }, [user?.id]);

  useEffect(() => {
    if (!userId || following.length === 0 || hasInitializedFollowState.current)
      return;
    setIsFollowing(following.some((item) => item.user?.id === userId));
    hasInitializedFollowState.current = true;
  }, [following, userId]);

  useEffect(() => {
    hasInitializedFollowState.current = false;
  }, [userId]);

  const handleFollowToggle = async () => {
    if (!user?.id || !userId) return;
    const wasFollowing = isFollowing;
    const originalFollowing = following;
    try {
      if (isFollowing) {
        setIsFollowing(false);
        setFollowing((prev) => prev.filter((item) => item.user?.id !== userId));
        await followsAPI.unfollowUser(user.id, userId);
      } else {
        setIsFollowing(true);
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
        const response = await followsAPI.followUser(user.id, userId);
        setFollowing((prev) =>
          prev.map((item) => (item.id === tempFollower.id ? response : item)),
        );
      }
    } catch (err) {
      setIsFollowing(wasFollowing);
      setFollowing(originalFollowing);
      console.error("Failed to follow/unfollow:", err);
    }
  };

  const handleBlock = async () => {
    if (!userId) return;
    try {
      setIsBlocking(true);
      await blocksAPI.blockUser(userId);
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setIsBlocking(false);
    }
  };

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
    ? posts.find((p) => p.id === comments.openCommentsPostId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-neutral-bg">
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
              onReply={comments.toggleComments}
            />
          </div>
        </div>
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
          editingCommentId={comments.editingCommentByPost[selectedPost.id] ?? null}
          commentEditDrafts={comments.commentEditDrafts}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
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
