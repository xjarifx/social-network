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

  // Get character limit based on plan
  const charLimit = user?.plan === "PRO" ? 100 : 20;
  const currentLength = content.length;
  const remainingChars = charLimit - currentLength;
  const isOverLimit = currentLength > charLimit;
  const isNearLimit = remainingChars <= 10 && remainingChars > 0;
  const progressPercent = Math.min((currentLength / charLimit) * 100, 100);

  // Determine color based on usage
  let countColor = "#5f6368"; // default gray
  let progressColor = "#1a73e8"; // default blue
  if (isOverLimit) {
    countColor = "#d33b27"; // red
    progressColor = "#d33b27";
  } else if (isNearLimit) {
    countColor = "#f57c00"; // orange
    progressColor = "#f57c00";
  }

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting || isOverLimit) return;

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
            <p className="text-[12px] text-[#5f6368]">
              Public post {user?.plan === "PRO" && "• Pro"}
            </p>
          </div>
        </div>

        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What's on your mind?"
          className={`min-h-[160px] border-none bg-[#f8f9fa] rounded-xl text-[15px] shadow-none focus-visible:ring-1 ${isOverLimit ? "focus-visible:ring-[#d33b27]" : "focus-visible:ring-[#1a73e8]"} resize-none`}
          autoFocus
        />

        {/* Character count and progress bar */}
        <div className="mt-4 space-y-2">
          {/* Progress bar */}
          <div className="h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>

          {/* Character count and limit */}
          <div className="flex items-center justify-between">
            <div className="text-[13px]" style={{ color: countColor }}>
              {currentLength}/{charLimit} characters
              {isOverLimit && (
                <span className="ml-2 font-medium">
                  ({remainingChars} over limit)
                </span>
              )}
            </div>
            {user?.plan === "FREE" && (
              <div className="text-[12px] text-[#5f6368]">
                Upgrade to{" "}
                <span className="font-medium text-blue-600">Pro</span> for 100
                character posts
              </div>
            )}
          </div>
        </div>

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
            disabled={!content.trim() || isSubmitting || isOverLimit}
            className="rounded-xl h-11 px-8"
            title={
              isOverLimit ? `Post exceeds ${charLimit} character limit` : "Post"
            }
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
