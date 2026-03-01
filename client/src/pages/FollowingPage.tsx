import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { followsAPI } from "../services/api";
import type { Follower } from "../services/api";
import { useAuth } from "../context/auth-context";
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
    <div>
      <h1 className="border-b border-white/15 p-3 text-[20px] font-medium text-white">
        Following
      </h1>

      {error && (
        <div className="rounded-none border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-white/15 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 animate-pulse rounded-none bg-white/15" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/15" />
                  <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : following.length === 0 ? (
        <div className="rounded-none border border-white/15 bg-white/5 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-[#1a73e8]/20">
            <UserCheck className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-white">
            Not following anyone yet
          </p>
          <p className="mt-1 text-[13px] text-white/60">
            People you follow will appear here.
          </p>
        </div>
      ) : (
        <div>
          {following.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[#1a73e8]/20 text-[13px] font-medium text-[#1a73e8]">
                  {item.user?.firstName?.[0] || ""}
                  {item.user?.lastName?.[0] || ""}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-white">
                    {item.user?.firstName} {item.user?.lastName}
                  </p>
                  <p className="text-[12px] text-white/60">
                    @{item.user?.username}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/users/${item.user?.id}`)}
                className="rounded-none border-white/20 bg-transparent text-white/85 hover:bg-white/10 hover:text-white"
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
