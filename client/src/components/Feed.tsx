import { motion } from "framer-motion";
import { PostCard } from "./PostCard";
import type { PostProps } from "./PostCard";

export interface FeedProps {
  posts: PostProps[];
  isLoading?: boolean;
  onLike?: (postId: string) => void | Promise<void>;
  onReply?: (postId: string) => void;
  onFollowToggle?: (
    authorId: string,
    isFollowing: boolean,
  ) => void | Promise<void>;
  renderPostFooter?: (post: PostProps) => React.ReactNode;
}

export function Feed({
  posts,
  isLoading = false,
  onLike,
  onReply,
  onFollowToggle,
  renderPostFooter,
}: FeedProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.05,
      },
    },
  };

  const loadingPulseVariants = {
    pulse: {
      opacity: [0.85, 1, 0.85],
      transition: {
        duration: 2.2,
        repeat: Infinity,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            variants={loadingPulseVariants}
            animate="pulse"
            className="card h-64 bg-neutral-100"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {posts.map((post) => (
        <div key={post.id} className="space-y-3">
          <PostCard
            {...post}
            onLike={onLike}
            onReply={onReply}
            onFollowToggle={onFollowToggle}
          />
          {renderPostFooter?.(post)}
        </div>
      ))}

      {posts.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="card p-12 text-center"
        >
          <div className="text-center">
            <div className="text-5xl mb-4">🌟</div>
            <h3 className="text-brand text-lg mb-2">No posts yet</h3>
            <p className="text-muted">
              Your feed is empty. Follow people to see their posts here.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
