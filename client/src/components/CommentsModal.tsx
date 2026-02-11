import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import { ProBadge } from "./ProBadge";
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
    const depthOffset = Math.min(depth, 4) * 20;
    const isRoot = depth === 0;
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
    const authorName = comment.author
      ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
        comment.author.username
      : "User";
    const actionIconSize = isRoot ? "h-4 w-4" : "h-3.5 w-3.5";
    const initials = authorName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return (
      <div
        key={comment.id}
        className="relative"
        style={{ paddingLeft: depthOffset }}
      >
        <div className={`flex items-start gap-3 ${isRoot ? "py-4" : "py-3"}`}>
          <div
            className={`flex shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] font-medium text-[#1a73e8] ${
              isRoot ? "h-9 w-9 text-[12px]" : "h-7 w-7 text-[10px]"
            }`}
          >
            {initials || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p
                className={`font-semibold text-[#202124] inline-flex items-center gap-1 ${
                  isRoot ? "text-[13px]" : "text-[12px]"
                }`}
              >
                {authorName}
                <ProBadge isPro={comment.author?.plan === "PRO"} />
              </p>
              {canManage && !isEditing && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px]"
                    onClick={() =>
                      commentsApi.handleStartEditComment(post.id, comment)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[11px] text-[#ea4335] hover:text-[#d93025]"
                    onClick={() =>
                      commentsApi.handleDeleteComment(post.id, comment.id)
                    }
                  >
                    Delete
                  </Button>
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
                  className={isRoot ? "h-9" : "h-8 text-[12px]"}
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
              <p
                className={`mt-1 leading-5 text-[#202124] ${
                  isRoot ? "text-[14px]" : "text-[13px]"
                }`}
              >
                {comment.content}
              </p>
            )}

            {!isEditing && (
              <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[#5f6368]">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 text-[12px] ${
                    isLiked ? "text-[#ea4335]" : "hover:text-[#202124]"
                  }`}
                  onClick={() =>
                    commentsApi.handleToggleCommentLike(post.id, comment.id)
                  }
                >
                  <Heart
                    className={`${actionIconSize} ${isLiked ? "fill-current" : ""}`}
                  />
                  <span>{likeCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[12px]"
                  onClick={() => commentsApi.toggleReplies(post.id, comment.id)}
                >
                  <MessageCircle className={actionIconSize} />
                  <span>
                    {repliesCount > 0 ? `${repliesCount} replies` : "Reply"}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {repliesExpanded && (
          <div className="ml-10 space-y-3 border-l border-[#e8eaed] pl-4">
            <div className="rounded-xl bg-[#f8f9fa] px-3 py-2">
              <p className="mb-2 text-[11px] font-medium text-[#5f6368]">
                Reply to {authorName}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  value={replyDraft}
                  onChange={(e) =>
                    commentsApi.setReplyDraft(comment.id, e.target.value)
                  }
                  placeholder="Write a reply..."
                  className="h-8 flex-1 text-[12px]"
                />
                <Button
                  onClick={() =>
                    commentsApi.handleAddReply(post.id, comment.id)
                  }
                  size="sm"
                >
                  Reply
                </Button>
              </div>
            </div>

            {repliesLoading ? (
              <p className="text-[12px] text-[#5f6368]">Loading replies...</p>
            ) : replies.length > 0 ? (
              replies.map((reply) => renderComment(reply, depth + 1))
            ) : (
              <p className="text-[12px] text-[#5f6368]">No replies yet.</p>
            )}

            {repliesHasMore && (
              <div className="flex justify-start">
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
          <div className="rounded-2xl bg-[#f8f9fa] p-4">
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
                className="h-10 flex-1"
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
