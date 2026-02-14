import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";
import { block, getBlocked, unblock } from "./block.controller";

const router = Router();

// BLOCKS

router.post("/:username", generalLimiter, authenticate, block);
router.get("/", generalLimiter, authenticate, getBlocked);
router.delete("/:username", generalLimiter, authenticate, unblock);

export default router;
