import { motion, AnimatePresence } from "framer-motion";
import { X, Image, Smile } from "lucide-react";
import { useState } from "react";

export interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (content: string) => void;
  userAvatar?: string;
  userName?: string;
}

export function ComposeModal({
  isOpen,
  onClose,
  onSubmit,
  userAvatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
  userName = "User",
}: ComposeModalProps) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit?.(content);
      setContent("");
      onClose();
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.15 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.98,
      y: 12,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 12,
      transition: { duration: 0.15 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="card w-full max-w-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-neutral-100">
              <h2 className="text-brand text-lg sm:text-xl">
                What's happening!
              </h2>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="icon-btn"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* User info */}
              <div className="flex items-center gap-4">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-brand text-sm sm:text-base">
                    {userName}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm">Just now</p>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening!?"
                className="input resize-none text-lg sm:text-xl placeholder:text-neutral-400 min-h-[120px] focus:border-accent-500"
                autoFocus
              />

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="icon-btn text-accent-500 hover:text-accent-600 hover:bg-accent-50"
                  >
                    <Image size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="icon-btn text-accent-500 hover:text-accent-600 hover:bg-accent-50"
                  >
                    <Smile size={20} />
                  </motion.button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="btn-primary px-6 py-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
