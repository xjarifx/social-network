import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { postsAPI } from "../services/api";

export default function ComposePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await postsAPI.create(content.trim());
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-[#fef5bd]"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center">
          <div className="card-container">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[#f5d580]">
                <div>
                  <h1 className="text-brand text-lg sm:text-xl font-semibold">
                    Create Post
                  </h1>
                  <p className="text-muted text-xs sm:text-sm">
                    Share an update with your network.
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="What's happening!?"
                  className="input resize-none text-lg sm:text-xl placeholder:text-[#c99820] min-h-[160px] focus:border-[#ff7000]"
                  autoFocus
                />

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end pt-4 border-t border-[#f5d580]">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="px-4 py-2 text-sm font-semibold text-[#5a412f] hover:text-[#ff7000]"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      className="btn-primary px-6 py-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Posting..." : "Post"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
