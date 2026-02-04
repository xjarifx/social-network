import { Router } from "express";
import { register, login, logout, refresh } from "./auth.controller.js";
import { authLimiter } from "../../middleware/rateLimit.middleware.js";

const router = Router();

// AUTH

// register a new user
router.post("/register", authLimiter, register);
// login an existing user
router.post("/login", authLimiter, login);
// logout user
router.post("/logout", logout);
// refresh access token
router.post("/refresh", refresh);

export default router;
