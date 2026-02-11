import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { createLikeLimiter } from "../../middleware/rateLimit.middleware";
import {
  likePostHandler,
  unlikePostHandler,
  getPostLikesHandler,
} from "./likes.controller";

const router = Router({ mergeParams: true });

// LIKES

router.post("/", createLikeLimiter, authenticate, likePostHandler);

router.delete("/", createLikeLimiter, authenticate, unlikePostHandler);

router.get("/", authenticate, getPostLikesHandler);

export default router;
