import type { Request, Response } from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from './follow.service';

export const follow = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUserId = req.userId as string;
    const result = await followUser(authUserId, req.body);
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
    if (err.status === 409) {
      res.status(409).json({ error: err.error });
      return;
    }
    res.status(500).json({ error: "Failed to follow user" });
  }
};

export const getUserFollowers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const followers = await getFollowers(req.userId);
    res.status(200).json(followers);
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({ error: "Failed to get followers" });
  }
};

export const getUserFollowing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const following = await getFollowing(req.userId);
    res.status(200).json(following);
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({ error: "Failed to get following" });
  }
};

export const unfollow = async (req: Request, res: Response): Promise<void> => {
  try {
    await unfollowUser(req.userId as string, req.params);
    res.status(204).send();
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
    if (err.status === 403) {
      res.status(403).json({ error: err.error });
      return;
    }
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};
