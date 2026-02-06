import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { postsAPI, likesAPI, commentsAPI } from "../services/api";
import { Feed, ComposeModal } from "../components";
import type { PostProps } from "../components";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Comment as ApiComment } from "../services/api";

export function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null,
  );
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, ApiComment[]>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean>
  >({});

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
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.id || post.author?.username || post.id}`,
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
          liked: user?.id ? post.likes?.includes(user.id) : false,
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
    if (!user?.id) {
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      if (!post) {
        return;
      }

      if (post.liked) {
        await likesAPI.unlikePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, liked: false, likes: Math.max(0, p.likes - 1) }
              : p,
          ),
        );
      } else {
        await likesAPI.likePost(postId);
        setPosts(
          posts.map((p) =>
            p.id === postId ? { ...p, liked: true, likes: p.likes + 1 } : p,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const toggleComments = async (postId: string) => {
    const nextOpen = openCommentsPostId === postId ? null : postId;
    setOpenCommentsPostId(nextOpen);

    if (nextOpen && !commentsByPost[postId]) {
      try {
        setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
        const response = await commentsAPI.getPostComments(postId);
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: response.comments,
        }));
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = (commentDrafts[postId] || "").trim();
    if (!content) {
      return;
    }

    try {
      const newComment = await commentsAPI.createComment(postId, content);
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])],
      }));
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      setPosts(
        posts.map((p) =>
          p.id === postId ? { ...p, replies: p.replies + 1 } : p,
        ),
      );
    } catch (err) {
      console.error("Failed to create comment:", err);
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
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newPost.author?.id || newPost.author?.username || newPost.id}`,
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
              <Feed
                posts={posts}
                isLoading={isLoading}
                onLike={handleLike}
                onReply={toggleComments}
                renderPostFooter={(post) =>
                  openCommentsPostId === post.id ? (
                    <div className="card p-4 sm:p-5">
                      <div className="space-y-4">
                        <div className="text-sm text-muted">Comments</div>

                        {commentsLoading[post.id] ? (
                          <div className="text-sm text-muted">
                            Loading comments...
                          </div>
                        ) : (commentsByPost[post.id] || []).length > 0 ? (
                          <div className="space-y-3">
                            {(commentsByPost[post.id] || []).map((comment) => (
                              <div
                                key={comment.id}
                                className="rounded-lg bg-neutral-50 px-3 py-2"
                              >
                                <div className="text-xs text-muted">
                                  {comment.author
                                    ? `${comment.author.firstName} ${comment.author.lastName}`.trim() ||
                                      comment.author.username
                                    : "User"}
                                </div>
                                <div className="text-sm text-neutral-900">
                                  {comment.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted">
                            No comments yet.
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            value={commentDrafts[post.id] || ""}
                            onChange={(e) =>
                              setCommentDrafts((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder="Write a comment..."
                            className="input flex-1"
                          />
                          <button
                            className="btn-primary px-4 py-2 text-sm"
                            onClick={() => handleAddComment(post.id)}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null
                }
              />
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
