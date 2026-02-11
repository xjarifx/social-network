import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { followLimiter } from "../../middleware/rateLimit.middleware";
import { follow, unfollow } from "./follow.controller";

const router = Router();

router.post("/", followLimiter, authenticate, follow);

router.delete("/:followingId", followLimiter, authenticate, unfollow);

export default router;
