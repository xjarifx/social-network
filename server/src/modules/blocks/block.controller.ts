import type { Request, Response } from "express";
import { blockUser, getBlockedUsers, unblockUser } from "./block.service.js";

export const block = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await blockUser(req.userId, req.body);
    res.status(201).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
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
    console.error("Block user error:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
};

export const getBlocked = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const blocked = await getBlockedUsers(req.userId, req.query);
    res.status(200).json(blocked);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    console.error("Get blocked users error:", error);
    res.status(500).json({ error: "Failed to get blocked users" });
  }
};

export const unblock = async (req: Request, res: Response): Promise<void> => {
  try {
    await unblockUser(req.userId, req.params);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Unblock user error:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
};
