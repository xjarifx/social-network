import type { Request, Response } from "express";
import {
  followUser,
  getFollowers,
  getFollowing,
  unfollowUser,
} from "./follow.service.js";
import { followUserSchema } from "./follow.validation.js";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const follow = async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = followUserSchema.safeParse({ body: req.body });
    if (!validation.success) {
      res.status(400).json({ error: validation.error.flatten() });
      return;
    }
    const { followingId } = validation.data.body;
    const authUserId = req.userId as string;
    const result = await followUser(authUserId, followingId!);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_INPUT":
          res.status(400).json({ error: "Invalid input" });
          return;
        case "SELF_FOLLOW":
          res.status(400).json({ error: "Cannot follow yourself" });
          return;
        case "USER_NOT_FOUND":
          res.status(404).json({ error: "User not found" });
          return;
        case "ALREADY_FOLLOWING":
          res.status(409).json({ error: "Already following this user" });
          return;
      }
    }
    res.status(500).json({ error: "Failed to follow user" });
  }
};

export const getUserFollowers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const followers = await getFollowers(ensureString(req.userId));
    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ error: "Failed to get followers" });
  }
};

export const getUserFollowing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const following = await getFollowing(ensureString(req.userId));
    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ error: "Failed to get following" });
  }
};

export const unfollow = async (req: Request, res: Response): Promise<void> => {
  try {
    const { followingId } = req.params;
    await unfollowUser(ensureString(req.userId), ensureString(followingId));
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          res.status(404).json({ error: "Follow relationship not found" });
          return;
        case "FORBIDDEN":
          res
            .status(403)
            .json({ error: "Not allowed to modify this follow relationship" });
          return;
      }
    }
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};
