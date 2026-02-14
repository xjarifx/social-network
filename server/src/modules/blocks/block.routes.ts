import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import { block, getBlocked, unblock } from "./block.controller";

const router = Router();

// BLOCKS

router.post("/", generalLimiter, authenticate, block);
router.delete("/", generalLimiter, authenticate, unblock);
router.get("/", generalLimiter, authenticate, getBlocked);

export default router;
