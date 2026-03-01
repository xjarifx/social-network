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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[20px] font-medium text-[#202124]">
          Notifications
        </h1>
        <button
          onClick={loadNotifications}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5f6368] hover:bg-[#f1f3f4] transition cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className="h-[18px] w-[18px]" />
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-5">
              <div className="space-y-2">
                <div className="h-3 w-3/4 rounded-lg bg-[#f1f3f4] animate-pulse" />
                <div className="h-2.5 w-1/3 rounded-lg bg-[#f1f3f4] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f0fe]">
            <Bell className="h-7 w-7 text-[#1a73e8]" />
          </div>
          <p className="text-[15px] font-medium text-[#202124]">
            All caught up!
          </p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            No notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-2xl bg-white p-4 transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)] ${
                !notification.read ? "border-l-4 border-l-[#1a73e8]" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    !notification.read ? "bg-[#e8f0fe]" : "bg-[#f1f3f4]"
                  }`}
                >
                  <Bell
                    className={`h-[18px] w-[18px] ${
                      !notification.read ? "text-[#1a73e8]" : "text-[#5f6368]"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-[#202124]">
                    {notification.message}
                  </p>
                  <p className="mt-1 text-[12px] text-[#80868b]">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkRead(notification.id)}
                      className="rounded-xl px-3 py-1.5 text-[12px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer transition"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="rounded-xl px-3 py-1.5 text-[12px] font-medium text-[#ea4335] hover:bg-red-50 cursor-pointer transition"
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
