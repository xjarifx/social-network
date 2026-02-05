import { Router } from "express";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
} from "./posts.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  createPostLimiter,
  createCommentLimiter,
  createLikeLimiter,
} from "../../middleware/rateLimit.middleware.js";
import likeRouter from "../likes/likes.routes.js";
import commentsRouter from "../comments/comments.routes.js";

const router = Router();

// POSTS

/**
 * @openapi
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 */
router.post("/", authenticate, createPostLimiter, createNewPost);
/**
 * @openapi
 * /api/v1/posts/feed:
 *   get:
 *     summary: Get news feed
 */
router.get("/feed", authenticate);
/**
 * @openapi
 * /api/v1/posts:
 *   get:
 *     summary: Get timeline posts
 */
router.get("/", authenticate);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   get:
 *     summary: Get single post
 */
router.get("/:postId", getPost);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   patch:
 *     summary: Update post
 */
router.patch("/:postId", authenticate, updatePostContent);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   delete:
 *     summary: Delete post
 */
router.delete("/:postId", authenticate, deletePostContent);

// ----------------------------------------------------------------

// LIKES

// create like
router.post("/:postId/likes", likeRouter);
// remove like
router.delete("/:postId/likes", likeRouter);
// get list of users who liked the post
router.get("/:postId/likes", likeRouter);

// ----------------------------------------------------------------

// COMMENTS

// create comment
router.post("/:postId/comments", commentsRouter);
// get comments
router.get("/:postId/comments", commentsRouter);
// update comment
router.patch("/:postId/comments", commentsRouter);
// delete comment
router.delete("/:postId/comments", commentsRouter);

export default router;
