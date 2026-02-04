import { Router } from "express";
import {
  createSubscriptionCheckout,
  billingCancel,
  billingSuccess,
  getMyBillingStatus,
  stripeWebhook,
} from "./billing.controller.js";
import { authenticate } from "../../middleware/authenticate.middleware.js";

const router = Router();

router.post("/checkout-session", authenticate, createSubscriptionCheckout);
router.get("/me", authenticate, getMyBillingStatus);
router.post("/webhook", stripeWebhook);
router.get("/success", authenticate, billingSuccess);
router.get("/cancel", authenticate, billingCancel);

export default router;
