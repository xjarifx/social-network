import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { notificationsAPI } from "../services/api";
import type { Notification } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await notificationsAPI.list();
      setNotifications(response.notifications);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load notifications";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    try {
      const updated = await notificationsAPI.markRead(notificationId, true);
      setNotifications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsAPI.remove(notificationId);
      setNotifications((prev) =>
        prev.filter((item) => item.id !== notificationId),
      );
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <Button onClick={loadNotifications}>Refresh</Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border p-4 ${
                      notification.read
                        ? "border-border/60"
                        : "border-primary/40 bg-primary/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm text-foreground">
                          {notification.message}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkRead(notification.id)}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(notification.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
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
