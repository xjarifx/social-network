import type { Request, Response } from "express";
import { getNotifications } from "./notification.service.js";
import { getNotificationsQuerySchema } from "./notification.validation.js";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const listNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validation = getNotificationsQuerySchema.safeParse({
      query: req.query,
    });

    if (!validation.success) {
      res.status(400).json({ error: validation.error.flatten() });
      return;
    }

    const { limit, offset } = validation.data.query;
    const userId = ensureString(req.userId);

    const result = await getNotifications(userId, limit, offset);

    res.status(200).json(result);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Unable to fetch notifications" });
  }
};
