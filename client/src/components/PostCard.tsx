import { motion } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export interface PostProps {
  id: string;
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
  onLike?: (id: string) => void;
  onReply?: (id: string) => void;
}

export function PostCard({
  id,
  author,
  content,
  image,
  timestamp,
  likes,
  replies,
  liked = false,
  onLike,
  onReply,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);

  useEffect(() => {
    setIsLiked(liked);
    setLikeCount(likes);
  }, [liked, likes]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.(id);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut", delay: 0.05 },
    },
  };

  const actionButtonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.03 },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ translateY: -1 }}
      className="card card-hover overflow-hidden transition-all duration-200"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-brand text-sm sm:text-base leading-tight truncate">
                {author.name}
              </h3>
              <p className="text-muted text-xs sm:text-sm">@{author.handle}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="icon-btn"
          >
            <MoreHorizontal size={18} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-neutral-900 text-sm sm:text-base leading-relaxed">
            {content}
          </p>
        </div>

        {/* Image */}
        {image && (
          <motion.div
            variants={imageVariants}
            className="mb-4 rounded-lg overflow-hidden bg-neutral-100"
          >
            <img
              src={image}
              alt="Post"
              className="w-full h-auto object-cover max-h-96"
            />
          </motion.div>
        )}

        {/* Metadata */}
        <div className="text-muted text-xs sm:text-sm mb-4 pb-4 border-b border-neutral-100">
          {timestamp}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-8 border-t border-neutral-100 -mx-5 -mb-5 px-5 py-3 sm:-mx-6 sm:px-6">
          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={() => onReply?.(id)}
            className="inline-flex items-center gap-2 text-muted hover:text-neutral-900 transition-colors duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-xs sm:text-sm">{replies}</span>
          </motion.button>

          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleLike}
            className="inline-flex items-center gap-2 text-muted hover:text-neutral-900 transition-colors duration-200"
            style={{
              color: isLiked ? "#f43f5e" : undefined,
            }}
          >
            <Heart size={18} />
            <span className="text-xs sm:text-sm">{likeCount}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
