import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { followLimiter } from "../../middleware/rateLimit.middleware.js";
import {
  follow,
  getUserFollowers,
  getUserFollowing,
  unfollow,
} from "./follow.controller.js";

const router = Router();

/**
 * @openapi
 * /api/v1/follows:
 *   post:
 *     summary: Follow a user
 */
router.post("/", authenticate, followLimiter, follow);
/**
 * @openapi
 * /api/v1/follows/{followingId}:
 *   delete:
 *     summary: Unfollow a user
 */
router.delete("/:followingId", authenticate, followLimiter, unfollow);
/**
 * @openapi
 * /api/v1/follows/followers:
 *   get:
 *     summary: Get followers of a user
 */
router.get("/followers", authenticate, getUserFollowers);
/**
 * @openapi
 * /api/v1/follows/following:
 *   get:
 *     summary: Get users that current user is following
 */
router.get("/following", authenticate, getUserFollowing);

export default router;
