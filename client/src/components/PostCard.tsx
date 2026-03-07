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
  Repeat2,
  BarChart3,
  Bookmark,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.article 
      className="group relative border-b border-border bg-background px-4 py-3 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-accent bg-accent text-sm font-semibold text-white">
            {initials || "U"}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {authorId && user?.id !== authorId ? (
                <Link to={`/users/${authorId}`} className="hover:underline">
                  <span className="inline-flex items-center gap-1 text-base font-bold text-text-primary">
                    {author.name}
                    <ProBadge isPro={authorPlan === "PRO"} />
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1 text-base font-bold text-text-primary">
                  {author.name}
                  <ProBadge isPro={authorPlan === "PRO"} />
                </span>
              )}
              <span className="text-base text-text-secondary">
                @{author.handle}
              </span>
              <span className="text-text-secondary">·</span>
              <span className="text-base text-text-secondary">{timestamp}</span>
              {showPrivateBadge && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-text-secondary">
                  <Lock className="h-3 w-3" />
                  Private
                </span>
              )}
            </div>

            {/* Three-dot menu */}
            {showPostMenu && (
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-full text-text-secondary opacity-0 transition-all duration-base group-hover:opacity-100 hover:bg-accent/10 hover:text-accent"
                    aria-label="Post actions"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border-border">
                  {user?.id === authorId ? (
                    <>
                      <DropdownMenuItem onClick={handleEdit} className="text-text-primary">
                        <Edit className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-500"
                        disabled={isActionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  ) : canActOnUser ? (
                    <>
                      <DropdownMenuItem onClick={handleFollow} className="text-text-primary">
                        <UserPlus className="h-4 w-4" />
                        {isFollowing ? "Unfollow" : "Follow"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={handleBlock}
                        className="text-red-500"
                        disabled={isActionLoading}
                      >
                        <Shield className="h-4 w-4" />
                        Block
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem disabled className="text-text-secondary">No actions</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Content */}
          {content.trim().length > 0 && (
            <div className="mt-1">
              <p className="whitespace-pre-wrap text-base text-text-primary">
                {content}
              </p>
            </div>
          )}

          {/* Media */}
          {image && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-border">
              {isVideoMedia ? (
                <video
                  src={image}
                  controls
                  className="h-auto max-h-[500px] w-full object-cover"
                />
              ) : (
                <img
                  src={image}
                  alt="Post media"
                  className="h-auto max-h-[500px] w-full object-cover"
                />
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex max-w-md items-center justify-between">
            <button
              onClick={() => onReply?.(id)}
              className="group/btn flex items-center gap-1 transition-colors duration-base"
            >
              <motion.div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-base group-hover/btn:bg-accent/10"
                whileTap={{ scale: 0.9 }}
              >
                <MessageCircle className="h-[18px] w-[18px] text-text-secondary transition-colors duration-base group-hover/btn:text-accent" />
              </motion.div>
              {replies > 0 && (
                <span className="text-xs text-text-secondary transition-colors duration-base group-hover/btn:text-accent">
                  {replies}
                </span>
              )}
            </button>

            <button className="group/btn flex items-center gap-1 transition-colors duration-base">
              <motion.div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-base group-hover/btn:bg-green-500/10"
                whileTap={{ scale: 0.9 }}
              >
                <Repeat2 className="h-[18px] w-[18px] text-text-secondary transition-colors duration-base group-hover/btn:text-green-500" />
              </motion.div>
            </button>

            <button
              onClick={handleLike}
              className="group/btn flex items-center gap-1 transition-colors duration-base"
            >
              <motion.div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-base group-hover/btn:bg-pink-500/10"
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart 
                    className={`h-[18px] w-[18px] transition-all duration-base ${
                      isLiked 
                        ? "fill-pink-500 text-pink-500" 
                        : "text-text-secondary group-hover/btn:text-pink-500"
                    }`}
                  />
                </motion.div>
              </motion.div>
              <AnimatePresence mode="wait">
                {likeCount > 0 && (
                  <motion.span 
                    key={likeCount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`text-xs transition-colors duration-base ${
                      isLiked 
                        ? "text-pink-500" 
                        : "text-text-secondary group-hover/btn:text-pink-500"
                    }`}
                  >
                    {likeCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button className="group/btn flex items-center gap-1 transition-colors duration-base">
              <motion.div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-base group-hover/btn:bg-accent/10"
                whileTap={{ scale: 0.9 }}
              >
                <BarChart3 className="h-[18px] w-[18px] text-text-secondary transition-colors duration-base group-hover/btn:text-accent" />
              </motion.div>
            </button>

            <button className="group/btn flex items-center gap-1 transition-colors duration-base">
              <motion.div 
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors duration-base group-hover/btn:bg-accent/10"
                whileTap={{ scale: 0.9 }}
              >
                <Bookmark className="h-[18px] w-[18px] text-text-secondary transition-colors duration-base group-hover/btn:text-accent" />
              </motion.div>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export const PostCard = memo(PostCardComponent);
