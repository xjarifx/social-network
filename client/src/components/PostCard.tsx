import { motion } from "framer-motion";
import { MessageCircle, Share, Repeat2, MoreHorizontal } from "lucide-react";
import { useState } from "react";

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
  reposts: number;
  liked?: boolean;
  onLike?: (id: string) => void;
}

export function PostCard({
  id,
  author,
  content,
  image,
  timestamp,
  likes,
  replies,
  reposts,
  liked = false,
  onLike,
}: PostProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.(id);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut", delay: 0.1 },
    },
  };

  const actionButtonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ translateY: -2 }}
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
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
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

        {/* Stats - hide on very small screens */}
        <div className="hidden sm:grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-muted">
            <span className="font-semibold text-neutral-900">{replies}</span>{" "}
            replies
          </div>
          <div className="text-muted">
            <span className="font-semibold text-neutral-900">{reposts}</span>{" "}
            reposts
          </div>
          <div className="text-muted">
            <span className="font-semibold text-neutral-900">{likeCount}</span>{" "}
            likes
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between divide-x divide-neutral-100 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6">
          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-muted hover:text-accent-600 hover:bg-accent-50 transition-colors duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-xs sm:text-sm hidden sm:inline">Reply</span>
          </motion.button>

          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-muted hover:text-accent-600 hover:bg-accent-50 transition-colors duration-200"
          >
            <Repeat2 size={18} />
            <span className="text-xs sm:text-sm hidden sm:inline">Repost</span>
          </motion.button>

          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onClick={handleLike}
            className="flex-1 flex items-center justify-center gap-2 py-3 transition-colors duration-200"
            style={{
              color: isLiked ? "#22c55e" : "currentColor",
            }}
          >
            <motion.svg
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </motion.svg>
            <span className="text-xs sm:text-sm hidden sm:inline">
              {likeCount}
            </span>
          </motion.button>

          <motion.button
            variants={actionButtonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            className="flex-1 flex items-center justify-center gap-2 py-3 text-muted hover:text-accent-600 hover:bg-accent-50 transition-colors duration-200"
          >
            <Share size={18} />
            <span className="text-xs sm:text-sm hidden sm:inline">Share</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
