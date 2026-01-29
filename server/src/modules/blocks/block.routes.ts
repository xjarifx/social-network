import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import { block, getBlocked, unblock } from "./block.controller.js";

const router = Router();

// BLOCKS

// Block a user
router.post("/", authenticate, block);
// Get all blocked users
router.get("/", authenticate, getBlocked);
// Unblock a user
router.delete("/:blockedId", authenticate, unblock);

export default router;
