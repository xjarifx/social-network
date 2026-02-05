import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  getNotification,
  listNotifications,
  removeNotification,
  updateNotification,
} from "./notification.controller.js";

const router = Router();

// NOTIFICATIONS

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     summary: Get all notifications for a user
 */
router.get("/", authenticate, listNotifications);
/**
 * @openapi
 * /api/v1/notifications/{notificationId}:
 *   get:
 *     summary: Get a single notification
 *   patch:
 *     summary: Mark notification as read
 *   delete:
 *     summary: Delete a notification
 */
router.get("/:notificationId", authenticate, getNotification);
router.patch("/:notificationId", authenticate, updateNotification);
router.delete("/:notificationId", authenticate, removeNotification);

export default router;
