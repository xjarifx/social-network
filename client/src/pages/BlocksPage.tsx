import { useEffect, useState } from "react";
import { blocksAPI } from "../services/api";
import type { BlockedUser } from "../services/api";

export default function BlocksPage() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
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

  const handleUnblock = async (userId: string) => {
    try {
      await blocksAPI.unblockUser(userId);
      setBlocked((prev) => prev.filter((item) => item.user.id !== userId));
    } catch (err) {
      console.error("Failed to unblock user:", err);
    }
  };

  return (
    <div className="py-4">
      <div className="rounded-lg border border-[#dadce0] bg-white">
        <div className="px-5 py-4">
          <h2 className="text-[16px] font-medium text-[#202124]">
            Blocked users
          </h2>
        </div>

        <div className="border-t border-[#e8eaed] px-5 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-[13px] text-[#5f6368]">
              Loading blocked users...
            </p>
          ) : blocked.length === 0 ? (
            <p className="text-[13px] text-[#5f6368]">No blocked users.</p>
          ) : (
            <div className="divide-y divide-[#e8eaed]">
              {blocked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-[14px] font-medium text-[#202124]">
                      {item.user.firstName} {item.user.lastName}
                    </p>
                    <p className="text-[12px] text-[#5f6368]">
                      @{item.user.username}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(item.user.id)}
                    className="rounded-full px-4 py-1.5 text-[13px] font-medium text-[#ea4335] hover:bg-red-50 cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
