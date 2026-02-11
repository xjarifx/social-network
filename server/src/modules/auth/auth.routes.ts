import { Router } from "express";
import { register, login, logout, refresh } from "./auth.controller";
import { authLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

// AUTH

router.post("/register", authLimiter, register);

router.post("/login", authLimiter, login);

router.post("/logout", logout);

router.post("/refresh", refresh);

export default router;
