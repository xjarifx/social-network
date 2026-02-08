import { memo } from "react";
import { X } from "lucide-react";
import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import type { Comment as ApiComment } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

function CommentsModalComponent({
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-3xl max-h-[85vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
          <h2 className="text-brand text-lg sm:text-xl">Post</h2>
          <button onClick={onClose} className="icon-btn">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <PostCard {...post} onLike={onLike} onFollowToggle={onFollowToggle} />

          <div className="card p-4 sm:p-5">
            <div className="space-y-4">
              <div className="text-sm text-muted">Comments</div>

              <div className="flex items-center gap-2">
                <input
                  value={commentDraft}
                  onChange={(e) =>
                    onCommentDraftChange(post.id, e.target.value)
                  }
                  placeholder="Write a comment..."
                  className="input flex-1"
                />
                <button
                  className="btn-primary px-4 py-2 text-sm"
                  onClick={() => onAddComment(post.id)}
                >
                  Send
                </button>
              </div>

              {isLoading ? (
                <div className="text-sm text-muted">Loading comments...</div>
              ) : comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => {
                    const isEditing = editingCommentId === comment.id;
                    const canManage =
                      !!user?.id && comment.author?.id === user.id;

                    return (
                      <div
                        key={comment.id}
                        className="rounded-lg bg-neutral-50 px-3 py-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-xs text-muted">
                            {comment.author
                              ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
                                comment.author.username
                              : "User"}
                          </div>
                          {canManage && !isEditing && (
                            <div className="flex items-center gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => onStartEdit(post.id, comment)}
                                className="text-neutral-600 hover:text-neutral-900"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(post.id, comment.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                        {isEditing ? (
                          <div className="mt-2 space-y-2">
                            <input
                              value={commentEditDrafts[comment.id] || ""}
                              onChange={(e) =>
                                onCommentEditDraftChange(
                                  comment.id,
                                  e.target.value,
                                )
                              }
                              className="input w-full"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onSaveEdit(post.id, comment.id)}
                                className="btn-primary px-3 py-1 text-xs"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onCancelEdit(post.id, comment.id)
                                }
                                className="text-xs text-neutral-600 hover:text-neutral-900"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-neutral-900">
                            {comment.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-muted">No comments yet.</div>
              )}

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => onLoadMore(post.id)}
                    disabled={isMoreLoading}
                    className="text-sm text-neutral-600 hover:text-neutral-900 disabled:opacity-60"
                  >
                    {isMoreLoading ? "Loading..." : "More comments"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CommentsModal = memo(CommentsModalComponent);
