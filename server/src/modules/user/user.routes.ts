import { Router } from "express";
import { getProfile, updateProfile, getTimeline } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// USER

// get user profile
router.get("/:userId", getProfile);
// update OWN profile
router.patch("/me", authenticate, updateProfile);
// User POSTS (timeline)
router.patch("/:userId/posts", postRouter);

// FOLLOW

// follow a user
router.post("/:userId/followers", followRouter);
// unfollow a user
router.delete("/:userId/followers", followRouter);
// get followers of a user
router.get("/:userId/followers", followRouter);
// get following of a user
router.get("/:userId/following", followRouter);

export default router;
