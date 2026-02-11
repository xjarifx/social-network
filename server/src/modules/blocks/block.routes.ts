import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import { block, getBlocked, unblock } from "./block.controller";

const router = Router();

// BLOCKS

router.post("/", generalLimiter, authenticate, block);
router.get("/", generalLimiter, authenticate, getBlocked);

router.delete("/:userId", generalLimiter, authenticate, unblock);

export default router;
