import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { listNotifications } from "./notification.controller.js";

const router = Router();

router.get("/", authenticate, listNotifications);
router.get("/:notificationId", authenticate, listNotifications);
router.patch("/:notificationId", authenticate, listNotifications);
router.delete("/:notificationId", authenticate, listNotifications);

export default router;
