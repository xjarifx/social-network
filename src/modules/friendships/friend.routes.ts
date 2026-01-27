import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  sendRequest,
  getUserFriends,
  acceptRequest,
  rejectRequest,
} from "./friend.controller.js";

const router = Router();

// FOLLOW

// follow a user
router.post("/", authenticate);
// unfollow a user
router.delete("/:followerId", authenticate);
// get followers of a user
router.get("/", authenticate);
// get following of a user
router.get("/", authenticate);

export default router;
