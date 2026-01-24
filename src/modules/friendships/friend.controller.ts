import type { Request, Response } from "express";
import {
  sendFriendRequest,
  getFriends,
  acceptFriendRequest,
  rejectFriendRequest,
} from "./friend.service.js";
import { sendRequestSchema } from "./friend.validation.js";
const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const sendRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = sendRequestSchema.safeParse({ body: req.body });
    if (!validation.success) {
      res.status(400).json({ error: validation.error.flatten() });
      return;
    }
    const { recipientId } = validation.data.body;
    const authUserId = req.userId as string;
    const result = await sendFriendRequest(authUserId, recipientId!);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "INVALID_INPUT":
          res.status(400).json({ error: "Invalid input" });
          return;
        case "SELF_REQUEST":
          res.status(400).json({ error: "Cannot send request to yourself" });
          return;
        case "USER_NOT_FOUND":
          res.status(404).json({ error: "Recipient not found" });
          return;
        case "REQUEST_EXISTS":
          res.status(409).json({ error: "Friend request already exists" });
          return;
        case "ALREADY_FRIENDS":
          res.status(409).json({ error: "Users are already friends" });
          return;
      }
    }
    res.status(500).json({ error: "Failed to send friend request" });
  }
};

export const getUserFriends = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const friends = await getFriends(ensureString(req.userId));
    res.status(200).json(friends);
  } catch (error) {
    res.status(500).json({ error: "Failed to get friends" });
  }
};

export const acceptRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { friendshipId } = req.params;
    const result = await acceptFriendRequest(
      ensureString(friendshipId),
      ensureString(req.userId),
    );
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          res.status(404).json({ error: "Friend request not found" });
          return;
        case "FORBIDDEN":
          res.status(403).json({ error: "Not allowed to accept this request" });
          return;
        case "INVALID_STATE":
          res.status(400).json({ error: "Request is not pending" });
          return;
      }
    }
    res.status(500).json({ error: "Failed to accept friend request" });
  }
};

export const rejectRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { friendshipId } = req.params;
    await rejectFriendRequest(ensureString(friendshipId), ensureString(req.userId));
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "NOT_FOUND":
          res.status(404).json({ error: "Friendship not found" });
          return;
        case "FORBIDDEN":
          res
            .status(403)
            .json({ error: "Not allowed to modify this friendship" });
          return;
        case "INVALID_STATE":
          res.status(400).json({ error: "Invalid friendship state" });
          return;
      }
    }
    res.status(500).json({ error: "Failed to reject/unfriend" });
  }
};
