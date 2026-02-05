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
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: read
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get("/", authenticate, listNotifications);
/**
 * @openapi
 * /api/v1/notifications/{notificationId}:
 *   get:
 *     summary: Get a single notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       404:
 *         description: Notification not found
 *   patch:
 *     summary: Mark notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               read:
 *                 type: boolean
 *           examples:
 *             MarkAsReadExample:
 *               value:
 *                 read: true
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       404:
 *         description: Notification not found
 *   delete:
 *     summary: Delete a notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 */
router.get("/:notificationId", authenticate, getNotification);
router.patch("/:notificationId", authenticate, updateNotification);
router.delete("/:notificationId", authenticate, removeNotification);

export default router;
