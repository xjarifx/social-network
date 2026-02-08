import { memo } from "react";
import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";

export interface FeedProps {
  posts: PostProps[];
  isLoading?: boolean;
  showPostMenu?: boolean;
  onLike?: (postId: string) => void | Promise<void>;
  onReply?: (postId: string) => void;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
  renderPostFooter?: (post: PostProps) => React.ReactNode;
}

function FeedComponent({
  posts,
  isLoading = false,
  showPostMenu = true,
  onLike,
  onReply,
  onFollowToggle,
  renderPostFooter,
}: FeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-64 bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="space-y-3">
          <PostCard
            {...post}
            showPostMenu={showPostMenu}
            onLike={onLike}
            onReply={onReply}
            onFollowToggle={onFollowToggle}
          />
          {renderPostFooter?.(post)}
        </div>
      ))}

      {posts.length === 0 && (
        <div className="card p-12 text-center animate-fade-in">
          <div className="text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="text-brand text-lg mb-2">No posts yet</h3>
            <p className="text-muted">
              Your feed is empty. Follow people to see their posts here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export const Feed = memo(FeedComponent);
