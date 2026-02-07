import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { followsAPI, usersAPI } from "../services/api";
import type { Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function FollowingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.id) {
        return;
      }
      try {
        setIsLoading(true);
        const response = await followsAPI.getUserFollowing(user.id);
        setFollowing(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load following";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFollowing();
  }, [user?.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">Following</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading following...</div>
          ) : following.length === 0 ? (
            <div className="text-sm text-muted">Not following anyone yet.</div>
          ) : (
            <div className="space-y-3">
              {following.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 hover:border-brand-500 hover:bg-brand-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-brand">
                      {item.user?.firstName} {item.user?.lastName}
                    </div>
                    <div className="text-xs text-muted">
                      @{item.user?.username}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/users/${item.user?.id}`)}
                    className="btn-primary px-4 py-2"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
