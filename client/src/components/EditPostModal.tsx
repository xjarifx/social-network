import { memo, useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface EditPostModalProps {
  editingContent: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onContentChange: (content: string) => void;
}

function EditPostModalComponent({
  editingContent,
  isSaving,
  onClose,
  onSave,
  onContentChange,
}: EditPostModalProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!editingContent.trim()) {
      setError("Post content cannot be empty");
      return;
    }
    setError(null);
    onSave(editingContent);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-2xl max-h-[85vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-100">
          <h2 className="text-brand text-lg sm:text-xl font-semibold">
            Edit Post
          </h2>
          <button
            onClick={onClose}
            className="icon-btn transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted">
              Edit content
            </label>
            <textarea
              value={editingContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="What would you like to change?"
              className="input resize-none text-base placeholder:text-[#c99820] min-h-[120px] focus:border-[#ff7000]"
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#5a412f] hover:text-[#ff7000] transition-colors duration-200"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSave}
              disabled={isSaving || !editingContent.trim()}
              className="btn-primary px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const EditPostModal = memo(EditPostModalComponent);
