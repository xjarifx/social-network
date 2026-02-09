import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { postsAPI } from "../services/api";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function ComposePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
    : "?";

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
    <div className="space-y-5">
      <h1 className="text-[20px] font-medium text-[#202124]">Create post</h1>

      <div className="rounded-2xl bg-white p-6">
        {/* Author header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1a73e8] text-[14px] font-medium text-white">
            {initials}
          </div>
          <div>
            <p className="text-[14px] font-medium text-[#202124]">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[12px] text-[#5f6368]">Public post</p>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What's on your mind?"
          className="min-h-[160px] border-none bg-[#f8f9fa] rounded-xl text-[15px] shadow-none focus-visible:ring-1 focus-visible:ring-[#1a73e8] resize-none"
          autoFocus
        />

        {error && (
          <div className="mt-4 rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="rounded-xl h-11 px-8"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
