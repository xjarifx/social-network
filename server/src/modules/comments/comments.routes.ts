import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
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
router.get("/", authenticate, getCommentsHandler);
router.patch("/:commentId", authenticate, updateCommentHandler);
router.delete("/:commentId", authenticate, deleteCommentHandler);

// reconsider
// router.get("/:commentId", authenticate, getCommentsHandler);
// router.get("/:commentId/likes", authenticate, getCommentLikesHandler);

// need changes
router.post("/:commentId/likes", authenticate, likeCommentHandler);
router.delete("/:commentId/likes", authenticate, unlikeCommentHandler);

export default router;
  