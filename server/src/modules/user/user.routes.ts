import { Router } from "express";
import { getProfile, updateProfile, getTimeline } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import postRouter from "../posts/posts.routes.js";
import followRouter from "../follows/follow.routes.js";

const router = Router();

// USER

/**
 * @openapi
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get user profile
 */
router.get("/:userId", getProfile);
/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     summary: Update own profile
 */
router.patch("/me", authenticate, updateProfile);
/**
 * @openapi
 * /api/v1/users/{userId}/posts:
 *   patch:
 *     summary: Update user posts
 */
router.patch("/:userId/posts", postRouter);

// FOLLOW

/**
 * @openapi
 * /api/v1/users/{userId}/followers:
 *   post:
 *     summary: Follow a user
 *   delete:
 *     summary: Unfollow a user
 *   get:
 *     summary: Get followers of a user
 */
router.post("/:userId/followers", followRouter);
router.delete("/:userId/followers", followRouter);
router.get("/:userId/followers", followRouter);
/**
 * @openapi
 * /api/v1/users/{userId}/following:
 *   get:
 *     summary: Get following of a user
 */
router.get("/:userId/following", followRouter);

export default router;
