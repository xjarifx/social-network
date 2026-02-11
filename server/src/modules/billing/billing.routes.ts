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

/**
 * @openapi
 * /api/v1/billing/webhook-health:
 *   get:
 *     summary: Check webhook configuration status
 *     tags:
 *       - Billing
 *     responses:
 *       200:
 *         description: Webhook configuration status
 */
router.get("/webhook-health", webhookHealth);

/**
 * @openapi
 * /api/v1/billing/create-checkout-session:
 *   post:
 *     summary: Create a Stripe Checkout Session for Pro upgrade
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout Session created — returns Stripe URL
 *       400:
 *         description: Already on Pro plan
 */
router.post(
  "/create-checkout-session",
  authenticate,
  createCheckoutSessionHandler,
);

/**
 * @openapi
 * /api/v1/billing/create-payment-intent:
 *   post:
 *     summary: Create a PaymentIntent for Pro upgrade (legacy)
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: PaymentIntent created — returns clientSecret
 *       400:
 *         description: Already on Pro plan
 */
router.post("/create-payment-intent", authenticate, createPaymentIntentHandler);

/**
 * @openapi
 * /api/v1/billing/me:
 *   get:
 *     summary: Get my billing status
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Billing status retrieved successfully
 */
router.get("/me", authenticate, getMyBillingStatus);

/**
 * @openapi
 * /api/v1/billing/confirm:
 *   get:
 *     summary: Confirm payment status
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: payment_intent_id
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status returned
 */
router.get("/confirm", authenticate, confirmPaymentHandler);

/**
 * @openapi
 * /api/v1/billing/debug/recent-sessions:
 *   get:
 *     summary: Get recent checkout sessions for debugging
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent sessions for current user
 */
router.get("/debug/recent-sessions", authenticate, debugRecentSessions);

/**
 * @openapi
 * /api/v1/billing/webhook:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags:
 *       - Billing
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post("/webhook", stripeWebhook);

export default router;
