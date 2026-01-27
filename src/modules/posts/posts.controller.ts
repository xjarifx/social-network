import type { Request, Response } from "express";
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
} from "./posts.service.js";

export const createNewPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const { content } = req.body;

    const post = await createPost(userId, { content });

    res.status(201).json(post);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    console.error("Create post error:", error);
    res.status(500).json({ error: "Unable to create post" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;

    const post = await getPostById(postId);

    res.status(200).json(post);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
    }
    console.error("Get post error:", error);
    res.status(500).json({ error: "Unable to fetch post" });
  }
};

export const updatePostContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;
    const userId = (req as any).userId; // From auth middleware
    const { content } = req.body;

    const post = await updatePost(postId, userId, { content });

    res.status(200).json(post);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res.status(403).json({ error: "Cannot update other user's post" });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    console.error("Update post error:", error);
    res.status(500).json({ error: "Unable to update post" });
  }
};

export const deletePostContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;
    const userId = (req as any).userId; // From auth middleware

    const result = await deletePost(postId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res.status(403).json({ error: "Cannot delete other user's post" });
        return;
      }
    }
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Unable to delete post" });
  }
};
