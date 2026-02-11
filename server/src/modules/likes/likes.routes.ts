import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware";
import {
  likePostHandler,
  unlikePostHandler,
  getPostLikesHandler,
} from "./likes.controller";

const router = Router({ mergeParams: true });

// LIKES


router.post("/", authenticate, likePostHandler);

router.delete("/", authenticate, unlikePostHandler);

router.get("/", authenticate, getPostLikesHandler);

export default router;
