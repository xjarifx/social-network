import { useState } from "react";
import { motion } from "framer-motion";
import type { PostProps } from "./components";

// ============================================================================
// EXAMPLE 1: Basic Feed Display
// ============================================================================

export function ExampleBasicFeed() {
  const samplePosts: PostProps[] = [
    {
      id: "1",
      author: {
        name: "Jane Doe",
        handle: "janedoe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      },
      content: "Just launched a new project! Excited to share soon.",
      timestamp: "3h ago",
      likes: 210,
      replies: 12,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Feed would display: {samplePosts} */}
      <p className="text-muted text-sm">Posts: {samplePosts.length}</p>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Compose Modal with State Management
// ============================================================================

export function ExampleComposeFlow() {
  const [showCompose, setShowCompose] = useState(false);
  const [postList, setPostList] = useState<PostProps[]>([]);

  const handleNewPost = (content: string) => {
    const newPost: PostProps = {
      id: Date.now().toString(),
      author: {
        name: "You",
        handle: "you",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
      },
      content,
      timestamp: "now",
      likes: 0,
      replies: 0,
    };
    setPostList([newPost, ...postList]);
    setShowCompose(false);
  };

  return (
    <div>
      <button
        className="btn-primary"
        onClick={() => setShowCompose(!showCompose)}
      >
        {showCompose ? "Close" : "Create Post"}
      </button>
      {showCompose && (
        <div className="card p-4 mt-4">
          <textarea
            className="input resize-none min-h-16"
            placeholder="What's on your mind?"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                const content = (e.target as HTMLTextAreaElement).value;
                if (content.trim()) {
                  handleNewPost(content);
                  (e.target as HTMLTextAreaElement).value = "";
                }
              }
            }}
          />
          <p className="text-muted text-sm mt-2">
            Posts created: {postList.length}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Custom Animation Component
// ============================================================================

export function ExampleAnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -4, shadow: "lg" }}
      className="card p-6"
    >
      <h2 className="text-brand text-lg mb-2">Animated Card</h2>
      <p className="text-subtle">
        Hovers with smooth animation and slight lift effect
      </p>
    </motion.div>
  );
}

// ============================================================================
// EXAMPLE 4: Staggered List Animation
// ============================================================================

export function ExampleStaggeredList() {
  const items = ["Item 1", "Item 2", "Item 3", "Item 4"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      {items.map((item) => (
        <motion.li key={item} variants={itemVariants} className="card p-4">
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}

// ============================================================================
// EXAMPLE 5: Modal Dialog with Framer Motion
// ============================================================================

export function ExampleModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-primary">
        Open Modal
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="card p-6 max-w-sm"
          >
            <h2 className="text-brand text-lg mb-4">Modal Dialog</h2>
            <p className="text-subtle mb-6">
              This modal scales in and out smoothly with the backdrop.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="btn-secondary px-4 py-2"
              >
                Cancel
              </button>
              <button className="btn-primary px-4 py-2">Confirm</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}

// ============================================================================
// EXAMPLE 6: Responsive Grid Layout
// ============================================================================

export function ExampleResponsiveGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Each item */}
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <motion.div
          key={item}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: item * 0.05 }}
          className="card p-6"
        >
          <div className="w-full h-32 bg-neutral-100 rounded-lg mb-4" />
          <h3 className="text-brand text-base mb-2">Card {item}</h3>
          <p className="text-muted text-sm">
            Responsive layout that adapts to screen size
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 7: Interactive Button States
// ============================================================================

export function ExampleButtonStates() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <label className="text-subtle text-sm block mb-2">Primary Button</label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary px-6 py-2"
        >
          Primary Action
        </motion.button>
      </div>

      <div>
        <label className="text-subtle text-sm block mb-2">
          Secondary Button
        </label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-secondary px-6 py-2"
        >
          Secondary Action
        </motion.button>
      </div>

      <div>
        <label className="text-subtle text-sm block mb-2">
          Ghost Button (toggles)
        </label>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setLiked(!liked)}
          className={`btn-ghost px-6 py-2 ${liked ? "text-accent-500" : ""}`}
        >
          {liked ? "❤️ Liked" : "🤍 Like"}
        </motion.button>
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 8: Form with Input Animations
// ============================================================================

export function ExampleForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 max-w-md space-y-4"
    >
      <div>
        <label className="text-brand text-sm block mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={values.name}
          onChange={handleChange}
          placeholder="Your name"
          className="input"
        />
      </div>

      <div>
        <label className="text-brand text-sm block mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          placeholder="your@email.com"
          className="input"
        />
      </div>

      <div>
        <label className="text-brand text-sm block mb-2">Message</label>
        <textarea
          name="message"
          value={values.message}
          onChange={handleChange}
          placeholder="Your message here..."
          className="input resize-none min-h-[120px]"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        className="btn-primary w-full py-2"
      >
        Send Message
      </motion.button>
    </motion.form>
  );
}

// ============================================================================
// EXAMPLE 9: Page Transition
// ============================================================================

export function ExamplePageTransition() {
  const [page, setPage] = useState(0);

  const pageVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="max-w-2xl">
      <motion.div
        key={page}
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="card p-6 mb-4"
      >
        <h2 className="text-brand text-xl mb-4">Page {page + 1}</h2>
        <p className="text-subtle">
          Page transitions smoothly slide in and out with fade effect.
        </p>
      </motion.div>

      <div className="flex gap-2">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          className="btn-secondary px-4 py-2"
          disabled={page === 0}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          className="btn-primary px-4 py-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORT EXAMPLES
// ============================================================================

export const EXAMPLES = {
  BasicFeed: ExampleBasicFeed,
  ComposeFlow: ExampleComposeFlow,
  AnimatedCard: ExampleAnimatedCard,
  StaggeredList: ExampleStaggeredList,
  Modal: ExampleModal,
  ResponsiveGrid: ExampleResponsiveGrid,
  ButtonStates: ExampleButtonStates,
  Form: ExampleForm,
  PageTransition: ExamplePageTransition,
};
