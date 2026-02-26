import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import { block, getBlocked, unblock } from "./block.controller";

const router = Router();

// BLOCKS

/**
 * @openapi
 * /blocks:
 *   post:
 *     tags: [Blocks]
 *     summary: Block a user
 *     description: Block a user by their username.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockBody'
 *     responses:
 *       201:
 *         description: User blocked
 *       400:
 *         description: Cannot block yourself or missing username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User already blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", generalLimiter, authenticate, block);

/**
 * @openapi
 * /blocks:
 *   delete:
 *     tags: [Blocks]
 *     summary: Unblock a user
 *     description: Unblock a previously blocked user by their username.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlockBody'
 *     responses:
 *       204:
 *         description: User unblocked
 *       400:
 *         description: Cannot unblock yourself or missing username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: User is not blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/", generalLimiter, authenticate, unblock);

/**
 * @openapi
 * /blocks:
 *   get:
 *     tags: [Blocks]
 *     summary: Get blocked users
 *     description: Returns a paginated list of users blocked by the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of blocked users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", generalLimiter, authenticate, getBlocked);

export default router;
