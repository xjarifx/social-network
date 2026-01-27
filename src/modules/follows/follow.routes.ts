import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  follow,
  getUserFollowers,
  getUserFollowing,
  unfollow,
} from "./follow.controller.js";

const router = Router();

// Follow a user
router.post("/", authenticate, follow);

// Unfollow a user
router.delete("/:followingId", authenticate, unfollow);

// Get followers of a user
router.get("/followers", authenticate, getUserFollowers);

// Get users that current user is following
router.get("/following", authenticate, getUserFollowing);

export default router;
