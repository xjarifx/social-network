import { memo } from "react";
import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";
import { Card, CardContent } from "./ui/card";

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
  onEdit?: (postId: string, content: string) => void | Promise<void>;
  onDelete?: (postId: string) => void | Promise<void>;
  renderPostFooter?: (post: PostProps) => React.ReactNode;
}

function FeedComponent({
  posts,
  isLoading = false,
  showPostMenu = true,
  onLike,
  onReply,
  onFollowToggle,
  onEdit,
  onDelete,
  renderPostFooter,
}: FeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-3xl border border-border/60 bg-muted/60 animate-pulse"
          />
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
            onEdit={onEdit}
            onDelete={onDelete}
          />
          {renderPostFooter?.(post)}
        </div>
      ))}

      {posts.length === 0 && (
        <Card className="animate-fade-in">
          <CardContent className="p-10 text-center">
            <div className="text-4xl mb-4">🌟</div>
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Your feed is empty. Follow people to see their posts here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export const Feed = memo(FeedComponent);
