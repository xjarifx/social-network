import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import {
  getNotification,
  listNotifications,
  removeNotification,
  updateNotification,
} from "./notification.controller";

const router = Router();

// NOTIFICATIONS

router.get("/", generalLimiter, authenticate, listNotifications);

router.get("/:notificationId", generalLimiter, authenticate, getNotification);
router.patch("/:notificationId", authenticate, updateNotification);
router.delete("/:notificationId", authenticate, removeNotification);

export default router;
