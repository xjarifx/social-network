import { useEffect, useState } from "react";
import { notificationsAPI } from "../services/api";
import type { Notification } from "../services/api";
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
    <div className="py-4">
      <div className="rounded-lg border border-[#dadce0] bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[16px] font-medium text-[#202124]">
            Notifications
          </h2>
          <Button variant="ghost" onClick={loadNotifications} size="sm">
            Refresh
          </Button>
        </div>

        <div className="border-t border-[#e8eaed] px-5 py-4">
          {error && (
            <div className="mb-4 rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-[13px] text-[#5f6368]">
              Loading notifications...
            </p>
          ) : notifications.length === 0 ? (
            <p className="text-[13px] text-[#5f6368]">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-[#e8eaed]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between gap-4 py-3 ${
                    !notification.read ? "bg-[#e8f0fe]/30 -mx-5 px-5" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] text-[#202124]">
                      {notification.message}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#5f6368]">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#1a73e8] hover:bg-[#f1f3f4] cursor-pointer"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="rounded-full px-3 py-1.5 text-[12px] font-medium text-[#ea4335] hover:bg-red-50 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
