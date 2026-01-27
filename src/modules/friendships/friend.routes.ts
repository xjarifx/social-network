import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.middleware.js";
import {
  sendRequest,
  getUserFriends,
  acceptRequest,
  rejectRequest,
} from "./friend.controller.js";

const router = Router();

router.post("/", authenticate, );
router.delete("/:followerId", authenticate, );
router.get("/", authenticate, );
router.get("/", authenticate, );

export default router;