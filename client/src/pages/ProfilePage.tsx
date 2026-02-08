import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usersAPI, followsAPI, blocksAPI, likesAPI } from "../services/api";
import type { User, Follower, BlockedUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed } from "../components";
import type { PostProps } from "../components";

export function ProfilePage() {
  const { user } = useAuth();
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

          <Feed posts={posts} isLoading={postsLoading} onLike={handleLike} />
        </div>
      </div>
    </motion.div>
  );
}
