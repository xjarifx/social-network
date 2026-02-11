import { Router } from "express";
import {
  authenticate,
  authenticateOptional,
} from "../../middleware/authenticate.middleware";
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

router.post("/", createCommentLimiter, authenticate, createCommentHandler);

router.get("/", authenticateOptional, getCommentsHandler);

router.get("/:commentId", getCommentsHandler);
router.patch("/:commentId", authenticate, updateCommentHandler);
router.delete("/:commentId", authenticate, deleteCommentHandler);

router.post("/:commentId/likes", authenticate, likeCommentHandler);

router.delete("/:commentId/likes", authenticate, unlikeCommentHandler);

router.get("/:commentId/likes", authenticate, getCommentLikesHandler);

export default router;
