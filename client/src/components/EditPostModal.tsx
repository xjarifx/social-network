import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

interface EditPostModalProps {
  editingContent: string;
  isSaving: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onContentChange: (content: string) => void;
}

export function EditPostModal({
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
    <Dialog onOpenChange={(open: boolean) => !open && onClose()} open>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-2">
          <Textarea
            value={editingContent}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="What would you like to change?"
            className="min-h-[160px]"
            autoFocus
          />

          {error && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !editingContent.trim()}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
