import type { Request, Response } from "express";
import { likePost, unlikePost } from "./likes.service.js";

export const likePostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;

    const result = await likePost(userId, postId);

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (error.message === "ALREADY_LIKED") {
        res.status(400).json({ error: "Post already liked" });
        return;
      }
    }
    console.error("Like post error:", error);
    res.status(500).json({ error: "Unable to like post" });
  }
};

export const unlikePostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;

    const result = await unlikePost(userId, postId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (error.message === "LIKE_NOT_FOUND") {
        res.status(404).json({ error: "Like not found" });
        return;
      }
    }
    console.error("Unlike post error:", error);
    res.status(500).json({ error: "Unable to unlike post" });
  }
};
