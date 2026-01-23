import { Router } from "express";
import { getProfile, updateProfile } from "./user.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// GET /api/users/:userId - Get user profile (public)
router.get("/:userId", getProfile);

// PATCH /api/users/:userId - Update own profile (requires auth)
router.patch("/:userId", authenticate, updateProfile);

export default router;
