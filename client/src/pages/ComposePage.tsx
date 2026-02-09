import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { postsAPI } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Create post</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share an update with your network.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What is on your mind?"
              className="min-h-[180px] text-base"
              autoFocus
            />

            {error && (
              <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2">
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
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
