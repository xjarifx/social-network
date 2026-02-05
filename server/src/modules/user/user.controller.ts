import type { Request, Response } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserTimeline,
} from "./user.service";

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await getUserProfile(req.params);
    res.status(200).json(user);
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
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Unable to fetch user profile" });
  }
};

export const getTimeline = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : undefined;
    const offset = req.query.offset
      ? parseInt(req.query.offset as string, 10)
      : undefined;
    const timelineData = await getUserTimeline(req.params, {
      limit: limit as unknown as number,
      offset: offset as unknown as number,
    });
    res.status(200).json(timelineData);
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
    console.error("Get timeline error:", error);
    res.status(500).json({ error: "Unable to fetch user timeline" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const currentUserId = req.userId as string;
    const updatedUser = await updateUserProfile(
      currentUserId,
      req.params,
      req.body,
    );
    res.status(200).json(updatedUser);
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
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Unable to update user profile" });
  }
};
