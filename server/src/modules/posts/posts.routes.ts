import { Router } from "express";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
  getTimelineUserPosts,
} from "./posts.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// POST /posts - Create new post (requires auth)
router.post("/", authenticate, createNewPost);

// GET /posts/:postId - Get single post (public)
router.get("/:postId", getPost);

// PATCH /posts/:postId - Update own post (requires auth)
router.patch("/:postId", authenticate, updatePostContent);

// DELETE /posts/:postId - Delete own post (requires auth)
router.delete("/:postId", authenticate, deletePostContent);

// * ATTENTION *
// GET /posts/:userId - Get user's posts/timeline (public)
router.get("/:userId", getTimelineUserPosts);

export default router;
