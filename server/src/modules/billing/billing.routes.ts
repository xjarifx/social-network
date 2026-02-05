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
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/checkout-session", authenticate, createSubscriptionCheckout);
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
 * /api/v1/billing/webhook:
 *   post:
 *     summary: Stripe webhook
 *     tags:
 *       - Billing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/webhook", stripeWebhook);
/**
 * @openapi
 * /api/v1/billing/success:
 *   get:
 *     summary: Billing success callback
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Billing success
 */
router.get("/success", authenticate, billingSuccess);
/**
 * @openapi
 * /api/v1/billing/cancel:
 *   get:
 *     summary: Billing cancel callback
 *     tags:
 *       - Billing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Billing cancelled
 */
router.get("/cancel", authenticate, billingCancel);

export default router;
