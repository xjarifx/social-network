import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { listNotifications } from "./notification.controller.js";

const router = Router();

// NOTIFICATIONS

// get all notifications for a user
router.get("/", authenticate, listNotifications);
// get a single notification by id
router.get("/:notificationId", authenticate, listNotifications);
// mark a notification as read
router.patch("/:notificationId", authenticate, listNotifications);
// delete a notification
router.delete("/:notificationId", authenticate, listNotifications);

export default router;
