import { Router } from "express";
import {
  createCheckoutSessionHandler,
  createPaymentIntentHandler,
  getMyBillingStatus,
  confirmPaymentHandler,
  stripeWebhook,
  webhookHealth,
  debugRecentSessions,
} from "./billing.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();


router.get("/webhook-health", webhookHealth);


router.post(
  "/create-checkout-session",
  authenticate,
  createCheckoutSessionHandler,
);


router.post("/create-payment-intent", authenticate, createPaymentIntentHandler);


router.get("/me", authenticate, getMyBillingStatus);


router.get("/confirm", authenticate, confirmPaymentHandler);


router.get("/debug/recent-sessions", authenticate, debugRecentSessions);


router.post("/webhook", stripeWebhook);

export default router;
