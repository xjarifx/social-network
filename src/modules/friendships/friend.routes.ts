import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  sendRequest,
  getUserFriends,
  acceptRequest,
  rejectRequest,
} from "./friend.controller.js";

const router = Router();

router.post("/", authenticate, sendRequest);
router.get("/", authenticate, getUserFriends);
router.patch("/:friendshipId", authenticate, acceptRequest);
router.delete("/:friendshipId", authenticate, rejectRequest);

export default router;