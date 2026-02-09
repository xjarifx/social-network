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
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#dadce0] bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#f1f3f4] animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-28 rounded bg-[#f1f3f4] animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-[#f1f3f4] animate-pulse" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-[#f1f3f4] animate-pulse" />
              <div className="h-3 w-4/5 rounded bg-[#f1f3f4] animate-pulse" />
              <div className="h-3 w-3/5 rounded bg-[#f1f3f4] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id}>
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
        <div className="rounded-lg border border-[#dadce0] bg-white px-6 py-12 text-center">
          <p className="text-[14px] font-medium text-[#202124]">No posts yet</p>
          <p className="mt-1 text-[13px] text-[#5f6368]">
            Your feed is empty. Follow people to see their posts here.
          </p>
        </div>
      )}
    </div>
  );
}

export const Feed = memo(FeedComponent);
