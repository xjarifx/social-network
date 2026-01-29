import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { likePostHandler, unlikePostHandler } from "./likes.controller.js";

const router = Router();

// LIKES

// like a post
router.post("/", authenticate, likePostHandler);
// unlike a post
router.delete("/:likeId", authenticate, unlikePostHandler);
// get list of users who liked the post
router.get("/", authenticate, unlikePostHandler);

export default router;
