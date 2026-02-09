import { useState } from "react";
import { Image, Smile } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6">
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="h-12 w-12 rounded-2xl object-cover"
            />
            <div>
              <div className="text-sm font-semibold text-foreground">
                {userName}
              </div>
              <div className="text-xs text-muted-foreground">Just now</div>
            </div>
          </div>

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share today?"
            className="min-h-[160px] text-base"
            autoFocus
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Button variant="ghost" size="icon" aria-label="Add image">
                <Image className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Add emoji">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleSubmit} disabled={!content.trim()}>
              Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
