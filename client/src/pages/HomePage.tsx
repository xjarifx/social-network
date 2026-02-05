import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { postsAPI } from "../services/api";
import { Feed, ComposeModal } from "../components";
import type { PostProps } from "../components";
import { Plus } from "lucide-react";

export function HomePage() {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const apiPosts = await postsAPI.getFeed(20, 0);

        // Transform API posts to component props
        const transformedPosts: PostProps[] = apiPosts.map((post) => ({
          id: post.id,
          author: {
            name:
              post.author?.firstName && post.author?.lastName
                ? `${post.author.firstName} ${post.author.lastName}`
                : post.author?.username || "Unknown",
            handle: post.author?.username || "user",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`,
          },
          content: post.content,
          timestamp: new Date(post.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          likes: post.likesCount,
          replies: post.commentsCount,
          reposts: 0,
          liked: post.likes?.length ? post.likes.length > 0 : false,
        }));

        setPosts(transformedPosts);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load posts";
        setError(message);
        console.error("Failed to load posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId);
      if (post?.liked) {
        // Unlike
        // Find the like to delete from API
        // await likesAPI.unlikePost(likeId);
      } else {
        // Like
        await postsAPI.getPost(postId);
        // await likesAPI.likePost(postId);
      }
      // Update local state
      setPosts(
        posts.map((p) => (p.id === postId ? { ...p, liked: !p.liked } : p)),
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleCompose = async (content: string) => {
    try {
      const newPost = await postsAPI.create(content);

      // Add to feed
      const transformedPost: PostProps = {
        id: newPost.id,
        author: {
          name:
            newPost.author?.firstName && newPost.author?.lastName
              ? `${newPost.author.firstName} ${newPost.author.lastName}`
              : newPost.author?.username || "You",
          handle: newPost.author?.username || "you",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPost.authorId}`,
        },
        content: newPost.content,
        timestamp: "now",
        likes: 0,
        replies: 0,
        reposts: 0,
        liked: false,
      };

      setPosts([transformedPost, ...posts]);
      setIsComposeOpen(false);
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-neutral-bg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Feed - takes up 2 columns on desktop */}
          <div className="md:col-span-2">
            {/* Compose button */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsComposeOpen(true)}
                className="w-full btn-primary px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Create Post</span>
              </motion.button>
            </motion.div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 bg-red-50 border border-red-200 mb-6"
              >
                <p className="text-red-700 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Feed */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Feed posts={posts} isLoading={isLoading} onLike={handleLike} />
            </motion.div>
          </div>

          {/* Empty sidebar on mobile, full on desktop */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="md:col-span-1 hidden md:block"
          >
            <div className="card p-6 sticky top-24">
              <h3 className="text-brand font-bold mb-4">Getting Started</h3>
              <div className="space-y-4 text-sm">
                <p className="text-subtle">
                  Create posts, like, and comment on posts from others in your
                  feed.
                </p>
                <p className="text-muted text-xs">
                  Your timeline updates in real-time as you interact with the
                  community.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSubmit={handleCompose}
        userName="You"
        userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
      />

      {/* Floating action button - mobile only */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 md:hidden z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsComposeOpen(true)}
          className="w-14 h-14 rounded-full bg-accent-500 text-white shadow-lg flex items-center justify-center hover:bg-accent-600 transition-colors duration-200"
        >
          <Plus size={24} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
