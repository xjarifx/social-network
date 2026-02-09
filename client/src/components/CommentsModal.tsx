import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import type { Comment as ApiComment } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <PostCard
            {...post}
            showPostMenu={false}
            onLike={onLike}
            onFollowToggle={onFollowToggle}
          />

          <div className="rounded-lg border border-[#dadce0] bg-white p-4">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#5f6368]">
              Comments
            </p>
            <div className="my-3 h-px bg-[#e8eaed]" />

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={commentDraft}
                onChange={(e) => onCommentDraftChange(post.id, e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button onClick={() => onAddComment(post.id)} size="sm">
                Send
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-[13px] text-[#5f6368]">
                  Loading comments...
                </p>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const isEditing = editingCommentId === comment.id;
                  const canManage =
                    !!user?.id && comment.author?.id === user.id;

                  return (
                    <div
                      key={comment.id}
                      className="rounded-lg bg-[#f8f9fa] px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[12px] font-medium text-[#5f6368]">
                          {comment.author
                            ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
                              comment.author.username
                            : "User"}
                        </p>
                        {canManage && !isEditing && (
                          <div className="flex items-center gap-3 text-[12px]">
                            <button
                              type="button"
                              onClick={() => onStartEdit(post.id, comment)}
                              className="text-[#1a73e8] hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => onDelete(post.id, comment.id)}
                              className="text-[#ea4335] hover:underline cursor-pointer"
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
                        <p className="mt-0.5 text-[14px] text-[#202124]">
                          {comment.content}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-[#5f6368]">No comments yet.</p>
              )}

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => onLoadMore(post.id)}
                    disabled={isMoreLoading}
                    className="text-[13px] font-medium text-[#1a73e8] hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    {isMoreLoading ? "Loading..." : "Show more comments"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
