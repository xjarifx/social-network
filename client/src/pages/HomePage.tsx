import { useState, useEffect, useMemo, useCallback } from "react";
import { postsAPI, likesAPI, followsAPI } from "../services/api";
import { Feed, CommentsModal } from "../components";
import type { PostProps } from "../components";
import { useAuth } from "../context/AuthContext";
import { useComments } from "../hooks";
import { transformPost } from "../utils";

type FeedTab = "following" | "forYou";

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>("forYou");

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

  const filteredPosts = useMemo(() => {
    if (activeTab === "following") {
      const followingSet = new Set(followingIds);
      return postsWithFollowState.filter(
        (post) => post.authorId && followingSet.has(post.authorId),
      );
    }
    // "forYou" tab - empty for now
    return [];
  }, [postsWithFollowState, followingIds, activeTab]);

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
    <div>
      {/* Tab Navigation */}
      <div className="sticky top-[60px] z-10 border-b border-[#ececec] bg-white/80 backdrop-blur-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "forYou"
                ? "text-[#1a73e8]"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "following"
                ? "text-[#1a73e8]"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            Following
          </button>
        </div>
        {/* Underline indicator */}
        <div className="relative h-1 bg-[#e8e8e8]">
          <div
            className={`absolute top-0 h-full w-1/2 bg-[#1a73e8] transition-all duration-300 ${
              activeTab === "following" ? "translate-x-full" : ""
            }`}
          />
        </div>
      </div>

      <div className="py-4">
        {error && (
          <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
            {error}
          </div>
        )}
        <Feed
          posts={filteredPosts}
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
