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
import { Feed, CommentsModal, EditPostModal } from "../components";
import type { PostProps } from "../components";
import { useComments } from "../hooks";
import { transformPost } from "../utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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

  const handleEditPost = useCallback((postId: string, content: string) => {
    setEditingPostId(postId);
    setEditingContent(content);
  }, []);

  const handleSaveEditPost = async () => {
    if (!editingPostId || !editingContent.trim()) {
      return;
    }

    try {
      setIsSavingEdit(true);
      await postsAPI.updatePost(editingPostId, editingContent.trim());
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPostId ? { ...p, content: editingContent.trim() } : p,
        ),
      );
      setEditingPostId(null);
      setEditingContent("");
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading profile...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Username
                      </label>
                      <Input value={profile?.username ?? ""} disabled />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Email
                      </label>
                      <Input value={profile?.email ?? ""} disabled />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs text-muted-foreground">
                        First name
                      </label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Last name
                      </label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card
              className="cursor-pointer transition hover:shadow-soft"
              onClick={() => navigate("/followers")}
            >
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Followers
                </h2>
                <p className="mt-3 text-3xl font-semibold">
                  {followers.length}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {followers.length === 0
                    ? "No followers yet."
                    : "Click to see all"}
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition hover:shadow-soft"
              onClick={() => navigate("/following")}
            >
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Following
                </h2>
                <p className="mt-3 text-3xl font-semibold">
                  {following.length}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {following.length === 0
                    ? "Not following anyone yet."
                    : "Click to see all"}
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition hover:shadow-soft"
              onClick={() => navigate("/blocks")}
            >
              <CardContent className="p-6">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  Blocked
                </h2>
                <p className="mt-3 text-3xl font-semibold">{blocked.length}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {blocked.length === 0
                    ? "No blocked users."
                    : "Click to see all"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {postsError && (
                <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {editingPostId && (
        <EditPostModal
          editingContent={editingContent}
          isSaving={isSavingEdit}
          onClose={() => {
            setEditingPostId(null);
            setEditingContent("");
          }}
          onSave={handleSaveEditPost}
          onContentChange={setEditingContent}
        />
      )}

      {comments.openCommentsPostId && selectedPost && (
        <CommentsModal
          post={selectedPost}
          comments={comments.commentsByPost[selectedPost.id] || []}
          commentDraft={comments.commentDrafts[selectedPost.id] || ""}
          isLoading={comments.commentsLoading[selectedPost.id] || false}
          isMoreLoading={comments.commentsMoreLoading[selectedPost.id] || false}
          hasMore={
            !!comments.commentMetaByPost[selectedPost.id] &&
            (comments.commentsByPost[selectedPost.id]?.length ?? 0) <
              comments.commentMetaByPost[selectedPost.id].total
          }
          editingCommentId={
            comments.editingCommentByPost[selectedPost.id] ?? null
          }
          commentEditDrafts={comments.commentEditDrafts}
          onClose={comments.handleCloseComments}
          onLike={handleLike}
          onAddComment={comments.handleAddComment}
          onCommentDraftChange={comments.setCommentDraft}
          onStartEdit={comments.handleStartEditComment}
          onCancelEdit={comments.handleCancelEditComment}
          onSaveEdit={comments.handleSaveEditComment}
          onDelete={comments.handleDeleteComment}
          onLoadMore={comments.handleLoadMoreComments}
          onCommentEditDraftChange={comments.setCommentEditDraft}
        />
      )}
    </div>
  );
}
