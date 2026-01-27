import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { likePostHandler, unlikePostHandler } from "./likes.controller.js";

const router = Router();

router.post("/", authenticate, likePostHandler);
router.delete("/", authenticate, unlikePostHandler);

export default router;
