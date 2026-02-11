import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import { follow, unfollow } from "./follow.controller";

const router = Router();


router.post("/", authenticate, follow);

router.delete("/:followingId", authenticate, unfollow);

export default router;
