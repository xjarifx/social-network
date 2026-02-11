import { Router } from "express";
import { authenticate } from '../../middleware/authenticate.middleware';
import { block, getBlocked, unblock } from './block.controller';

const router = Router();

// BLOCKS


router.post("/", authenticate, block);
router.get("/", authenticate, getBlocked);

router.delete("/:userId", authenticate, unblock);

export default router;
