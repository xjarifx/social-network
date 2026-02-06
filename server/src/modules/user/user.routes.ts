import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getTimeline,
  getCurrentProfile,
} from "./user.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import postRouter from "../posts/posts.routes";
import followRouter from "../follows/follow.routes";

const router = Router();

// USER

/**
 * @openapi
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me", authenticate, getCurrentProfile);

/**
 * @openapi
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get user profile
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       404:
 *         description: User not found
 */
router.get("/:userId", getProfile);
/**
 * @openapi
 * /api/v1/users/{userId}/posts:
 *   get:
 *     summary: Get user posts
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 */
router.get("/:userId/posts", authenticate, getTimeline);
/**
 * @openapi
 * /api/v1/users/me:
 *   patch:
 *     summary: Update own profile
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *           examples:
 *             UpdateProfileExample:
 *               value:
 *                 firstName: "Jonathan"
 *                 lastName: "Smith"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 */
router.patch("/me", authenticate, updateProfile);
/**
 * @openapi
 * /api/v1/users/{userId}/posts:
 *   patch:
 *     summary: Update user posts
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
