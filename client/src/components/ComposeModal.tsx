import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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

  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0fe] text-[13px] font-medium text-[#1a73e8]">
              {initials}
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#202124]">
                {userName}
              </p>
              <p className="text-[12px] text-[#5f6368]">Public</p>
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="min-h-[140px] border-none bg-transparent text-[14px] shadow-none focus-visible:ring-0 resize-none"
            autoFocus
          />

          <div className="flex items-center justify-end border-t border-[#e8eaed] pt-4">
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
