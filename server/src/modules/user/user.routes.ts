import { Router } from "express";
import { getProfile, updateProfile, getTimeline } from './user.controller';
import { authenticate } from '../../middleware/authenticate.middleware';
import postRouter from '../posts/posts.routes';
import followRouter from '../follows/follow.routes';

const router = Router();

// USER

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
