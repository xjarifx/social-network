import type { Request, Response } from "express";
import {
  createCheckoutSession,
  getBillingStatus,
  handleCheckoutCancel,
  handleCheckoutSuccess,
  handleStripeWebhook,
} from "./billing.service";

export const createSubscriptionCheckout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const session = await createCheckoutSession(req.userId);
    res.status(200).json(session);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    if (err.status === 500) {
      res.status(500).json({ error: err.error });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Create checkout session error:", errorMessage, error);
    res.status(500).json({ error: "Unable to create checkout session" });
  }
};

export const getMyBillingStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const billing = await getBillingStatus(req.userId);
    res.status(200).json(billing);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 404) {
      res.status(404).json({ error: err.error });
      return;
    }
    if (err.status === 500) {
      res.status(500).json({ error: err.error });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Get billing status error:", errorMessage, error);
    res.status(500).json({ error: "Unable to fetch billing status" });
  }
};

export const stripeWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const signature = req.headers["stripe-signature"];
    const payload = (req as Request & { rawBody?: Buffer }).rawBody;

    if (!payload) {
      res.status(400).json({ error: "Missing webhook payload" });
      return;
    }

    await handleStripeWebhook(payload, signature);
    res.status(200).json({ received: true });
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

export const billingSuccess = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await handleCheckoutSuccess(
      req.userId,
      req.query.session_id,
    );
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 400) {
      res.status(400).json({ error: err.error });
      return;
    }
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    if (err.status === 403) {
      res.status(403).json({ error: err.error });
      return;
    }
    console.error("Billing success error:", error);
    res.status(500).json({ error: "Unable to confirm payment" });
  }
};

export const billingCancel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const result = await handleCheckoutCancel(req.userId);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as { status?: number; error?: unknown };
    if (err.status === 401) {
      res.status(401).json({ error: err.error });
      return;
    }
    console.error("Billing cancel error:", error);
    res.status(500).json({ error: "Unable to cancel payment" });
  }
};
