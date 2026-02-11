import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  usersAPI,
  followsAPI,
  blocksAPI,
  likesAPI,
  postsAPI,
} from "../services/api";
import type { User, Follower, BlockedUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Feed, CommentsModal, EditPostModal, ProBadge } from "../components";
import type { PostProps } from "../components";
import { useComments } from "../hooks";
import { transformPost } from "../utils";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingVisibility, setEditingVisibility] = useState<
    "PUBLIC" | "PRIVATE"
  >("PUBLIC");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const comments = useComments();

  useEffect(() => {
    comments.setOnReplyCountChange((postId: string, delta: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, replies: Math.max(0, p.replies + delta) }
            : p,
        ),
      );
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow =
      comments.openCommentsPostId || editingPostId ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [comments.openCommentsPostId, editingPostId]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const current = await usersAPI.getCurrentProfile();
        setProfile(current);
        setFirstName(current.firstName || "");
        setLastName(current.lastName || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      const currentUserId = user?.id || profile?.id;
      if (!currentUserId) return;
      try {
        setPostsLoading(true);
        setPostsError(null);
        const response = await usersAPI.getUserPosts(currentUserId, 20, 0);
        setPosts(response.posts.map((p) => transformPost(p, user?.id)));
      } catch (err) {
        setPostsError(
          err instanceof Error ? err.message : "Failed to load posts",
        );
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, [profile?.id, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      followsAPI.getUserFollowers(user.id),
      followsAPI.getUserFollowing(user.id),
      blocksAPI.list(),
    ])
      .then(([f, g, b]) => {
        setFollowers(f);
        setFollowing(g);
        setBlocked(b.blocked);
      })
      .catch((err) =>
        console.error("Failed to load followers/following:", err),
      );
  }, [user?.id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await usersAPI.updateProfile({ firstName, lastName });
      setProfile(updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = useCallback(
    async (postId: string) => {
      if (!user?.id) return;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      try {
        if (post.liked) {
          await likesAPI.unlikePost(postId);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
                : p,
            ),
          );
        } else {
          await likesAPI.likePost(postId);
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p,
            ),
          );
        }
      } catch (err) {
        console.error("Failed to toggle like:", err);
      }
    },
    [posts, user?.id],
  );

  const handleEditPost = useCallback(
    (postId: string, content: string) => {
      const post = posts.find((item) => item.id === postId);
      setEditingPostId(postId);
      setEditingContent(content);
      setEditingVisibility(post?.visibility || "PUBLIC");
    },
    [posts],
  );

  const handleSaveEditPost = async () => {
    if (!editingPostId || !editingContent.trim()) {
      return;
    }

    try {
      setIsSavingEdit(true);
      await postsAPI.updatePost(
        editingPostId,
        editingContent.trim(),
        editingVisibility,
      );
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId
            ? {
                ...p,
                content: editingContent.trim(),
                visibility: editingVisibility,
              }
            : p,
        ),
      );
      setEditingPostId(null);
      setEditingContent("");
      setEditingVisibility("PUBLIC");
      toast.success("Post updated successfully!");
    } catch (err) {
      console.error("Failed to update post:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update post");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted successfully!");
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  const selectedPost = comments.openCommentsPostId
    ? (posts.find((p) => p.id === comments.openCommentsPostId) ?? null)
    : null;

  return (
    <div className="space-y-6">
      {/* Profile Hero Card */}
      <div className="overflow-hidden rounded-2xl bg-white">
        {/* Profile Info */}
        <div className="px-6 py-5">
          <div className="flex items-end gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#1a73e8] text-[24px] font-medium text-white shadow-lg">
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <div className="min-w-0 pb-1">
              <h2 className="text-[20px] font-medium text-[#202124] flex items-center gap-2">
                {profile?.firstName} {profile?.lastName}
                <ProBadge isPro={profile?.plan === "PRO"} />
              </h2>
              <p className="text-[13px] text-[#5f6368]">@{profile?.username}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={() => navigate("/followers")}
              className="flex-1 rounded-xl bg-[#f8f9fa] px-4 py-3 text-center transition hover:bg-[#f1f3f4] cursor-pointer"
            >
              <p className="text-[20px] font-medium text-[#202124]">
                {followers.length}
              </p>
              <p className="text-[12px] text-[#5f6368]">Followers</p>
            </button>
            <button
              onClick={() => navigate("/following")}
              className="flex-1 rounded-xl bg-[#f8f9fa] px-4 py-3 text-center transition hover:bg-[#f1f3f4] cursor-pointer"
            >
              <p className="text-[20px] font-medium text-[#202124]">
                {following.length}
              </p>
              <p className="text-[12px] text-[#5f6368]">Following</p>
            </button>
            <button
              onClick={() => navigate("/blocks")}
              className="flex-1 rounded-xl bg-[#f8f9fa] px-4 py-3 text-center transition hover:bg-[#f1f3f4] cursor-pointer"
            >
              <p className="text-[20px] font-medium text-[#202124]">
                {blocked.length}
              </p>
              <p className="text-[12px] text-[#5f6368]">Blocked</p>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Card */}
      <div className="rounded-2xl bg-white p-6">
        <h3 className="text-[15px] font-medium text-[#202124]">Edit profile</h3>

        <div className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          {isLoading ? (
            <p className="text-[13px] text-[#5f6368]">Loading profile...</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#5f6368]">
                    Username
                  </label>
                  <Input
                    value={profile?.username ?? ""}
                    disabled
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#5f6368]">
                    Email
                  </label>
                  <Input
                    value={profile?.email ?? ""}
                    disabled
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#5f6368]">
                    First name
                  </label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#5f6368]">
                    Last name
                  </label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl"
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Posts Section */}
      <div>
        <h3 className="mb-4 text-[15px] font-medium text-[#202124] px-1">
          Your posts
        </h3>
        {postsError && (
          <div className="mb-4 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
            {postsError}
          </div>
        )}
        <Feed
          posts={posts}
          isLoading={postsLoading}
          showPostMenu={true}
          onLike={handleLike}
          onReply={comments.toggleComments}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
        />
      </div>

      {editingPostId && (
        <EditPostModal
          editingContent={editingContent}
          visibility={editingVisibility}
          isSaving={isSavingEdit}
          onClose={() => {
            setEditingPostId(null);
            setEditingContent("");
            setEditingVisibility("PUBLIC");
          }}
          onSave={handleSaveEditPost}
          onContentChange={setEditingContent}
          onVisibilityChange={setEditingVisibility}
        />
      )}

      {comments.openCommentsPostId && selectedPost && (
        <CommentsModal
          post={selectedPost}
          commentsApi={comments}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
