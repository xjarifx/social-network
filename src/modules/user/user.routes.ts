import { Router } from "express";
import { getProfile, updateProfile, getTimeline } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// users
router.get("/:userId", getProfile);
router.patch("/me", authenticate, updateProfile);
router.get("/:userId/posts", authenticate);

// followers
router.post("/:userId/followers", followRouter);
router.delete("/:userId/followers", followRouter);
router.get("/:userId/followers", followRouter);
router.get("/:userId/following", followRouter);

export default router;
