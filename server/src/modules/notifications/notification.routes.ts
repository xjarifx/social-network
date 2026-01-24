import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { listNotifications } from "./notification.controller.js";

const router = Router();

router.get("/", authenticate, listNotifications);

export default router;
