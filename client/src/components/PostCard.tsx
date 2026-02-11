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
import { useAuth } from "../context/AuthContext";
import { ProBadge } from "./ProBadge";
import { Button } from "./ui/button";
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
    if (!canActOnUser || !authorId) return;
    try {
      setIsActionLoading(true);
      await blocksAPI.blockUser(authorId);
      setIsMenuOpen(false);
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setIsActionLoading(false);
    }
  }, [canActOnUser, authorId]);

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
    <article className="group relative rounded-2xl bg-white transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)] overflow-hidden">
      {/* Top colored accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1a73e8] to-[#8ab4f8] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Three-dot menu in top right */}
      {showPostMenu && (
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded-xl p-1.5 text-[#80868b] opacity-0 group-hover:opacity-100 transition hover:bg-[#f1f3f4] cursor-pointer"
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e8f0fe] text-[15px] font-medium text-[#1a73e8]">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            {/* Author + Timestamp on same line */}
            <div className="flex items-center gap-2 flex-wrap">
              {authorId && user?.id !== authorId ? (
                <Link to={`/users/${authorId}`}>
                  <span className="text-[14px] font-medium text-[#202124] hover:underline inline-flex items-center gap-1">
                    {author.name}
                    <ProBadge isPro={authorPlan === "PRO"} />
                  </span>
                </Link>
              ) : (
                <span className="text-[14px] font-medium text-[#202124] inline-flex items-center gap-1">
                  {author.name}
                  <ProBadge isPro={authorPlan === "PRO"} />
                </span>
              )}
              <span className="text-[12px] text-[#80868b]">
                @{author.handle}
              </span>
              <span className="text-[12px] text-[#80868b]">&middot;</span>
              <span className="text-[12px] text-[#80868b]">{timestamp}</span>
              {showPrivateBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-[11px] font-medium text-[#5f6368]">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>

            {/* Content — directly under name, indented with avatar */}
            <div className="mt-2">
              {content.trim().length > 0 && (
                <p className="text-[14px] leading-[22px] text-[#3c4043] whitespace-pre-wrap">
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
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium transition cursor-pointer ${
                  isLiked
                    ? "text-[#ea4335] bg-red-50"
                    : "text-[#5f6368] hover:bg-[#f1f3f4]"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={() => onReply?.(id)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[13px] font-medium text-[#5f6368] transition hover:bg-[#f1f3f4] cursor-pointer"
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
