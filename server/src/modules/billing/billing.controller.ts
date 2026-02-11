import type { Request, Response } from "express";
import {
  createCheckoutSession,
  createPaymentIntent,
  getBillingStatus,
  confirmPayment,
  handleStripeWebhook,
  getWebhookHealth,
  getRecentSessions,
} from "./billing.service";

// Helper to send error responses
const sendError = (res: Response, error: unknown) => {
  const err = error as { status?: number; error?: string };
  const status = err.status || 500;
  const message = err.error || "Internal server error";
  res.status(status).json({ error: message });
};

// POST /billing/create-checkout-session
export const createCheckoutSessionHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    console.log("📝 Received checkout session request for user:", req.userId);
    const result = await createCheckoutSession(req.userId);
    console.log("✅ Checkout session created successfully:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Create checkout session error:", error);
    sendError(res, error);
  }
};

// POST /billing/create-payment-intent (legacy)
export const createPaymentIntentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await createPaymentIntent(req.userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Create payment intent error:", error);
    sendError(res, error);
  }
};

// GET /billing/me
export const getMyBillingStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const billing = await getBillingStatus(req.userId);
    res.status(200).json(billing);
  } catch (error) {
    console.error("Get billing status error:", error);
    sendError(res, error);
  }
};

// GET /billing/confirm?session_id=... OR ?payment_intent_id=...
export const confirmPaymentHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await confirmPayment(
      req.userId,
      req.query.session_id,
      req.query.payment_intent_id,
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Confirm payment error:", error);
    sendError(res, error);
  }
};

// POST /billing/webhook
export const stripeWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const signature = req.headers["stripe-signature"];
    const payload = (req as Request & { rawBody?: Buffer }).rawBody;

    if (!payload) {
      console.error("❌ Webhook received but payload is missing");
      res.status(400).json({ error: "Missing webhook payload" });
      return;
    }

    console.log("🔔 Webhook endpoint received request:");
    console.log(`   Signature present: ${!!signature}`);
    console.log(`   Payload size: ${payload.length} bytes`);

    await handleStripeWebhook(payload, signature);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    sendError(res, error);
  }
};

// GET /billing/webhook-health - Diagnostic endpoint to verify webhook setup
export const webhookHealth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const healthData = getWebhookHealth();
    res.status(200).json(healthData);
  } catch (error) {
    console.error("Webhook health check error:", error);
    sendError(res, error);
  }
};
// GET /billing/debug/recent-sessions - Debug endpoint to see recent checkout sessions
export const debugRecentSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await getRecentSessions(req.userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Debug sessions error:", error);
    sendError(res, error);
  }
};
