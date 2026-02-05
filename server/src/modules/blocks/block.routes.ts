import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { block, getBlocked, unblock } from "./block.controller.js";

const router = Router();

// BLOCKS

/**
 * @openapi
 * /api/v1/blocks:
 *   post:
 *     summary: Block a user
 *   get:
 *     summary: Get all blocked users
 */
router.post("/", authenticate, block);
router.get("/", authenticate, getBlocked);
/**
 * @openapi
 * /api/v1/blocks/{userId}:
 *   delete:
 *     summary: Unblock a user
 */
router.delete("/:userId", authenticate, unblock);

export default router;
