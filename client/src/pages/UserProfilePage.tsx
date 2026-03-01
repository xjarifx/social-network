import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { usersAPI, followsAPI, blocksAPI, likesAPI } from "../services/api";
import type { User, Follower } from "../services/api";
import { useAuth } from "../context/auth-context";
import { Feed, CommentsModal, ProBadge } from "../components";
import type { PostProps } from "../components";
import { useComments } from "../hooks";
import { transformPost } from "../utils";
import { Button } from "../components/ui/button";

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
  }, []);

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
        setPostsError(
          err instanceof Error ? err.message : "Failed to load posts",
        ),
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

  const postsWithFollowState = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      isFollowing,
    }));
  }, [posts, isFollowing]);

  const selectedPost = comments.openCommentsPostId
    ? (postsWithFollowState.find((p) => p.id === comments.openCommentsPostId) ??
      null)
    : null;

  const handleFollowTogglePost = useCallback(
    async (authorId: string) => {
      if (authorId !== userId) return;
      await handleFollowToggle();
    },
    [userId],
  );

  return (
    <div className="space-y-6">
      {/* Profile Hero */}
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="px-6 py-5">
          {error && (
            <div className="mb-4 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-6">
              <p className="text-[13px] text-[#5f6368]">Loading user...</p>
            </div>
          ) : (
            <>
              <div className="flex items-end gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#e8f0fe] text-[20px] font-medium text-[#1a73e8] shadow-lg">
                  {profile?.firstName?.[0] || ""}
                  {profile?.lastName?.[0] || ""}
                </div>
                <div className="flex flex-1 items-center justify-between gap-4 pb-1">
                  <div>
                    <p className="text-[20px] font-medium text-[#202124] flex items-center gap-2">
                      {profile?.firstName} {profile?.lastName}
                      <ProBadge isPro={profile?.plan === "PRO"} />
                    </p>
                    <p className="text-[13px] text-[#5f6368]">
                      @{profile?.username}
                    </p>
                  </div>
                  {canFollow && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isFollowing ? "secondary" : "default"}
                        onClick={handleFollowToggle}
                        className="rounded-xl"
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleBlock}
                        disabled={isBlocking}
                        className="rounded-xl text-[#ea4335] hover:text-[#ea4335]"
                      >
                        {isBlocking ? "..." : "Block"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Posts */}
      <div>
        <h3 className="mb-4 text-[15px] font-medium text-[#202124] px-1">
          Posts
        </h3>
        {postsError && (
          <div className="mb-4 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
            {postsError}
          </div>
        )}
        <Feed
          posts={postsWithFollowState}
          isLoading={postsLoading}
          showPostMenu={false}
          onLike={handleLike}
          onReply={comments.toggleComments}
          onFollowToggle={handleFollowTogglePost}
        />
      </div>

      {comments.openCommentsPostId && selectedPost && (
        <CommentsModal
          post={selectedPost}
          commentsApi={comments}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
          onFollowToggle={handleFollowTogglePost}
        />
      )}
    </div>
  );
}
