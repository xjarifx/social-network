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

// POST /api/posts - Create new post (requires auth)
router.post("/", authenticate, createNewPost);

// GET /api/posts/:postId - Get single post (public)
router.get("/:postId", getPost);

// PATCH /api/posts/:postId - Update own post (requires auth)
router.patch("/:postId", authenticate, updatePostContent);

// DELETE /api/posts/:postId - Delete own post (requires auth)
router.delete("/:postId", authenticate, deletePostContent);

// GET /api/users/:userId/posts - Get user's posts/timeline (public)
router.get("/user/:userId/posts", getTimelineUserPosts);

export default router;
