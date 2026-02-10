import { Router } from "express";
import {
  createPaymentIntentHandler,
  getMyBillingStatus,
  confirmPaymentHandler,
  stripeWebhook,
} from "./billing.controller";
import { authenticate } from "../../middleware/authenticate.middleware";

const router = Router();

/**
 * @openapi
 * /api/v1/billing/create-payment-intent:
 *   post:
 *     summary: Create a PaymentIntent for Pro upgrade
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
 *     summary: Confirm payment status (read-only, never grants Pro)
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: payment_intent_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status returned
 */
router.get("/confirm", authenticate, confirmPaymentHandler);

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
