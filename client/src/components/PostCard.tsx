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
import { Card, CardContent } from "./ui/card";
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

  const handleDelete = useCallback(async () => {
    if (!onDelete) {
      return;
    }

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
    if (onEdit) {
      onEdit(id, content);
    }
    setIsMenuOpen(false);
  }, [id, content, onEdit]);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-soft">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
              {author.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0">
              {authorId && user?.id !== authorId ? (
                <Link to={`/users/${authorId}`} className="block">
                  <div className="text-sm font-semibold text-foreground hover:underline">
                    {author.name}
                  </div>
                </Link>
              ) : (
                <div className="text-sm font-semibold text-foreground">
                  {author.name}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>@{author.handle}</span>
                <span>·</span>
                <span>{timestamp}</span>
              </div>
            </div>
          </div>

          {showPostMenu && (
            <div>
              <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Post actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
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
                        className="text-destructive"
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
                        className="text-destructive"
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
        </div>

        <div className="mt-4 space-y-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {content}
          </p>

          {image && (
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
              <img
                src={image}
                alt="Post"
                className="h-auto w-full max-h-96 object-cover"
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-6 border-t border-border/60 pt-4">
          <Button
            onClick={handleLike}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
            style={{ color: isLiked ? "#f43f5e" : undefined }}
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs font-medium">{likeCount}</span>
          </Button>
          <Button
            onClick={() => onReply?.(id)}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{replies}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const PostCard = memo(PostCardComponent);
