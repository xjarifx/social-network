import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usersAPI, followsAPI } from "../services/api";
import type { User, Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFollow = useMemo(
    () => !!user?.id && !!userId && user.id !== userId,
    [user?.id, userId],
  );

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">User Profile</h1>

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
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
