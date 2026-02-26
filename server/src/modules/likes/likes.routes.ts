import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { createLikeLimiter } from "../../middleware/rateLimit.middleware";
import {
  likePostHandler,
  unlikePostHandler,
  getPostLikesHandler,
} from "./likes.controller";

const router = Router({ mergeParams: true });

// LIKES

/**
 * @openapi
 * /posts/{postId}/likes:
 *   post:
 *     tags: [Likes]
 *     summary: Like a post
 *     description: Like a post by its ID. Duplicate likes return an error.
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
 *         description: Post liked
 *       400:
 *         description: Already liked or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.post("/", createLikeLimiter, authenticate, likePostHandler);

/**
 * @openapi
 * /posts/{postId}/likes:
 *   delete:
 *     tags: [Likes]
 *     summary: Unlike a post
 *     description: Remove a like from a post.
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
 *       200:
 *         description: Like removed
 *       400:
 *         description: Not liked or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.delete("/", createLikeLimiter, authenticate, unlikePostHandler);

/**
 * @openapi
 * /posts/{postId}/likes:
 *   get:
 *     tags: [Likes]
 *     summary: Get post likes
 *     description: Returns the list of users who liked a post.
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
 *         description: Paginated list of likers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", authenticate, getPostLikesHandler);

export default router;
