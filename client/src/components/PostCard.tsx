import { memo, useState, useEffect, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { blocksAPI, followsAPI } from "../services/api";
import { useAuth } from "../context/auth-context";
import { ProBadge } from "./ProBadge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

export interface PostProps {
  id: string;
  authorId?: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  authorPlan?: "FREE" | "PRO";
  content: string;
  image?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  timestamp: string;
  likes: number;
  replies: number;
  liked?: boolean;
  isFollowing?: boolean;
  showPostMenu?: boolean;
  onLike?: (id: string) => void | Promise<void>;
  onReply?: (id: string) => void;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
  onEdit?: (id: string, content: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

function PostCardComponent({
  id,
  authorId,
  author,
  authorPlan,
  content,
  image,
  visibility = "PUBLIC",
  timestamp,
  likes,
  replies,
  liked = false,
  isFollowing = false,
  showPostMenu = true,
  onLike,
  onReply,
  onFollowToggle,
  onEdit,
  onDelete,
}: PostProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    setIsLiked(liked);
    setLikeCount(likes);
  }, [liked, likes]);

  const handleLike = useCallback(async () => {
    const previousLiked = isLiked;
    const previousLikeCount = likeCount;
    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      if (onLike) await onLike(id);
    } catch (err) {
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error("Failed to toggle like:", err);
    }
  }, [isLiked, likeCount, id, onLike]);

  const canActOnUser = !!user?.id && !!authorId && user.id !== authorId;

  const handleFollow = useCallback(async () => {
    if (!canActOnUser || !authorId) return;
    try {
      setIsActionLoading(true);
      if (onFollowToggle) {
        await onFollowToggle(authorId, isFollowing);
      } else {
        if (!user?.id) return;
        if (isFollowing) {
          await followsAPI.unfollowUser(user.id, authorId);
        } else {
          await followsAPI.followUser(user.id, authorId);
        }
      }
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to follow user:", err);
    } finally {
      setIsActionLoading(false);
    }
  }, [canActOnUser, authorId, isFollowing, onFollowToggle, user?.id]);

  const handleBlock = useCallback(async () => {
    if (!canActOnUser || !author.handle) return;
    try {
      setIsActionLoading(true);
      await blocksAPI.blockUser(author.handle);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setIsActionLoading(false);
    }
  }, [canActOnUser, author.handle]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    try {
      setIsActionLoading(true);
      await onDelete(id);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setIsActionLoading(false);
    }
  }, [id, onDelete]);

  const handleEdit = useCallback(() => {
    if (onEdit) onEdit(id, content);
    setIsMenuOpen(false);
  }, [id, content, onEdit]);

  const initials = author.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  const isVideoMedia =
    !!image &&
    (/\.(mp4|webm|ogg)(\?|#|$)/i.test(image) ||
      image.includes("/video/upload/"));

  const showPrivateBadge = visibility === "PRIVATE" && user?.id === authorId;

  return (
    <article className="group relative overflow-hidden border border-white/15 bg-black text-white transition-shadow hover:shadow-[0_1px_3px_0_rgba(0,0,0,.5),0_4px_8px_3px_rgba(0,0,0,.35)]">
      {/* Three-dot menu in top right */}
      {showPostMenu && (
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="cursor-pointer rounded-xl p-1.5 text-white/70 opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
                aria-label="Post actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user?.id === authorId ? (
                <>
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-[#ea4335]"
                    disabled={isActionLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              ) : canActOnUser ? (
                <>
                  <DropdownMenuItem onClick={handleFollow}>
                    <UserPlus className="h-4 w-4" />
                    {isFollowing ? "Unfollow" : "Follow"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleBlock}
                    className="text-[#ea4335]"
                    disabled={isActionLoading}
                  >
                    <Shield className="h-4 w-4" />
                    Block
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem disabled>No actions</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="p-5 pt-6">
        {/* Header Row */}
        <div className="flex items-start gap-4">
          {/* Large square avatar with rounded corners */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[15px] font-medium text-white">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            {/* Author + Timestamp on same line */}
            <div className="flex items-center gap-2 flex-wrap">
              {authorId && user?.id !== authorId ? (
                <Link to={`/users/${authorId}`}>
                  <span className="inline-flex items-center gap-1 text-[14px] font-medium text-white hover:underline">
                    {author.name}
                    <ProBadge isPro={authorPlan === "PRO"} />
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-[14px] font-medium text-white">
                  {author.name}
                  <ProBadge isPro={authorPlan === "PRO"} />
                </span>
              )}
              <span className="text-[12px] text-white/60">
                @{author.handle}
              </span>
              <span className="text-[12px] text-white/60">&middot;</span>
              <span className="text-[12px] text-white/60">{timestamp}</span>
              {showPrivateBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/80">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>

            {/* Content — directly under name, indented with avatar */}
            <div className="mt-2">
              {content.trim().length > 0 && (
                <p className="whitespace-pre-wrap text-[14px] leading-5.5 text-white">
                  {content}
                </p>
              )}

              {image && (
                <div
                  className={
                    content.trim().length > 0
                      ? "mt-3 overflow-hidden rounded-xl"
                      : "overflow-hidden rounded-xl"
                  }
                >
                  {isVideoMedia ? (
                    <video
                      src={image}
                      controls
                      className="h-auto w-full max-h-96 object-cover"
                    />
                  ) : (
                    <img
                      src={image}
                      alt="Post"
                      className="h-auto w-full max-h-96 object-cover"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Actions — chip style */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleLike}
                className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition ${
                  isLiked
                    ? "bg-red-500/20 text-red-400"
                    : "text-white/80 hover:bg-white/10"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={() => onReply?.(id)}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-white/80 transition hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{replies}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export const PostCard = memo(PostCardComponent);
