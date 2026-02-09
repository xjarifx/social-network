import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { followsAPI } from "../services/api";
import type { Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { UserCheck } from "lucide-react";

export default function FollowingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowing = async () => {
      if (!user?.id) return;
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
    <div className="space-y-5">
      <h1 className="text-[20px] font-medium text-[#202124]">Following</h1>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-[#f1f3f4] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 rounded bg-[#f1f3f4] animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-[#f1f3f4] animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f0fe]">
            <UserCheck className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-[#202124]">
            Not following anyone yet
          </p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            People you follow will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {following.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[13px] font-medium text-[#1a73e8]">
                  {item.user?.firstName?.[0] || ""}
                  {item.user?.lastName?.[0] || ""}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#202124]">
                    {item.user?.firstName} {item.user?.lastName}
                  </p>
                  <p className="text-[12px] text-[#5f6368]">
                    @{item.user?.username}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/users/${item.user?.id}`)}
                className="rounded-xl"
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
