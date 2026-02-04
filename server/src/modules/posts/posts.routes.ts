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

// create post
router.post("/", authenticate, createPostLimiter, createNewPost);
// NEWS FEED (at this moment only followed users' posts)
router.get("/feed", authenticate);
// TIMELINE (own posts or another user's posts as per userId)
router.get("/", authenticate);
// get single post
router.get("/:postId", getPost);
// update post
router.patch("/:postId", authenticate, updatePostContent);
// delete post
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
