import { memo, useRef, useState, useEffect, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Shield,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { blocksAPI, followsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  onLike?: (id: string) => void | Promise<void>;
  onReply?: (id: string) => void;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
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
  onLike,
  onReply,
  onFollowToggle,
}: PostProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsLiked(liked);
    setLikeCount(likes);
  }, [liked, likes]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) {
        return;
      }
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isMenuOpen]);

  const handleLike = useCallback(async () => {
    const previousLiked = isLiked;
    const previousLikeCount = likeCount;

    try {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

      if (onLike) {
        await onLike(id);
      }
    } catch (err) {
      setIsLiked(previousLiked);
      setLikeCount(previousLikeCount);
      console.error("Failed to toggle like:", err);
    }
  }, [isLiked, likeCount, id, onLike]);

  const canActOnUser = !!user?.id && !!authorId && user.id !== authorId;

  const handleFollow = useCallback(async () => {
    if (!canActOnUser || !authorId) {
      return;
    }

    try {
      setIsActionLoading(true);
      if (onFollowToggle) {
        await onFollowToggle(authorId, isFollowing);
      } else {
        if (!user?.id) {
          return;
        }
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
    if (!canActOnUser || !authorId) {
      return;
    }

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

  return (
    <div className="card card-hover overflow-hidden transition-all duration-200">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {authorId ? (
              <Link
                to={`/users/${authorId}`}
                className="flex items-center gap-3 min-w-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-brand text-sm sm:text-base font-semibold leading-tight truncate hover:underline">
                      {author.name}
                    </h3>
                    <span className="text-muted text-xs sm:text-sm truncate">
                      @{author.handle}
                    </span>
                    <span className="text-muted text-xs sm:text-sm">·</span>
                    <span className="text-muted text-xs sm:text-sm truncate">
                      {timestamp}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="text-brand text-sm sm:text-base font-semibold leading-tight truncate">
                      {author.name}
                    </h3>
                    <span className="text-muted text-xs sm:text-sm truncate">
                      @{author.handle}
                    </span>
                    <span className="text-muted text-xs sm:text-sm">·</span>
                    <span className="text-muted text-xs sm:text-sm truncate">
                      {timestamp}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="relative" ref={menuRef}>
            <button
              className="icon-btn transition-colors duration-200"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-[#f5d580] bg-white shadow-lg z-20 overflow-hidden">
                {canActOnUser ? (
                  <div className="flex flex-col">
                    <button
                      onClick={handleFollow}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#5a412f] hover:bg-[#fce8a0] disabled:opacity-50"
                    >
                      <UserPlus size={16} />
                      <span>{isFollowing ? "Unfollow" : "Follow"}</span>
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={isActionLoading}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Shield size={16} />
                      <span>Block</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs text-muted">
                    No actions available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-neutral-900 text-sm sm:text-base leading-relaxed">
            {content}
          </p>
        </div>

        {/* Image */}
        {image && (
          <div className="mb-4 rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={image}
              alt="Post"
              className="w-full h-auto object-cover max-h-96"
            />
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-8 border-t border-neutral-100 -mx-5 -mb-5 px-5 py-3 sm:-mx-6 sm:px-6">
          <button
            onClick={handleLike}
            className="inline-flex items-center gap-2 text-muted hover:text-neutral-900 transition-colors duration-200"
            style={{
              color: isLiked ? "#f43f5e" : undefined,
            }}
          >
            <Heart size={18} />
            <span className="text-xs sm:text-sm">{likeCount}</span>
          </button>

          <button
            onClick={() => onReply?.(id)}
            className="inline-flex items-center gap-2 text-muted hover:text-neutral-900 transition-colors duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-xs sm:text-sm">{replies}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const PostCard = memo(PostCardComponent);
