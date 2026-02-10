import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import type { Comment as ApiComment } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { UseCommentsReturn } from "../hooks/useComments";
import { Heart, MessageCircle } from "lucide-react";

interface CommentsModalProps {
  post: PostProps;
  commentsApi: UseCommentsReturn;
  onClose: () => void;
  onLike: (postId: string) => void | Promise<void>;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
}

export function CommentsModal({
  post,
  commentsApi,
  onClose,
  onLike,
  onFollowToggle,
}: CommentsModalProps) {
  const { user } = useAuth();
  const comments = commentsApi.commentsByPost[post.id] || [];
  const commentDraft = commentsApi.commentDrafts[post.id] || "";
  const isLoading = commentsApi.commentsLoading[post.id] || false;
  const isMoreLoading = commentsApi.commentsMoreLoading[post.id] || false;
  const hasMore =
    !!commentsApi.commentMetaByPost[post.id] &&
    (commentsApi.commentsByPost[post.id]?.length ?? 0) <
      commentsApi.commentMetaByPost[post.id].total;
  const editingCommentId = commentsApi.editingCommentByPost[post.id] ?? null;
  const commentEditDrafts = commentsApi.commentEditDrafts;

  const renderComment = (comment: ApiComment, depth = 0) => {
    const isEditing = editingCommentId === comment.id;
    const canManage = !!user?.id && comment.author?.id === user.id;
    const replies = commentsApi.repliesByComment[comment.id] || [];
    const repliesExpanded = commentsApi.repliesExpanded[comment.id] || false;
    const replyDraft = commentsApi.replyDrafts[comment.id] || "";
    const repliesLoading = commentsApi.repliesLoading[comment.id] || false;
    const repliesMoreLoading =
      commentsApi.repliesMoreLoading[comment.id] || false;
    const replyMeta = commentsApi.replyMetaByComment[comment.id];
    const repliesHasMore =
      !!replyMeta && replies.length < (replyMeta.total || 0);
    const likeState = commentsApi.commentLikeState[comment.id];
    const likeCount = likeState?.count ?? comment.likesCount;
    const isLiked = likeState?.liked ?? false;
    const repliesCount = comment.repliesCount || 0;

    return (
      <div key={comment.id} className="space-y-2">
        <div
          className="rounded-xl bg-white px-4 py-3 shadow-sm"
          style={{ marginLeft: depth * 16 }}
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
                  onClick={() =>
                    commentsApi.handleStartEditComment(post.id, comment)
                  }
                  className="text-[#1a73e8] hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    commentsApi.handleDeleteComment(post.id, comment.id)
                  }
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
                  commentsApi.setCommentEditDraft(comment.id, e.target.value)
                }
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    commentsApi.handleSaveEditComment(post.id, comment.id)
                  }
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    commentsApi.handleCancelEditComment(post.id, comment.id)
                  }
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

          {!isEditing && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={() =>
                  commentsApi.handleToggleCommentLike(post.id, comment.id)
                }
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium transition cursor-pointer ${
                  isLiked
                    ? "text-[#ea4335] bg-red-50"
                    : "text-[#5f6368] hover:bg-[#f1f3f4]"
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`}
                />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={() => commentsApi.toggleReplies(post.id, comment.id)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium text-[#5f6368] transition hover:bg-[#f1f3f4] cursor-pointer"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>
                  {repliesCount > 0 ? `${repliesCount} replies` : "Reply"}
                </span>
              </button>
            </div>
          )}
        </div>

        {repliesExpanded && (
          <div className="space-y-2">
            <div className="ml-4 flex flex-wrap items-center gap-2">
              <Input
                value={replyDraft}
                onChange={(e) =>
                  commentsApi.setReplyDraft(comment.id, e.target.value)
                }
                placeholder="Write a reply..."
                className="flex-1"
              />
              <Button
                onClick={() => commentsApi.handleAddReply(post.id, comment.id)}
                size="sm"
              >
                Reply
              </Button>
            </div>

            {repliesLoading ? (
              <p className="ml-4 text-[12px] text-[#5f6368]">
                Loading replies...
              </p>
            ) : replies.length > 0 ? (
              replies.map((reply) => renderComment(reply, depth + 1))
            ) : (
              <p className="ml-4 text-[12px] text-[#5f6368]">No replies yet.</p>
            )}

            {repliesHasMore && (
              <div className="ml-4 flex justify-start">
                <button
                  onClick={() =>
                    commentsApi.handleLoadMoreReplies(post.id, comment.id)
                  }
                  disabled={repliesMoreLoading}
                  className="text-[12px] font-medium text-[#1a73e8] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {repliesMoreLoading ? "Loading..." : "Show more replies"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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

          <div className="rounded-2xl bg-[#f8f9fa] p-5">
            <p className="text-[12px] font-medium uppercase tracking-wide text-[#5f6368]">
              Comments
            </p>
            <div className="my-3 h-px bg-[#e8eaed]" />

            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={commentDraft}
                onChange={(e) =>
                  commentsApi.setCommentDraft(post.id, e.target.value)
                }
                placeholder="Write a comment..."
                className="flex-1"
              />
              <Button
                onClick={() => commentsApi.handleAddComment(post.id)}
                size="sm"
              >
                Send
              </Button>
            </div>

            <div className="mt-4 space-y-2">
              {isLoading ? (
                <p className="text-[13px] text-[#5f6368]">
                  Loading comments...
                </p>
              ) : comments.length > 0 ? (
                comments.map((comment) => renderComment(comment))
              ) : (
                <p className="text-[13px] text-[#5f6368]">No comments yet.</p>
              )}

              {hasMore && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => commentsApi.handleLoadMoreComments(post.id)}
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
