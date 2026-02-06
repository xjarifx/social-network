import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { blocksAPI } from "../services/api";
import type { BlockedUser } from "../services/api";

export function BlocksPage() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [blockedId, setBlockedId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBlocked = async () => {
    try {
      setIsLoading(true);
      const response = await blocksAPI.list();
      setBlocked(response.blocked);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load blocks";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBlocked();
  }, []);

  const handleBlock = async () => {
    if (!blockedId.trim()) {
      return;
    }
    try {
      const result = await blocksAPI.blockUser(blockedId.trim());
      setBlocked((prev) => [result, ...prev]);
      setBlockedId("");
    } catch (err) {
      console.error("Failed to block user:", err);
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await blocksAPI.unblockUser(userId);
      setBlocked((prev) => prev.filter((item) => item.user.id !== userId));
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">Blocked Users</h1>
          <div className="flex items-center gap-2">
            <input
              className="input flex-1"
              placeholder="User ID to block"
              value={blockedId}
              onChange={(e) => setBlockedId(e.target.value)}
            />
            <button className="btn-primary px-4 py-2" onClick={handleBlock}>
              Block
            </button>
          </div>
        </div>

        <div className="card p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading blocked users...</div>
          ) : blocked.length === 0 ? (
            <div className="text-sm text-muted">No blocked users.</div>
          ) : (
            <div className="space-y-3">
              {blocked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-100 p-3"
                >
                  <div>
                    <div className="text-sm text-brand">
                      {item.user.firstName} {item.user.lastName}
                    </div>
                    <div className="text-xs text-muted">
                      @{item.user.username}
                    </div>
                  </div>
                  <button
                    className="text-xs text-red-600"
                    onClick={() => handleUnblock(item.user.id)}
                  >
                    Unblock
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
