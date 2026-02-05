import { Router } from "express";
import { register, login, logout, refresh } from "./auth.controller.js";
import { authLimiter } from "../../middleware/rateLimit.middleware.js";

const router = Router();

// AUTH

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post("/register", authLimiter, register);
/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login an existing user
 */
router.post("/login", authLimiter, login);
/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 */
router.post("/logout", logout);
/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh access token
 */
router.post("/refresh", refresh);

export default router;
