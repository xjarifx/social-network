import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { createCommentLimiter } from "../../middleware/rateLimit.middleware";
import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
  likeCommentHandler,
  unlikeCommentHandler,
  getCommentLikesHandler,
} from "./comments.controller";

const router = Router({ mergeParams: true });

// COMMENTS

/**
 * @openapi
 * /posts/{postId}/comments:
 *   post:
 *     tags: [Comments]
 *     summary: Create a comment
 *     description: Add a new comment to a post.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentBody'
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
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
router.post("/", createCommentLimiter, authenticate, createCommentHandler);

/**
 * @openapi
 * /posts/{postId}/comments:
 *   get:
 *     tags: [Comments]
 *     summary: Get post comments
 *     description: Returns paginated comments for a post.
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
 *         description: List of comments
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
router.get("/", authenticate, getCommentsHandler);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}:
 *   patch:
 *     tags: [Comments]
 *     summary: Update a comment
 *     description: Update the content of a comment you own.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentBody'
 *     responses:
 *       200:
 *         description: Updated comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the comment owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:commentId", authenticate, updateCommentHandler);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}:
 *   delete:
 *     tags: [Comments]
 *     summary: Delete a comment
 *     description: Delete a comment you own.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comment deleted
 *       403:
 *         description: Not the comment owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:commentId", authenticate, deleteCommentHandler);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}/likes:
 *   post:
 *     tags: [Likes]
 *     summary: Like a comment
 *     description: Like a comment on a post.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       201:
 *         description: Comment liked
 *       400:
 *         description: Already liked or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:commentId/likes", authenticate, likeCommentHandler);

/**
 * @openapi
 * /posts/{postId}/comments/{commentId}/likes:
 *   delete:
 *     tags: [Likes]
 *     summary: Unlike a comment
 *     description: Remove a like from a comment.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: commentId
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
 *         description: Comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:commentId/likes", authenticate, unlikeCommentHandler);

export default router;