import type { Request, Response } from "express";
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getFeed,
  getForYouFeed,
} from "./posts.service";

export const getPostsFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const posts = await getFeed(userId, req.query);
    res.status(200).json(posts);
  } catch (error: unknown) {
    console.error("Get feed error:", error);
    res.status(500).json({ error: "Unable to fetch feed" });
  }
};

export const getForYouPostsFeed = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId as string;
    const posts = await getForYouFeed(userId, req.query);
    res.status(200).json(posts);
  } catch (error: unknown) {
    console.error("Get for you feed error:", error);
    res.status(500).json({ error: "Unable to fetch for you feed" });
  }
};

export const createNewPost = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const post = await createPost(
      req.userId,
      req.body,
      req.file as Express.Multer.File | undefined,
    );

    res.status(201).json(post);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      // Convert error to string if it's an object
      const errorMessage =
        typeof err.error === "string"
          ? err.error
          : err.error && typeof err.error === "object"
            ? JSON.stringify(err.error)
            : String(err.error);
      res.status(400).json({ error: errorMessage });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Create post error:", error);
    res.status(500).json({ error: "Unable to create post" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await getPostById(req.params);

    res.status(200).json(post);
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
    console.error("Get post error:", error);
    res.status(500).json({ error: "Unable to fetch post" });
  }
};

export const updatePostContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const post = await updatePost(req.userId, req.params, req.body);

    res.status(200).json(post);
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
    console.error("Update post error:", error);
    res.status(500).json({ error: "Unable to update post" });
  }
};

export const deletePostContent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await deletePost(req.userId, req.params);

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
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Unable to delete post" });
  }
};
