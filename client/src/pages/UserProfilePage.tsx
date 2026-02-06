import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usersAPI, followsAPI, blocksAPI } from "../services/api";
import type { User, Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed } from "../components";
import type { PostProps } from "../components";

export function UserProfilePage() {
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
    if (!userId) {
      return;
    }
    setIsFollowing(following.some((item) => item.user?.id === userId));
  }, [following, userId]);

  const handleFollowToggle = async () => {
    if (!user?.id || !userId) {
      return;
    }

    try {
      if (isFollowing) {
        await followsAPI.unfollowUser(user.id, userId);
        setFollowing((prev) => prev.filter((item) => item.user?.id !== userId));
      } else {
        const response = await followsAPI.followUser(user.id, userId);
        setFollowing((prev) => [...prev, response]);
      }
    } catch (err) {
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

          <div className="mt-6 border-t border-neutral-100 pt-6">
            {postsError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {postsError}
              </div>
            )}

            <Feed posts={posts} isLoading={postsLoading} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
