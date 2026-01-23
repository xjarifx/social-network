import { Router } from "express";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
  likePostHandler,
  unlikePostHandler,
  createCommentHandler,
  getCommentsHandler,
} from "./posts.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// post
router.post("/", authenticate, createNewPost);
router.get("/:postId", getPost);
router.patch("/:postId", authenticate, updatePostContent);
router.delete("/:postId", authenticate, deletePostContent);

// likes
router.post("/:postId/likes", authenticate, likePostHandler);
router.delete("/:postId/likes", authenticate, unlikePostHandler);

// comments
router.post("/:postId/comments", authenticate, createCommentHandler);
router.get("/:postId/comments", getCommentsHandler);
// update and delete comment routes are now in index.ts

export default router;
