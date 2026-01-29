import type { Request, Response } from "express";
import {
  getNotifications,
  getNotificationById,
  updateNotificationRead,
  deleteNotification,
} from "./notification.service.js";

export const listNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getNotifications(req.userId, req.query);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Unable to fetch notifications" });
  }
};

export const getNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const notification = await getNotificationById(req.userId, req.params);
    res.status(200).json(notification);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Get notification error:", error);
    res.status(500).json({ error: "Unable to fetch notification" });
  }
};

export const updateNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updated = await updateNotificationRead(
      req.userId,
      req.params,
      req.body,
    );
    res.status(200).json(updated);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Update notification error:", error);
    res.status(500).json({ error: "Unable to update notification" });
  }
};

export const removeNotification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await deleteNotification(req.userId, req.params);
    res.status(204).send();
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Unable to delete notification" });
  }
};
