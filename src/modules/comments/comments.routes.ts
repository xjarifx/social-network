import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./comments.controller.js";

const router = Router();

router.post("/", authenticate, createCommentHandler);
router.get("/", getCommentsHandler);
router.get("/:commentId", getCommentsHandler);
router.patch("/:commentId", authenticate, updateCommentHandler);
router.delete("/:commentId", authenticate, deleteCommentHandler);

export default router;
