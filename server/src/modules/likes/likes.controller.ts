import type { Request, Response } from "express";
import { likePost, unlikePost, getPostLikes } from "./likes.service";

export const likePostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await likePost(req.userId, req.params);

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
    console.error("Like post error:", error);
    res.status(500).json({ error: "Unable to like post" });
  }
};

export const unlikePostHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await unlikePost(req.userId, req.params);

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
    console.error("Unlike post error:", error);
    res.status(500).json({ error: "Unable to unlike post" });
  }
};

export const getPostLikesHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getPostLikes(req.params, req.query);
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
    console.error("Get post likes error:", error);
    res.status(500).json({ error: "Unable to fetch post likes" });
  }
};
