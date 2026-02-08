import type { Post } from "../services/api";
import type { PostProps } from "../components";
import { formatPostTime } from "./formatPostTime";

/**
 * Transforms an API Post object into PostProps for the PostCard component.
 */
export function transformPost(post: Post, currentUserId?: string): PostProps {
  return {
    id: post.id,
    authorId: post.author?.id,
    author: {
      name:
        post.author?.firstName && post.author?.lastName
          ? `${post.author.firstName} ${post.author.lastName}`
          : post.author?.username || "Unknown",
      handle: post.author?.username || "user",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.id || post.author?.username || post.id}`,
    },
    content: post.content,
    timestamp: formatPostTime(post.createdAt),
    likes: post.likesCount,
    replies: post.commentsCount,
    liked: currentUserId ? post.likes?.includes(currentUserId) : false,
  };
}
