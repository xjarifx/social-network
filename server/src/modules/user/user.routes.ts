import { Router } from "express";
import { getProfile, updateProfile, getTimeline } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// GET /api/users/:userId - Get user profile (public)
router.get("/:userId", getProfile);

// GET /api/users/:userId/posts - Get user's posts/timeline (public)
router.get("/:userId/posts", getTimeline);

// PATCH /api/users/:userId - Update own profile (requires auth)
router.patch("/:userId", authenticate, updateProfile);

export default router;
