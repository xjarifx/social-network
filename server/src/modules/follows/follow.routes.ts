import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { followLimiter } from "../../middleware/rateLimit.middleware";
import { follow, unfollow } from "./follow.controller";

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /users/{userId}/follow:
 *   post:
 *     tags: [Follows]
 *     summary: Follow a user
 *     description: Follow the user specified in the parent route parameter.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user to follow
 *     responses:
 *       201:
 *         description: Successfully followed user
 *       400:
 *         description: Cannot follow yourself or invalid ID
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
 *         description: Already following the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.post("/", followLimiter, authenticate, follow);

/**
 * @openapi
 * /users/{userId}/follow/{followingId}:
 *   delete:
 *     tags: [Follows]
 *     summary: Unfollow a user
 *     description: Unfollow a user by their follow-relationship ID.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Successfully unfollowed
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to unfollow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Follow relationship not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.delete("/:followingId", followLimiter, authenticate, unfollow);

export default router;
