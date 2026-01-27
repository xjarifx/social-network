import type { Request, Response } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "./comments.service.js";

export const createCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userId; // From auth middleware
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;
    const { content } = req.body;

    const comment = await createComment(userId, postId, { content });

    res.status(201).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Unable to create comment" });
  }
};

export const getCommentsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const postId = Array.isArray(req.params.postId)
      ? req.params.postId[0]
      : req.params.postId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const result = await getComments(postId, limit, offset);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "POST_NOT_FOUND") {
        res.status(404).json({ error: "Post not found" });
        return;
      }
    }
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Unable to fetch comments" });
  }
};

export const updateCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const commentId = Array.isArray(req.params.commentId)
      ? req.params.commentId[0]
      : req.params.commentId;
    const userId = (req as any).userId; // From auth middleware
    const { content } = req.body;

    const comment = await updateComment(commentId, userId, { content });

    res.status(200).json(comment);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COMMENT_NOT_FOUND") {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res.status(403).json({ error: "Cannot update other user's comment" });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Unable to update comment" });
  }
};

export const deleteCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const commentId = Array.isArray(req.params.commentId)
      ? req.params.commentId[0]
      : req.params.commentId;
    const userId = (req as any).userId; // From auth middleware

    const result = await deleteComment(commentId, userId);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COMMENT_NOT_FOUND") {
        res.status(404).json({ error: "Comment not found" });
        return;
      }
      if (error.message === "UNAUTHORIZED") {
        res.status(403).json({ error: "Cannot delete other user's comment" });
        return;
      }
    }
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Unable to delete comment" });
  }
};
