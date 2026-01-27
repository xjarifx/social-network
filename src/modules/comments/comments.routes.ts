import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "./comments.controller.js";

const router = Router();

// COMMENTS

// create a comment
router.post("/", authenticate, createCommentHandler);
// get all comments on the post
router.get("/", getCommentsHandler);
// get a single comment
router.get("/:commentId", getCommentsHandler);
// update a comment
router.patch("/:commentId", authenticate, updateCommentHandler);
// delete a comment
router.delete("/:commentId", authenticate, deleteCommentHandler);

export default router;
