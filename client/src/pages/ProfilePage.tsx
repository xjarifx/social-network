import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usersAPI, followsAPI } from "../services/api";
import type { User, Follower } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const current = await usersAPI.getCurrentProfile();
        setProfile(current);
        setFirstName(current.firstName || "");
        setLastName(current.lastName || "");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load profile";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadFollows = async () => {
      if (!user?.id) {
        return;
      }
      try {
        const [followersResponse, followingResponse] = await Promise.all([
          followsAPI.getUserFollowers(user.id),
          followsAPI.getUserFollowing(user.id),
        ]);
        setFollowers(followersResponse);
        setFollowing(followingResponse);
      } catch (err) {
        console.error("Failed to load followers/following:", err);
      }
    };

    loadFollows();
  }, [user?.id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await usersAPI.updateProfile({ firstName, lastName });
      setProfile(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="card p-6">
          <h1 className="text-brand text-xl font-bold mb-4">Your Profile</h1>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-muted">Loading profile...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">Username</label>
                  <div className="input bg-neutral-50">{profile?.username}</div>
                </div>
                <div>
                  <label className="text-xs text-muted">Email</label>
                  <div className="input bg-neutral-50">{profile?.email}</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">First name</label>
                  <input
                    className="input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Last name</label>
                  <input
                    className="input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="btn-primary px-5 py-2"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-brand font-semibold mb-4">Followers</h2>
            {followers.length === 0 ? (
              <p className="text-sm text-muted">No followers yet.</p>
            ) : (
              <ul className="space-y-3">
                {followers.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.follower?.firstName} {item.follower?.lastName} (
                    {item.follower?.username})
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-brand font-semibold mb-4">Following</h2>
            {following.length === 0 ? (
              <p className="text-sm text-muted">Not following anyone yet.</p>
            ) : (
              <ul className="space-y-3">
                {following.map((item) => (
                  <li key={item.id} className="text-sm">
                    {item.user?.firstName} {item.user?.lastName} (
                    {item.user?.username})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
