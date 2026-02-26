import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getTimeline,
  getCurrentProfile,
  search,
} from "./user.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import followRouter from "../follows/follow.routes";
import {
  getUserFollowers,
  getUserFollowing,
} from "../follows/follow.controller";

const router = Router();

// USER

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     description: Returns the authenticated user's own profile.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", generalLimiter, authenticate, getCurrentProfile);

/**
 * @openapi
 * /users/search:
 *   get:
 *     tags: [Users]
 *     summary: Search users
 *     description: Search for users by name or username.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", generalLimiter, search);

/**
 * @openapi
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get user profile by ID
 *     description: Returns the public profile of a user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId", generalLimiter, getProfile);

/**
 * @openapi
 * /users/{userId}/posts:
 *   get:
 *     tags: [Users]
 *     summary: Get a user's posts (timeline)
 *     description: Returns paginated posts for a specific user.
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: User's posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId/posts", generalLimiter, authenticate, getTimeline);

/**
 * @openapi
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Update current user profile
 *     description: Update the authenticated user's profile fields.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileBody'
 *     responses:
 *       200:
 *         description: Updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/me", authenticate, updateProfile);

// FOLLOW

/**
 * @openapi
 * /users/{userId}/followers:
 *   get:
 *     tags: [Follows]
 *     summary: Get user's followers
 *     description: Returns a list of users who follow the specified user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of followers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId/followers", authenticate, getUserFollowers);

/**
 * @openapi
 * /users/{userId}/following:
 *   get:
 *     tags: [Follows]
 *     summary: Get users a user is following
 *     description: Returns a list of users the specified user follows.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of following
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserProfile'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:userId/following", authenticate, getUserFollowing);

router.use("/:userId/follow", followRouter);

export default router;
