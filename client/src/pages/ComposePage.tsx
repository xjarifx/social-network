import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { postsAPI } from "../services/api";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

export default function ComposePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await postsAPI.create(content.trim());
      toast.success("Post created successfully!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-4">
      <div className="rounded-lg border border-[#dadce0] bg-white p-5">
        <h2 className="text-[16px] font-medium text-[#202124]">Create post</h2>
        <p className="mt-1 text-[13px] text-[#5f6368]">
          Share an update with your network.
        </p>

        <div className="mt-4 space-y-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[140px]"
            autoFocus
          />

          {error && (
            <div className="rounded-lg border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
