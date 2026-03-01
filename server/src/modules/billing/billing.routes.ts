import { Router } from "express";
import {
  createCheckoutSessionHandler,
  createPaymentIntentHandler,
  getMyBillingStatus,
  confirmPaymentHandler,
  stripeWebhook,
  webhookHealth,
  debugRecentSessions,
  downgradeHandler,
} from "./billing.controller";
import { authenticate } from "../../middleware/authenticate.middleware";
import { generalLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

/**
 * @openapi
 * /billing/webhook-health:
 *   get:
 *     tags: [Billing]
 *     summary: Webhook health check
 *     description: Diagnostic endpoint to verify the Stripe webhook is configured correctly.
 *     responses:
 *       200:
 *         description: Webhook health status
 */
router.get("/webhook-health", webhookHealth);

/**
 * @openapi
 * /billing/create-checkout-session:
 *   post:
 *     tags: [Billing]
 *     summary: Create a Stripe checkout session
 *     description: Creates a new Stripe Checkout session for subscription payment.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: Stripe hosted checkout URL
 *                 sessionId:
 *                   type: string
 *       500:
 *         description: Failed to create session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/create-checkout-session",
  generalLimiter,
  authenticate,
  createCheckoutSessionHandler,
);

/**
 * @openapi
 * /billing/create-payment-intent:
 *   post:
 *     tags: [Billing]
 *     summary: Create a payment intent (legacy)
 *     description: Legacy endpoint — creates a Stripe PaymentIntent for direct card payment.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 *       500:
 *         description: Failed to create payment intent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/create-payment-intent",
  generalLimiter,
  authenticate,
  createPaymentIntentHandler,
);

/**
 * @openapi
 * /billing/me:
 *   get:
 *     tags: [Billing]
 *     summary: Get billing status
 *     description: Returns the current billing/subscription status for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Billing status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isPremium:
 *                   type: boolean
 *                 plan:
 *                   type: string
 *                   nullable: true
 *                 subscriptionEnd:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       500:
 *         description: Failed to get status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", generalLimiter, authenticate, getMyBillingStatus);

/**
 * @openapi
 * /billing/confirm:
 *   get:
 *     tags: [Billing]
 *     summary: Confirm payment
 *     description: Confirm a payment after Stripe redirect. Provide either session_id or payment_intent_id.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session_id
 *         schema:
 *           type: string
 *         description: Stripe checkout session ID
 *       - in: query
 *         name: payment_intent_id
 *         schema:
 *           type: string
 *         description: Stripe payment intent ID (legacy)
 *     responses:
 *       200:
 *         description: Payment confirmed
 *       500:
 *         description: Confirmation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/confirm", generalLimiter, authenticate, confirmPaymentHandler);

/**
 * @openapi
 * /billing/debug/recent-sessions:
 *   get:
 *     tags: [Billing]
 *     summary: Debug recent sessions
 *     description: Returns recent Stripe checkout sessions for debugging purposes.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recent sessions
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/debug/recent-sessions",
  generalLimiter,
  authenticate,
  debugRecentSessions,
);

/**
 * @openapi
 * /billing/downgrade:
 *   post:
 *     tags: [Billing]
 *     summary: Downgrade to free plan
 *     description: Downgrades the authenticated user from PRO to FREE plan.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully downgraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 plan:
 *                   type: string
 *                 planStatus:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Already on free plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Failed to downgrade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/downgrade", generalLimiter, authenticate, downgradeHandler);

/**
 * @openapi
 * /billing/webhook:
 *   post:
 *     tags: [Billing]
 *     summary: Stripe webhook
 *     description: Receives Stripe webhook events. This endpoint is called by Stripe, not by clients.
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Webhook received
 *       400:
 *         description: Missing payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/webhook", stripeWebhook);

export default router;
