import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { followsAPI } from "../services/api";
import type { Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function FollowingPage() {
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
      className="min-h-screen"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Following</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading following...
              </div>
            ) : following.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Not following anyone yet.
              </div>
            ) : (
              <div className="space-y-3">
                {following.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-4"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {item.user?.firstName} {item.user?.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{item.user?.username}
                      </div>
                    </div>
                    <Button onClick={() => navigate(`/users/${item.user?.id}`)}>
                      View profile
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
