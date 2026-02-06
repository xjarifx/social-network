import { Router } from "express";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
  getPostsFeed,
} from "./posts.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import likeRouter from "../likes/likes.routes";
import commentsRouter from "../comments/comments.routes";

const router = Router();

// POSTS

/**
 * @openapi
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - BearerAuth: []
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
 *                 maxLength: 100
 *           examples:
 *             CreatePostExample:
 *               value:
 *                 content: "This is my first post on the social network!"
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authenticate, createNewPost);
/**
 * @openapi
 * /api/v1/posts/feed:
 *   get:
 *     summary: Get news feed
 *     tags:
 *       - Posts
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
 *         description: Feed posts retrieved successfully
 */
router.get("/feed", authenticate, getPostsFeed);
/**
 * @openapi
 * /api/v1/posts:
 *   get:
 *     summary: Get timeline posts
 *     tags:
 *       - Posts
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
 *         description: Timeline posts retrieved successfully
 */
router.get("/", authenticate, getPostsFeed);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   get:
 *     summary: Get single post
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get("/:postId", getPost);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   patch:
 *     summary: Update post
 *     tags:
 *       - Posts
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
 *                 maxLength: 100
 *           examples:
 *             UpdatePostExample:
 *               value:
 *                 content: "Updated post content with new information"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       404:
 *         description: Post not found
 */
router.patch("/:postId", authenticate, updatePostContent);
/**
 * @openapi
 * /api/v1/posts/{postId}:
 *   delete:
 *     summary: Delete post
 *     tags:
 *       - Posts
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
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
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
