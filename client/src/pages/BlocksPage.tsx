import { useEffect, useState } from "react";
import { blocksAPI } from "../services/api";
import type { BlockedUser } from "../services/api";
import { ShieldOff } from "lucide-react";

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
    <div className="space-y-5">
      <h1 className="text-[20px] font-medium text-[#202124]">Blocked users</h1>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#f1f3f4] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded bg-[#f1f3f4] animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-[#f1f3f4] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : blocked.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f1f3f4]">
            <ShieldOff className="h-7 w-7 text-[#5f6368]" />
          </div>
          <p className="text-[15px] font-medium text-[#202124]">
            No blocked users
          </p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            Users you block will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {blocked.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-[12px] font-medium text-[#ea4335]">
                  {item.user.firstName[0]}
                  {item.user.lastName[0]}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#202124]">
                    {item.user.firstName} {item.user.lastName}
                  </p>
                  <p className="text-[12px] text-[#5f6368]">
                    @{item.user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleUnblock(item.user.id)}
                className="rounded-xl px-4 py-1.5 text-[13px] font-medium text-[#ea4335] hover:bg-red-50 cursor-pointer transition"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
