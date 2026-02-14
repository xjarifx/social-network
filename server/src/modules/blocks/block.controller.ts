import type { Request, Response } from "express";
import { blockUser, getBlockedUsers, unblockUser } from "./block.service";

export const block = async (req: Request, res: Response): Promise<void> => {
  try {
    // USER who wants to block
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // USER who will be blocked
    const username: string = req.body.username;
    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    const result = await blockUser(userId, username);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === "Cannot block yourself") {
        res.status(400).json({ error: error.message });
        return;
      }

      if (error.message === "User already blocked") {
        res.status(409).json({ error: error.message });
        return;
      }
    }

    console.error("Block user error:", error);
    res.status(500).json({ error: "Failed to block user" });
  }
};

export const unblock = async (req: Request, res: Response): Promise<void> => {
  try {
    // USER who wants to unblock
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // USER who will be unblocked
    const username: string = req.body.username;
    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required" });
      return;
    }
    const result = await unblockUser(userId, username);
    res.status(204).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "User not found") {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error.message === "Cannot unblock yourself") {
        res.status(400).json({ error: error.message });
        return;
      }
      if (error.message === "User is not blocked") {
        res.status(409).json({ error: error.message });
        return;
      }
    }
    console.error("Unblock user error:", error);
    res.status(500).json({ error: "Failed to unblock user" });
  }
};

export const getBlocked = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // USER who wants to get his/her block list
    const userId: string = req.userId as string;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // limit and offset for pagination
    const query: object = req.body.query as object;
    if (!query) {
      res.status(400).json({ error: "Query is required" });
      return;
    }

    const blocked = await getBlockedUsers(userId, query);
    res.status(200).json(blocked);
  } catch (error) {
    console.error("Get blocked users error:", error);
    res.status(500).json({ error: "Failed to get blocked users" });
  }
};
