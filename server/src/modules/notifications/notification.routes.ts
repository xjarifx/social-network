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

// get all notifications for a user
router.get("/", authenticate, listNotifications);
// get a single notification by id
router.get("/:notificationId", authenticate, getNotification);
// mark a notification as read
router.patch("/:notificationId", authenticate, updateNotification);
// delete a notification
router.delete("/:notificationId", authenticate, removeNotification);

export default router;
