import { memo, useState, useEffect, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Shield,
  UserPlus,
  Edit,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { blocksAPI, followsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
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
  content: string;
  image?: string;
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
  content,
  image,
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

  return (
    <div className="rounded-lg border border-[#dadce0] bg-white transition-shadow hover:shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)]">
      <div className="p-4 sm:px-5 sm:py-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] text-[13px] font-medium text-[#1a73e8]">
              {initials}
            </div>
            <div className="min-w-0">
              {authorId && user?.id !== authorId ? (
                <Link to={`/users/${authorId}`}>
                  <span className="text-[14px] font-medium text-[#202124] hover:underline">
                    {author.name}
                  </span>
                </Link>
              ) : (
                <span className="text-[14px] font-medium text-[#202124]">
                  {author.name}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#5f6368]">
                <span>@{author.handle}</span>
                <span>&middot;</span>
                <span>{timestamp}</span>
              </div>
            </div>
          </div>

          {showPostMenu && (
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full p-2 text-[#5f6368] transition hover:bg-[#f1f3f4] cursor-pointer"
                  aria-label="Post actions"
                >
                  <MoreHorizontal className="h-5 w-5" />
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
          )}
        </div>

        {/* Content */}
        <div className="mt-3">
          <p className="text-[14px] leading-[22px] text-[#3c4043] whitespace-pre-wrap">
            {content}
          </p>

          {image && (
            <div className="mt-3 overflow-hidden rounded-lg">
              <img
                src={image}
                alt="Post"
                className="h-auto w-full max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1 -ml-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[13px] font-medium transition cursor-pointer ${
              isLiked
                ? "text-[#ea4335] hover:bg-red-50"
                : "text-[#5f6368] hover:bg-[#f1f3f4]"
            }`}
          >
            <Heart
              className={`h-[18px] w-[18px] ${isLiked ? "fill-current" : ""}`}
            />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => onReply?.(id)}
            className="flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[13px] font-medium text-[#5f6368] transition hover:bg-[#f1f3f4] cursor-pointer"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span>{replies}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const PostCard = memo(PostCardComponent);
