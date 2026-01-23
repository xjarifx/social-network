import type { Request, Response } from "express";
import { getUserProfile, updateUserProfile } from "./user.service.js";

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;

    const user = await getUserProfile(userId);

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
        return;
      }
    }
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Unable to fetch user profile" });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId;
    const currentUserId = (req as any).userId; // From auth middleware

    // Check if user is updating their own profile
    if (userId !== currentUserId) {
      res.status(403).json({ error: "Cannot update other user's profile" });
      return;
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await updateUserProfile(userId, {
      firstName,
      lastName,
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res.status(400).json({ error: error.message });
        return;
      }
    }
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Unable to update user profile" });
  }
};
