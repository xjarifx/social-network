import Stripe from "stripe";
import { Plan } from "../../generated/prisma/index";
import { prisma } from "../../lib/prisma";

// ---------------------------------------------------------------------------
// Stripe init
// ---------------------------------------------------------------------------

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

let stripe: Stripe | null = null;

if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
  console.log("✅ Stripe initialized");
} else {
  console.warn("⚠️ STRIPE_SECRET_KEY not set");
}

const getStripe = (): Stripe => {
  if (!stripe) {
    throw { status: 500, error: "Stripe is not configured" };
  }
  return stripe;
};

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PRO_AMOUNT_CENTS = Number(process.env.STRIPE_PRO_PRICE_CENTS || 999);
const PRO_CURRENCY = process.env.STRIPE_PRO_CURRENCY || "usd";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const requireUserId = (val: unknown): string => {
  const id = ensureString(val);
  if (!id) throw { status: 401, error: "Unauthorized" };
  return id;
};

// ---------------------------------------------------------------------------
// POST /billing/create-payment-intent
//
// Creates a Stripe PaymentIntent and returns the client secret.
// This mirrors the working test code: server creates a PaymentIntent,
// client confirms card payment with the client secret.
// ---------------------------------------------------------------------------

export const createPaymentIntent = async (userId: unknown) => {
  const id = requireUserId(userId);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw { status: 404, error: "User not found" };

  if (user.plan === Plan.PRO) {
    throw { status: 400, error: "You are already on the Pro plan" };
  }

  // Ensure Stripe customer exists
  let customerId = user.stripeCustomerId || "";
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create PaymentIntent — same as test code
  const paymentIntent = await getStripe().paymentIntents.create({
    amount: PRO_AMOUNT_CENTS,
    currency: PRO_CURRENCY,
    customer: customerId,
    metadata: { userId: user.id, plan: "PRO" },
    automatic_payment_methods: { enabled: true },
  });

  console.log(
    `✅ PaymentIntent ${paymentIntent.id} created for user ${id} ($${(PRO_AMOUNT_CENTS / 100).toFixed(2)})`,
  );

  return { clientSecret: paymentIntent.client_secret };
};

// ---------------------------------------------------------------------------
// GET /billing/me
// ---------------------------------------------------------------------------

export const getBillingStatus = async (userId: unknown) => {
  const id = requireUserId(userId);

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      plan: true,
      planStatus: true,
      planStartedAt: true,
      stripeCurrentPeriodEndAt: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) throw { status: 404, error: "User not found" };
  return user;
};

// ---------------------------------------------------------------------------
// POST /billing/webhook
//
// Webhook is the SINGLE source of truth for granting Pro.
// We never grant Pro from the frontend success page — only here.
// ---------------------------------------------------------------------------

export const handleStripeWebhook = async (
  payload: Buffer,
  signature: string | string[] | undefined,
) => {
  if (!STRIPE_SECRET_KEY) throw { status: 500, error: "Stripe not configured" };
  if (!STRIPE_WEBHOOK_SECRET)
    throw { status: 500, error: "Webhook secret not configured" };
  if (!signature || typeof signature !== "string")
    throw { status: 400, error: "Missing Stripe signature" };

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      payload,
      signature,
      STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    throw { status: 400, error: "Invalid webhook signature" };
  }

  console.log(`📨 Webhook: ${event.type}`);

  // payment_intent.succeeded — THE key event (same as test code)
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const userId = pi.metadata?.userId;
    const plan = pi.metadata?.plan;

    if (!userId || plan !== "PRO") {
      console.warn(`⚠️ PI ${pi.id}: skipping (userId=${userId}, plan=${plan})`);
      return { received: true };
    }

    console.log(
      `💰 PI ${pi.id} succeeded — $${(pi.amount / 100).toFixed(2)} for user ${userId}`,
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn(`⚠️ User ${userId} not found`);
      return { received: true };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        planStatus: "active",
        planStartedAt: new Date(),
        stripeCustomerId:
          typeof pi.customer === "string"
            ? pi.customer
            : (pi.customer?.id ?? user.stripeCustomerId),
      },
    });

    console.log(`✅ User ${userId} → PRO`);
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn(
      `❌ PI ${pi.id} failed: ${pi.last_payment_error?.message ?? "unknown"}`,
    );
  }

  return { received: true };
};

// ---------------------------------------------------------------------------
// GET /billing/confirm?payment_intent_id=...
//
// Called from success page — reads payment status from Stripe.
// Also grants Pro if PaymentIntent succeeded (direct confirmation).
// This ensures Pro is granted even without webhooks (local dev).
// In production, the webhook serves as a backup/primary path.
// ---------------------------------------------------------------------------

export const confirmPayment = async (
  userId: unknown,
  paymentIntentId: unknown,
) => {
  const id = requireUserId(userId);
  const piId = ensureString(paymentIntentId);
  if (!piId) throw { status: 400, error: "Missing payment_intent_id" };

  const pi = await getStripe().paymentIntents.retrieve(piId);

  if (pi.metadata?.userId !== id) {
    throw { status: 403, error: "Payment does not belong to this user" };
  }

  // If the PaymentIntent succeeded and has the PRO metadata, grant Pro
  // directly — same logic as the webhook, but called synchronously.
  // This is the fix: webhooks don't reach localhost in dev, so we also
  // grant Pro here after verifying the PaymentIntent with Stripe.
  if (pi.status === "succeeded" && pi.metadata?.plan === "PRO") {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user && user.plan !== Plan.PRO) {
      await prisma.user.update({
        where: { id },
        data: {
          plan: Plan.PRO,
          planStatus: "active",
          planStartedAt: new Date(),
          stripeCustomerId:
            typeof pi.customer === "string"
              ? pi.customer
              : (pi.customer?.id ?? user.stripeCustomerId),
        },
      });
      console.log(`✅ User ${id} → PRO (confirmed via PaymentIntent ${piId})`);
    }
  }

  // Return current plan
  const user = await prisma.user.findUnique({
    where: { id },
    select: { plan: true, planStatus: true },
  });

  return {
    paymentStatus: pi.status,
    amount: pi.amount,
    currency: pi.currency,
    plan: user?.plan ?? "FREE",
  };
};
