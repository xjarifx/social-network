import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { blocksAPI } from "../services/api";
import type { BlockedUser } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Blocked users</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading blocked users...
              </div>
            ) : blocked.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No blocked users.
              </div>
            ) : (
              <div className="space-y-3">
                {blocked.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 p-3"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {item.user.firstName} {item.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{item.user.username}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleUnblock(item.user.id)}
                    >
                      Unblock
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
