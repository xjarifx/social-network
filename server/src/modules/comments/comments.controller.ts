import type { Request, Response } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  getCommentLikes,
} from "./comments.service";

export const createCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body: object = req.body as object;
    if (!body) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    const comment = await createComment(userId, body);

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
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await getComments(userId, req.params, req.query);

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
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body: object = req.body as object;
    if (!body) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const comment = await updateComment(userId, req.params, body);

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
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await deleteComment(userId, req.params);

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

export const likeCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await likeComment(req.userId, req.params);
    res.status(201).json(result);
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
    console.error("Like comment error:", error);
    res.status(500).json({ error: "Unable to like comment" });
  }
};

export const unlikeCommentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await unlikeComment(req.userId, req.params);
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
    console.error("Unlike comment error:", error);
    res.status(500).json({ error: "Unable to unlike comment" });
  }
};

export const getCommentLikesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getCommentLikes(req.params, req.query);
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
    console.error("Get comment likes error:", error);
    res.status(500).json({ error: "Unable to fetch comment likes" });
  }
};
