import { Router } from "express";
import { authenticate } from '../../middleware/authenticate.middleware';
import { createCommentLimiter } from '../../middleware/rateLimit.middleware';
import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from './comments.controller';

const router = Router();

// COMMENTS

/**
 * @openapi
 * /api/v1/posts/{postId}/comments:
 *   post:
 *     summary: Create a comment
 *     tags:
 *       - Comments
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
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *           examples:
 *             CreateCommentExample:
 *               value:
 *                 content: "This is a great post! Thanks for sharing."
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authenticate, createCommentLimiter, createCommentHandler);
/**
 * @openapi
 * /api/v1/posts/{postId}/comments:
 *   get:
 *     summary: Get all comments on the post
 *     tags:
 *       - Comments
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
 *           default: 10
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 */
router.get("/", getCommentsHandler);
/**
 * @openapi
 * /api/v1/posts/{postId}/comments/{commentId}:
 *   get:
 *     summary: Get a single comment
 *     tags:
 *       - Comments
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
 *         description: Comment retrieved successfully
 *       404:
 *         description: Comment not found
 *   patch:
 *     summary: Update a comment
 *     tags:
 *       - Comments
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
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *           examples:
 *             UpdateCommentExample:
 *               value:
 *                 content: "Updated comment with additional thoughts."
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       404:
 *         description: Comment not found
 *   delete:
 *     summary: Delete a comment
 *     tags:
 *       - Comments
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
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 */
router.get("/:commentId", getCommentsHandler);
router.patch("/:commentId", authenticate, updateCommentHandler);
router.delete("/:commentId", authenticate, deleteCommentHandler);

export default router;
