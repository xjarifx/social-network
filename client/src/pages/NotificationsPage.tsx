import { useEffect, useState } from "react";
import { notificationsAPI } from "../services/api";
import type { Notification } from "../services/api";
import { Bell, RefreshCw } from "lucide-react";

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/15 p-3">
        <h1 className="text-[20px] font-medium text-white">Notifications</h1>
        <button
          onClick={loadNotifications}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className="h-4.5 w-4.5" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-white/15 bg-white/5 p-5">
              <div className="space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/15" />
                <div className="h-2.5 w-1/3 animate-pulse rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="border border-white/15 bg-white/5 px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a73e8]/20">
            <Bell className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-white">All caught up!</p>
          <p className="mt-1 text-[13px] text-white/60">
            No notifications yet.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-b border-white/15 bg-white/5 p-4 transition hover:bg-white/[0.07] ${
                !notification.read ? "border-l-4 border-l-[#1a73e8]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    !notification.read ? "bg-[#1a73e8]/20" : "bg-white/10"
                  }`}
                >
                  <Bell
                    className={`h-4.5 w-4.5 ${
                      !notification.read ? "text-[#1a73e8]" : "text-white/60"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-white/90">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[12px] text-white/55">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="cursor-pointer rounded-none px-3 py-1.5 text-[12px] font-medium text-[#1a73e8] transition hover:bg-[#1a73e8]/20"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="cursor-pointer rounded-none px-3 py-1.5 text-[12px] font-medium text-[#ea4335] transition hover:bg-[#ea4335]/15"
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
  );
}
