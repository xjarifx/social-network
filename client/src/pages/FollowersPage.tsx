import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { followsAPI } from "../services/api";
import type { Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";

export default function FollowersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFollowers = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const response = await followsAPI.getUserFollowers(user.id);
        setFollowers(response);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load followers";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    loadFollowers();
  }, [user?.id]);

  return (
    <div className="py-4">
      <div className="rounded-lg border border-[#dadce0] bg-white">
        <div className="px-5 py-4">
          <h2 className="text-[16px] font-medium text-[#202124]">
            Your followers
          </h2>
        </div>

        <div className="border-t border-[#e8eaed] px-5 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-[13px] text-[#5f6368]">Loading followers...</p>
          ) : followers.length === 0 ? (
            <p className="text-[13px] text-[#5f6368]">No followers yet.</p>
          ) : (
            <div className="divide-y divide-[#e8eaed]">
              {followers.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f0fe] text-[12px] font-medium text-[#1a73e8]">
                      {item.follower?.firstName?.[0] || ""}
                      {item.follower?.lastName?.[0] || ""}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#202124]">
                        {item.follower?.firstName} {item.follower?.lastName}
                      </p>
                      <p className="text-[12px] text-[#5f6368]">
                        @{item.follower?.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/users/${item.follower?.id}`)}
                  >
                    View profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
