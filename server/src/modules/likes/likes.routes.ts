import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { createLikeLimiter } from "../../middleware/rateLimit.middleware.js";
import { likePostHandler, unlikePostHandler } from "./likes.controller.js";

const router = Router();

// LIKES

/**
 * @openapi
 * /api/v1/posts/{postId}/likes:
 *   post:
 *     summary: Like a post
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Post liked successfully
 *       400:
 *         description: Already liked or invalid post
 */
router.post("/", authenticate, createLikeLimiter, likePostHandler);
/**
 * @openapi
 * /api/v1/posts/{postId}/likes:
 *   delete:
 *     summary: Unlike a post
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: likeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post unliked successfully
 *       404:
 *         description: Like not found
 */
router.delete("/:likeId", authenticate, unlikePostHandler);
/**
 * @openapi
 * /api/v1/posts/{postId}/likes:
 *   get:
 *     summary: Get users who liked the post
 *     tags:
 *       - Likes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Likes list retrieved successfully
 */
router.get("/", authenticate, unlikePostHandler);

export default router;
