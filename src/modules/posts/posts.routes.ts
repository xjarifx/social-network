import { Router } from "express";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
} from "./posts.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import likeRouter from "../likes/likes.routes.js";
import commentsRouter from "../comments/comments.routes.js";

const router = Router();

// post
router.post("/", authenticate, createNewPost);
router.get("/feed", authenticate);
router.get("/:postId", getPost);
router.patch("/:postId", authenticate, updatePostContent);
router.delete("/:postId", authenticate, deletePostContent);

// likes
router.post("/:postId/likes", likeRouter);
router.delete("/:postId/likes", likeRouter);

// comments
router.post("/:postId/comments", commentsRouter);
router.get("/:postId/comments", commentsRouter);
router.patch("/:postId/comments", commentsRouter);
router.delete("/:postId/comments", commentsRouter);

export default router;
