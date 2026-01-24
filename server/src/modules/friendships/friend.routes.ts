import { Router } from "express";
import {
  sendRequest,
  getUserFriends,
  acceptRequest,
  rejectRequest,
} from "./friend.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

// Protect all friendship endpoints
router.use(authenticate);

router.post("/", sendRequest);
router.get("/", getUserFriends);
router.patch("/:friendshipId", acceptRequest);
router.delete("/:friendshipId", rejectRequest);

export default router;
