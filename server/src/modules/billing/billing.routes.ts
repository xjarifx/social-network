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

/**
 * @openapi
 * /api/v1/billing/checkout-session:
 *   post:
 *     summary: Create subscription checkout session
 */
router.post("/checkout-session", authenticate, createSubscriptionCheckout);
/**
 * @openapi
 * /api/v1/billing/me:
 *   get:
 *     summary: Get my billing status
 */
router.get("/me", authenticate, getMyBillingStatus);
/**
 * @openapi
 * /api/v1/billing/webhook:
 *   post:
 *     summary: Stripe webhook
 */
router.post("/webhook", stripeWebhook);
/**
 * @openapi
 * /api/v1/billing/success:
 *   get:
 *     summary: Billing success
 */
router.get("/success", authenticate, billingSuccess);
/**
 * @openapi
 * /api/v1/billing/cancel:
 *   get:
 *     summary: Billing cancel
 */
router.get("/cancel", authenticate, billingCancel);

export default router;
