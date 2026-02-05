import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { createLikeLimiter } from "../../middleware/rateLimit.middleware.js";
import { likePostHandler, unlikePostHandler } from "./likes.controller.js";

const router = Router();

// LIKES

/**
 * @openapi
 * /api/v1/likes:
 *   post:
 *     summary: Like a post
 */
router.post("/", authenticate, createLikeLimiter, likePostHandler);
/**
 * @openapi
 * /api/v1/likes/{likeId}:
 *   delete:
 *     summary: Unlike a post
 */
router.delete("/:likeId", authenticate, unlikePostHandler);
/**
 * @openapi
 * /api/v1/likes:
 *   get:
 *     summary: Get users who liked the post
 */
router.get("/", authenticate, unlikePostHandler);

export default router;
