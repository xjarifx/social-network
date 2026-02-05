import type { Request, Response } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from './comments.service';

export const createCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const comment = await createComment(req.userId, req.params, req.body);

    res.status(201).json(comment);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
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
    const result = await getComments(req.params, req.query);

    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
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
    const comment = await updateComment(req.userId, req.params, req.body);

    res.status(200).json(comment);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 403) {
      res.status(403).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
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
    const result = await deleteComment(req.userId, req.params);

    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 403) {
      res.status(403).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Unable to delete comment" });
  }
};
