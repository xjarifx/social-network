import { Router } from "express";
import { authenticate } from '../../middleware/authenticate.middleware';
import { followLimiter } from '../../middleware/rateLimit.middleware';
import {
  follow,
  getUserFollowers,
  getUserFollowing,
  unfollow,
} from './follow.controller';

const router = Router();

/**
 * @openapi
 * /api/v1/users/{userId}/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Follows
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - followingId
 *             properties:
 *               followingId:
 *                 type: string
 *                 format: uuid
 *           examples:
 *             FollowUserExample:
 *               value:
 *                 followingId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: User followed successfully
 *       400:
 *         description: Already following or invalid user
 */
router.post("/", authenticate, followLimiter, follow);
/**
 * @openapi
 * /api/v1/users/{userId}/follow:
 *   delete:
 *     summary: Unfollow a user
 *     tags:
 *       - Follows
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User unfollowed successfully
 *       404:
 *         description: Follow relationship not found
 */
router.delete("/:followingId", authenticate, followLimiter, unfollow);
/**
 * @openapi
 * /api/v1/users/{userId}/followers:
 *   get:
 *     summary: Get followers of a user
 *     tags:
 *       - Follows
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Followers list retrieved successfully
 */
router.get("/followers", authenticate, getUserFollowers);
/**
 * @openapi
 * /api/v1/users/{userId}/following:
 *   get:
 *     summary: Get users that current user is following
 *     tags:
 *       - Follows
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Following list retrieved successfully
 */
router.get("/following", authenticate, getUserFollowing);

export default router;
