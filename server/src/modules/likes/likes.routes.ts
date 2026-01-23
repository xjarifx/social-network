import { Router } from "express";
import { likePostHandler, unlikePostHandler } from "./likes.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// POST /posts/:postId/likes - Like a post (requires auth)
router.post("/:postId/likes", authenticate, likePostHandler);

// DELETE /posts/:postId/likes - Unlike a post (requires auth)
router.delete("/:postId/likes", authenticate, unlikePostHandler);

export default router;
