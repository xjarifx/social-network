import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  updateCommentHandler,
  deleteCommentHandler,
} from "./posts.controller.js";

const commentsRouter = Router();
commentsRouter.patch("/:commentId", authenticate, updateCommentHandler);
commentsRouter.delete("/:commentId", authenticate, deleteCommentHandler);

export default commentsRouter;
