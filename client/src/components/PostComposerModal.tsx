import { useEffect, useRef, useState } from "react";
import { Image } from "lucide-react";
import { toast } from "sonner";
import { postsAPI } from "../services/api";
import { useAuth } from "../context/auth-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

interface PostComposerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaPickerRequestId?: number;
}

export function PostComposerModal({
  open,
  onOpenChange,
  mediaPickerRequestId,
}: PostComposerModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const maxUploadBytes = 50 * 1024 * 1024;
  const charLimit = user?.plan === "PRO" ? 100 : 20;
  const currentLength = content.length;
  const remainingChars = charLimit - currentLength;
  const isOverLimit = currentLength > charLimit;
  const isNearLimit = remainingChars <= 10 && remainingChars > 0;
  const progressPercent = Math.min((currentLength / charLimit) * 100, 100);

  let countColor = "#5f6368";
  let progressColor = "#1a73e8";
  if (isOverLimit) {
    countColor = "#d33b27";
    progressColor = "#d33b27";
  } else if (isNearLimit) {
    countColor = "#f57c00";
    progressColor = "#f57c00";
  }

  useEffect(() => {
    return () => {
      if (mediaPreviewUrl) {
        URL.revokeObjectURL(mediaPreviewUrl);
      }
    };
  }, [mediaPreviewUrl]);

  useEffect(() => {
    if (!open) {
      setContent("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setVisibility("PUBLIC");
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open || !mediaPickerRequestId) return;
    const timer = window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, mediaPickerRequestId]);

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

  const handleSubmit = async () => {
    if ((!content.trim() && !mediaFile) || isSubmitting || isOverLimit) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await postsAPI.create(content.trim(), mediaFile, visibility);
      toast.success("Post created successfully!");
      onOpenChange(false);
      window.dispatchEvent(new Event("post-created"));
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = Boolean(content.trim() || mediaFile);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/15 bg-black text-white">
        <DialogHeader>
          <DialogTitle>Create post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="What's on your mind?"
            className={`min-h-36 resize-none rounded-xl border-white/15 bg-white/5 text-[15px] text-white placeholder:text-white/45 caret-white shadow-none focus-visible:ring-1 ${isOverLimit ? "focus-visible:ring-[#d33b27]" : "focus-visible:ring-[#1a73e8]"}`}
            autoFocus
          />

          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "PUBLIC" | "PRIVATE")
                }
                className="h-9 min-w-27.5 rounded-xl border border-white/20 bg-black px-3 text-[13px] text-white focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-[13px] text-white/90 transition hover:bg-white/10"
                aria-label="Upload media"
                title="Upload media"
              >
                <Image className="h-4 w-4" />
                <span>Media</span>
              </button>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
            {visibility === "PRIVATE" && (
              <p className="mt-2 text-[11px] text-white/55">
                Only you can see this post
              </p>
            )}
          </div>

          {mediaPreviewUrl && (
            <div className="rounded-xl border border-white/20 bg-black p-3">
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
              <div className="mt-3 flex items-center justify-between text-[12px] text-white/70">
                <span>{mediaFile?.name}</span>
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="rounded-lg px-3 py-1 text-[#1a73e8] hover:bg-white/10"
                >
                  Remove media
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>
            <div className="text-[13px]" style={{ color: countColor }}>
              {currentLength}/{charLimit} characters
              {isOverLimit && (
                <span className="ml-2 font-medium">
                  ({remainingChars} over limit)
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-[#ea4335]/30 bg-[#fce8e6] px-4 py-3 text-[13px] text-[#c5221f]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting || isOverLimit}
              className="h-10 rounded-full bg-white px-6 text-black hover:bg-[#f2f2f2]"
              title={
                isOverLimit
                  ? `Post exceeds ${charLimit} character limit`
                  : "Post"
              }
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
