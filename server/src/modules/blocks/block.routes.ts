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
 *     tags:
 *       - Blocks
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - blockedId
 *             properties:
 *               blockedId:
 *                 type: string
 *                 format: uuid
 *           examples:
 *             BlockUserExample:
 *               value:
 *                 blockedId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: User blocked successfully
 *       400:
 *         description: Already blocked or invalid user
 *   get:
 *     summary: Get all blocked users
 *     tags:
 *       - Blocks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Blocked users list retrieved successfully
 */
router.post("/", authenticate, block);
router.get("/", authenticate, getBlocked);
/**
 * @openapi
 * /api/v1/blocks/{userId}:
 *   delete:
 *     summary: Unblock a user
 *     tags:
 *       - Blocks
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *       404:
 *         description: Block relationship not found
 */
router.delete("/:userId", authenticate, unblock);

export default router;
