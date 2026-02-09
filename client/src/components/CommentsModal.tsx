import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import type { Comment as ApiComment } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface CommentsModalProps {
  post: PostProps;
  comments: ApiComment[];
  commentDraft: string;
  isLoading: boolean;
  isMoreLoading: boolean;
  hasMore: boolean;
  editingCommentId: string | null;
  commentEditDrafts: Record<string, string>;
  onClose: () => void;
  onLike: (postId: string) => void | Promise<void>;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
  onAddComment: (postId: string) => void;
  onCommentDraftChange: (postId: string, value: string) => void;
  onStartEdit: (postId: string, comment: ApiComment) => void;
  onCancelEdit: (postId: string, commentId: string) => void;
  onSaveEdit: (postId: string, commentId: string) => void;
  onDelete: (postId: string, commentId: string) => void;
  onLoadMore: (postId: string) => void;
  onCommentEditDraftChange: (commentId: string, value: string) => void;
}

export function CommentsModal({
  post,
  comments,
  commentDraft,
  isLoading,
  isMoreLoading,
  hasMore,
  editingCommentId,
  commentEditDrafts,
  onClose,
  onLike,
  onFollowToggle,
  onAddComment,
  onCommentDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onLoadMore,
  onCommentEditDraftChange,
}: CommentsModalProps) {
  const { user } = useAuth();

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-6">
          <PostCard
            {...post}
            showPostMenu={false}
            onLike={onLike}
            onFollowToggle={onFollowToggle}
          />

          <div className="rounded-3xl border border-border/60 bg-background/70 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Comments
            </div>
            <Separator className="my-3" />

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={commentDraft}
                onChange={(e) => onCommentDraftChange(post.id, e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button onClick={() => onAddComment(post.id)}>Send</Button>
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const isEditing = editingCommentId === comment.id;
                  const canManage =
                    !!user?.id && comment.author?.id === user.id;

                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl border border-border/50 bg-muted/40 px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-xs text-muted-foreground">
                          {comment.author
                            ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
                              comment.author.username
                            : "User"}
                        </div>
                        {canManage && !isEditing && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <button
                              type="button"
                              onClick={() => onStartEdit(post.id, comment)}
                              className="hover:text-foreground"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(post.id, comment.id)}
                              className="text-destructive"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <Input
                            value={commentEditDrafts[comment.id] || ""}
                            onChange={(e) =>
                              onCommentEditDraftChange(
                                comment.id,
                                e.target.value,
                              )
                            }
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => onSaveEdit(post.id, comment.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onCancelEdit(post.id, comment.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-foreground">
                          {comment.content}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground">
                  No comments yet.
                </div>
              )}

              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoadMore(post.id)}
                    disabled={isMoreLoading}
                  >
                    {isMoreLoading ? "Loading..." : "More comments"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
