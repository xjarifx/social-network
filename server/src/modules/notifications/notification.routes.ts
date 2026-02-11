import { Router } from "express";
import { authenticate } from '../../middleware/authenticate.middleware';
import {
  getNotification,
  listNotifications,
  removeNotification,
  updateNotification,
} from './notification.controller';

const router = Router();

// NOTIFICATIONS


router.get("/", authenticate, listNotifications);

router.get("/:notificationId", authenticate, getNotification);
router.patch("/:notificationId", authenticate, updateNotification);
router.delete("/:notificationId", authenticate, removeNotification);

export default router;
