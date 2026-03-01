import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Image, Globe, Lock } from "lucide-react";
import { postsAPI, likesAPI, followsAPI } from "../services/api";
import { Feed, CommentsModal } from "../components";
import type { PostProps } from "../components";
import { useAuth } from "../context/auth-context";
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
  const [composerText, setComposerText] = useState("");
  const [composerVisibility, setComposerVisibility] = useState<
    "PUBLIC" | "PRIVATE"
  >("PUBLIC");
  const [isInlinePosting, setIsInlinePosting] = useState(false);
  const [inlinePostError, setInlinePostError] = useState<string | null>(null);
  const [inlineMediaFile, setInlineMediaFile] = useState<File | null>(null);
  const forYouScrollRef = useRef<HTMLDivElement | null>(null);
  const followingScrollRef = useRef<HTMLDivElement | null>(null);
  const forYouSentinelRef = useRef<HTMLDivElement | null>(null);
  const followingSentinelRef = useRef<HTMLDivElement | null>(null);
  const maxUploadBytes = 50 * 1024 * 1024;

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
    document.body.style.overflow = comments.openCommentsPostId ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [comments.openCommentsPostId]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const refreshFeeds = useCallback(async () => {
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
  }, [pageSize, user?.id]);

  // Load posts
  useEffect(() => {
    void refreshFeeds();
  }, [refreshFeeds]);

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

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;
  const charLimit = user?.plan === "PRO" ? 100 : 20;
  const charCount = composerText.length;
  const progressPercent = Math.min((charCount / charLimit) * 100, 100);
  const isOverCharLimit = charCount > charLimit;
  const canInlinePost =
    (composerText.trim().length > 0 || Boolean(inlineMediaFile)) &&
    !isInlinePosting &&
    !isOverCharLimit;

  const handleInlineMediaChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        setInlinePostError("Please select an image or video file");
        event.target.value = "";
        return;
      }

      if (file.size > maxUploadBytes) {
        setInlinePostError("File size exceeds 50 MB limit");
        event.target.value = "";
        return;
      }

      setInlinePostError(null);
      setInlineMediaFile(file);
      event.target.value = "";
    },
    [maxUploadBytes],
  );

  const handleRemoveInlineMedia = useCallback(() => {
    setInlineMediaFile(null);
  }, []);

  const toggleComposerVisibility = useCallback(() => {
    setComposerVisibility((prev) => (prev === "PUBLIC" ? "PRIVATE" : "PUBLIC"));
  }, []);

  const handleInlinePost = useCallback(async () => {
    if (
      (!composerText.trim() && !inlineMediaFile) ||
      isOverCharLimit ||
      isInlinePosting
    ) {
      return;
    }
    try {
      setIsInlinePosting(true);
      setInlinePostError(null);
      await postsAPI.create(
        composerText.trim(),
        inlineMediaFile,
        composerVisibility,
      );
      setComposerText("");
      setInlineMediaFile(null);
      setComposerVisibility("PUBLIC");
      window.dispatchEvent(new Event("post-created"));
      await refreshFeeds();
    } catch (err) {
      setInlinePostError(
        err instanceof Error ? err.message : "Failed to create post",
      );
    } finally {
      setIsInlinePosting(false);
    }
  }, [
    composerText,
    composerVisibility,
    inlineMediaFile,
    isInlinePosting,
    isOverCharLimit,
    refreshFeeds,
  ]);

  const renderComposerSection = () => (
    <section className="border-b border-white/15 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[14px] font-semibold text-white">
          {initials || "U"}
        </div>

        <div className="min-w-0 flex-1">
          <textarea
            value={composerText}
            onChange={(event) => setComposerText(event.target.value)}
            placeholder="What's happening?"
            className="h-16 w-full resize-none bg-transparent text-[18px] leading-6 text-white placeholder:text-white/45 outline-none"
          />

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#1d9bf0]">
              <label
                className="cursor-pointer"
                aria-label="Upload media"
                title="Upload media"
              >
                <Image className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleInlineMediaChange}
                />
              </label>
              <button
                type="button"
                onClick={toggleComposerVisibility}
                className="cursor-pointer"
                aria-label="Change visibility"
                title={`Visibility: ${composerVisibility.toLowerCase()}`}
              >
                {composerVisibility === "PUBLIC" ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={handleInlinePost}
              disabled={!canInlinePost}
              className={`rounded-full px-4 py-1.5 text-[15px] font-semibold text-black transition ${
                canInlinePost
                  ? "cursor-pointer bg-white hover:bg-white/85"
                  : "cursor-not-allowed bg-white/55"
              }`}
            >
              {isInlinePosting ? "Posting..." : "Post"}
            </button>
          </div>

          {inlineMediaFile && (
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/15 bg-white/5 px-3 py-2">
              <p className="truncate text-[12px] text-white/80">
                {inlineMediaFile.name}
              </p>
              <button
                type="button"
                onClick={handleRemoveInlineMedia}
                className="ml-3 shrink-0 text-[12px] text-[#1d9bf0] hover:text-[#59b8f5]"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className={`h-full transition-all ${
                isOverCharLimit ? "bg-red-500" : "bg-[#1d9bf0]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p
            className={`mt-1 text-[11px] ${
              isOverCharLimit ? "text-red-400" : "text-white/60"
            }`}
          >
            {charCount}/{charLimit} characters
          </p>
          {inlinePostError && (
            <p className="mt-1 text-[11px] text-red-400">{inlinePostError}</p>
          )}
        </div>
      </div>
    </section>
  );

  useEffect(() => {
    const sentinel =
      activeTab === "following"
        ? followingSentinelRef.current
        : forYouSentinelRef.current;
    const scrollRoot =
      activeTab === "following"
        ? followingScrollRef.current
        : forYouScrollRef.current;

    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: scrollRoot,
        rootMargin: "200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeTab, handleLoadMore]);

  useEffect(() => {
    const handlePostCreated = () => {
      void refreshFeeds();
    };
    window.addEventListener("post-created", handlePostCreated);
    return () => {
      window.removeEventListener("post-created", handlePostCreated);
    };
  }, [refreshFeeds]);

  return (
    <div className="flex min-h-[calc(100dvh-60px)] flex-col">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 border-b border-white/15 bg-black/85 backdrop-blur-sm">
        <div className="flex divide-x divide-white/10 border-b border-white/10">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "forYou"
                ? "text-white"
                : "text-white/65 hover:text-white"
            }`}
          >
            For you
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
              activeTab === "following"
                ? "text-white"
                : "text-white/65 hover:text-white"
            }`}
          >
            Following
          </button>
        </div>
        {/* Underline indicator */}
        <div className="relative h-1 bg-white/10">
          <div
            className={`absolute top-0 h-full w-1/2 bg-blue-400 transition-all duration-300 ${
              activeTab === "following" ? "translate-x-full" : ""
            }`}
          />
        </div>
      </div>

      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div
          ref={forYouScrollRef}
          className={`absolute inset-0 overflow-y-auto border-t border-white/10 scrollbar-hidden ${
            activeTab === "forYou" ? "block" : "hidden"
          }`}
        >
          {renderComposerSection()}

          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}
          <Feed
            posts={forYouPostsWithFollowState}
            isLoading={isLoading}
            onLike={handleLike}
            onReply={comments.toggleComments}
            onFollowToggle={handleFollowToggle}
          />
          <div ref={forYouSentinelRef} className="h-6" />
          {isLoadingMore && activeTab === "forYou" && (
            <div className="pb-6 text-center text-[13px] text-[#5f6368]">
              Loading...
            </div>
          )}
        </div>
        <div
          ref={followingScrollRef}
          className={`absolute inset-0 overflow-y-auto border-t border-white/10 scrollbar-hidden ${
            activeTab === "following" ? "block" : "hidden"
          }`}
        >
          {renderComposerSection()}

          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}
          <Feed
            posts={followingPostsWithFollowState}
            isLoading={isLoading}
            onLike={handleLike}
            onReply={comments.toggleComments}
            onFollowToggle={handleFollowToggle}
          />
          <div ref={followingSentinelRef} className="h-6" />
          {isLoadingMore && activeTab === "following" && (
            <div className="pb-6 text-center text-[13px] text-[#5f6368]">
              Loading...
            </div>
          )}
        </div>
      </div>

      {comments.openCommentsPostId && selectedPost && (
        <CommentsModal
          post={selectedPost}
          commentsApi={comments}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
          onFollowToggle={handleFollowToggle}
        />
      )}
    </div>
  );
}
