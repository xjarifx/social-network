import { memo } from "react";
import { MessageCircle } from "lucide-react";
import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";

interface FeedProps {
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
      <div className="space-y-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border border-white/15 bg-black p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-white/10" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-3 w-24 animate-pulse rounded-lg bg-white/10" />
                  <div className="h-3 w-16 animate-pulse rounded-lg bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded-lg bg-white/10" />
                  <div className="h-3 w-4/5 animate-pulse rounded-lg bg-white/10" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-16 animate-pulse rounded-xl bg-white/10" />
                  <div className="h-7 w-16 animate-pulse rounded-xl bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {posts.map((post, index) => (
        <div key={`${post.id}-${index}`}>
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
        <div className="border border-white/15 bg-black px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <p className="text-[15px] font-medium text-white">No posts yet</p>
          <p className="mt-1 text-[13px] text-white/70">
            Your feed is empty. Follow people to see their posts here.
          </p>
        </div>
      )}
    </div>
  );
}

export const Feed = memo(FeedComponent);
