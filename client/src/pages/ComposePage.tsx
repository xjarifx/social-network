import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { postsAPI } from "../services/api";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";

export default function ComposePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxUploadBytes = 50 * 1024 * 1024;

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

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
    if ((!content.trim() && !mediaFile) || isSubmitting || isOverLimit) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await postsAPI.create(content.trim(), mediaFile, visibility);
      toast.success("Post created successfully!");
      setContent("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setMediaFile(null);
      setMediaPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("Please select an image or video file");
      event.target.value = "";
      return;
    }
    if (file.size > maxUploadBytes) {
      setError("File size exceeds 50 MB limit");
      event.target.value = "";
      return;
    }
    setError(null);
    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canSubmit = Boolean(content.trim() || mediaFile);

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
          className={`min-h-40 border-none bg-[#f8f9fa] rounded-xl text-[15px] shadow-none focus-visible:ring-1 ${isOverLimit ? "focus-visible:ring-[#d33b27]" : "focus-visible:ring-[#1a73e8]"} resize-none`}
          autoFocus
        />

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-[12px] font-medium text-[#5f6368]">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(event) =>
                setVisibility(event.target.value as "PUBLIC" | "PRIVATE")
              }
              className="h-9 rounded-xl border border-[#e8eaed] bg-white px-3 text-[13px] text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>
            {visibility === "PRIVATE" && (
              <span className="text-[12px] text-[#5f6368]">
                Only you can see this post
              </span>
            )}
          </div>
          <Input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            ref={fileInputRef}
            className="h-auto cursor-pointer"
          />
          {mediaPreviewUrl && (
            <div className="rounded-xl border border-[#e8eaed] bg-white p-3">
              {mediaFile?.type.startsWith("video/") ? (
                <video
                  src={mediaPreviewUrl}
                  controls
                  className="max-h-80 w-full rounded-lg"
                />
              ) : (
                <img
                  src={mediaPreviewUrl}
                  alt="Selected"
                  className="max-h-80 w-full rounded-lg object-contain"
                />
              )}
              <div className="mt-3 flex items-center justify-between text-[12px] text-[#5f6368]">
                <span>{mediaFile?.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="rounded-lg px-3 py-1 text-[#1a73e8] hover:bg-[#e8f0fe]"
                >
                  Remove media
                </button>
              </div>
            </div>
          )}
        </div>

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
            disabled={!canSubmit || isSubmitting || isOverLimit}
            className="h-11 rounded-xl bg-[#ffffff] px-8 text-black hover:bg-[#f2f2f2]"
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
