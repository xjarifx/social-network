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
import { generalLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

router.get("/webhook-health", webhookHealth);

router.post(
  "/create-checkout-session",
  generalLimiter,
  authenticate,
  createCheckoutSessionHandler,
);

router.post(
  "/create-payment-intent",
  generalLimiter,
  authenticate,
  createPaymentIntentHandler,
);

router.get("/me", generalLimiter, authenticate, getMyBillingStatus);

router.get("/confirm", generalLimiter, authenticate, confirmPaymentHandler);

router.get(
  "/debug/recent-sessions",
  generalLimiter,
  authenticate,
  debugRecentSessions,
);

router.post("/webhook", stripeWebhook);

export default router;
