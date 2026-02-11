import { Router } from "express";
import {
  getProfile,
  updateProfile,
  getTimeline,
  getCurrentProfile,
  search,
} from "./user.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import followRouter from "../follows/follow.routes";
import {
  getUserFollowers,
  getUserFollowing,
} from "../follows/follow.controller";

const router = Router();

// USER


router.get("/me", authenticate, getCurrentProfile);


router.get("/search", search);


router.get("/:userId", getProfile);

router.get("/:userId/posts", authenticate, getTimeline);

router.patch("/me", authenticate, updateProfile);

// FOLLOW


router.use("/:userId/follow", followRouter);

router.get("/:userId/followers", authenticate, getUserFollowers);

router.get("/:userId/following", authenticate, getUserFollowing);

export default router;
