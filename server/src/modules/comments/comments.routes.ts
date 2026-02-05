import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { createCommentLimiter } from "../../middleware/rateLimit.middleware.js";
import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./comments.controller.js";

const router = Router();

// COMMENTS

/**
 * @openapi
 * /api/v1/comments:
 *   post:
 *     summary: Create a comment
 *   get:
 *     summary: Get all comments on the post
 */
router.post("/", authenticate, createCommentLimiter, createCommentHandler);
router.get("/", getCommentsHandler);
/**
 * @openapi
 * /api/v1/comments/{commentId}:
 *   get:
 *     summary: Get a single comment
 *   patch:
 *     summary: Update a comment
 *   delete:
 *     summary: Delete a comment
 */
router.get("/:commentId", getCommentsHandler);
router.patch("/:commentId", authenticate, updateCommentHandler);
router.delete("/:commentId", authenticate, deleteCommentHandler);

export default router;
