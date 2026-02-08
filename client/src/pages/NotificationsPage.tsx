import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { notificationsAPI } from "../services/api";
import type { Notification } from "../services/api";

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
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-brand text-xl font-bold">Notifications</h1>
            <button
              className="btn-primary px-4 py-2"
              onClick={loadNotifications}
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-sm text-muted">No notifications yet.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`rounded-lg border p-4 ${
                    notification.read
                      ? "border-neutral-100"
                      : "border-accent-200 bg-accent-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm text-neutral-900">
                        {notification.message}
                      </div>
                      <div className="text-xs text-muted mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button
                          className="text-xs text-accent-600"
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        className="text-xs text-red-600"
                        onClick={() => handleDelete(notification.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
