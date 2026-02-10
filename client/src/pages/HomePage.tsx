import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { postsAPI, likesAPI, followsAPI } from "../services/api";
import { Feed, CommentsModal } from "../components";
import type { PostProps } from "../components";
import { useAuth } from "../context/AuthContext";
import { useComments } from "../hooks";
import { transformPost } from "../utils";

type FeedTab = "following" | "forYou";

export default function HomePage() {
  const { user } = useAuth();
  const pageSize = 20;
  const [followingPosts, setFollowingPosts] = useState<PostProps[]>([]);
  const [forYouPosts, setForYouPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>("forYou");
  const [followingOffset, setFollowingOffset] = useState(0);
  const [forYouOffset, setForYouOffset] = useState(0);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [hasMoreForYou, setHasMoreForYou] = useState(true);
  const scrollPositions = useRef<Record<FeedTab, number>>({
    following: 0,
    forYou: 0,
  });

  const comments = useComments();

  // Wire up reply count changes to posts state
  useEffect(() => {
    comments.setOnReplyCountChange((postId: string, delta: number) => {
      const applyReplyDelta = (prev: PostProps[]) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, replies: Math.max(0, p.replies + delta) }
            : p,
        );
      setFollowingPosts(applyReplyDelta);
      setForYouPosts(applyReplyDelta);
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

  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.current[activeTab] = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab]);

  useEffect(() => {
    const position = scrollPositions.current[activeTab] ?? 0;
    requestAnimationFrame(() => window.scrollTo({ top: position }));
  }, [activeTab]);

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [followingResponse, forYouResponse] = await Promise.all([
          postsAPI.getFeed(pageSize, 0),
          postsAPI.getForYouFeed(pageSize, 0),
        ]);
        setFollowingPosts(
          followingResponse.map((p) => transformPost(p, user?.id)),
        );
        setForYouPosts(forYouResponse.map((p) => transformPost(p, user?.id)));
        setFollowingOffset(followingResponse.length);
        setForYouOffset(forYouResponse.length);
        setHasMoreFollowing(followingResponse.length === pageSize);
        setHasMoreForYou(forYouResponse.length === pageSize);
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

  const followingPostsWithFollowState = useMemo(() => {
    const followingSet = new Set(followingIds);
    return followingPosts.map((post) => ({
      ...post,
      isFollowing: post.authorId ? followingSet.has(post.authorId) : false,
    }));
  }, [followingPosts, followingIds]);

  const forYouPostsWithFollowState = useMemo(() => {
    const followingSet = new Set(followingIds);
    return forYouPosts.map((post) => ({
      ...post,
      isFollowing: post.authorId ? followingSet.has(post.authorId) : false,
    }));
  }, [forYouPosts, followingIds]);

  const activePosts = useMemo(
    () =>
      activeTab === "following"
        ? followingPostsWithFollowState
        : forYouPostsWithFollowState,
    [activeTab, followingPostsWithFollowState, forYouPostsWithFollowState],
  );

  const combinedPosts = useMemo(
    () => [...forYouPosts, ...followingPosts],
    [forYouPosts, followingPosts],
  );

  const combinedPostsWithFollowState = useMemo(
    () => [...forYouPostsWithFollowState, ...followingPostsWithFollowState],
    [forYouPostsWithFollowState, followingPostsWithFollowState],
  );

  const activeHasMore =
    activeTab === "following" ? hasMoreFollowing : hasMoreForYou;

  const handleTabChange = (tab: FeedTab) => {
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(tab);
  };

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
      const post = combinedPosts.find((p) => p.id === postId);
      if (!post) return;

      const updatePostsById = (updater: (post: PostProps) => PostProps) => {
        setFollowingPosts((prev) =>
          prev.map((p) => (p.id === postId ? updater(p) : p)),
        );
        setForYouPosts((prev) =>
          prev.map((p) => (p.id === postId ? updater(p) : p)),
        );
      };
      try {
        if (post.liked) {
          await likesAPI.unlikePost(postId);
          updatePostsById((p) => ({
            ...p,
            liked: false,
            likes: Math.max(0, p.likes - 1),
          }));
        } else {
          await likesAPI.likePost(postId);
          updatePostsById((p) => ({ ...p, liked: true, likes: p.likes + 1 }));
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    },
    [combinedPosts, user?.id],
  );

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !activeHasMore) return;
    setIsLoadingMore(true);
    try {
      if (activeTab === "following") {
        const response = await postsAPI.getFeed(pageSize, followingOffset);
        setFollowingPosts((prev) => [
          ...prev,
          ...response.map((p) => transformPost(p, user?.id)),
        ]);
        setFollowingOffset((prev) => prev + response.length);
        setHasMoreFollowing(response.length === pageSize);
      } else {
        const response = await postsAPI.getForYouFeed(pageSize, forYouOffset);
        setForYouPosts((prev) => [
          ...prev,
          ...response.map((p) => transformPost(p, user?.id)),
        ]);
        setForYouOffset((prev) => prev + response.length);
        setHasMoreForYou(response.length === pageSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    activeHasMore,
    activeTab,
    forYouOffset,
    followingOffset,
    isLoadingMore,
    pageSize,
    user?.id,
  ]);

  const selectedPost = comments.openCommentsPostId
    ? (combinedPostsWithFollowState.find(
        (p) => p.id === comments.openCommentsPostId,
      ) ?? null)
    : null;

  return (
    <div>
      {/* Tab Navigation */}
      <div className="sticky top-[60px] z-10 border-b border-[#ececec] bg-white/80 backdrop-blur-sm">
        <div className="flex">
          <button
            onClick={() => handleTabChange("forYou")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "forYou"
                ? "text-[#1a73e8]"
                : "text-[#5f6368] hover:text-[#202124]"
            }`}
          >
            For you
          </button>
          <button
            onClick={() => handleTabChange("following")}
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
          posts={activePosts}
          isLoading={isLoading}
          onLike={handleLike}
          onReply={comments.toggleComments}
          onFollowToggle={handleFollowToggle}
        />
        {activePosts.length > 0 && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore || !activeHasMore}
              className={`rounded-full border px-5 py-2 text-[13px] font-medium transition-colors ${
                isLoadingMore || !activeHasMore
                  ? "cursor-not-allowed border-[#dadce0] text-[#9aa0a6]"
                  : "border-[#1a73e8] text-[#1a73e8] hover:bg-[#e8f0fe]"
              }`}
            >
              {isLoadingMore
                ? "Loading..."
                : activeHasMore
                  ? "Load more"
                  : "No more posts"}
            </button>
          </div>
        )}
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
