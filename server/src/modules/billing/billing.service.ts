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
  console.log(
    "✅ Stripe initialized with key:",
    STRIPE_SECRET_KEY.substring(0, 20) + "...",
  );
} else {
  console.error(
    "❌ STRIPE_SECRET_KEY not set! process.env.STRIPE_SECRET_KEY:",
    process.env.STRIPE_SECRET_KEY,
  );
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
// POST /billing/create-checkout-session
//
// Creates a Stripe Checkout Session and returns the URL to redirect to.
// This redirects users to Stripe's hosted payment page.
// ---------------------------------------------------------------------------

export const createCheckoutSession = async (userId: unknown) => {
  console.log("🔄 createCheckoutSession called for userId:", userId);
  const id = requireUserId(userId);
  console.log("✅ User ID validated:", id);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    console.error("❌ User not found:", id);
    throw { status: 404, error: "User not found" };
  }
  console.log("✅ User found:", user.email);

  if (user.plan === Plan.PRO) {
    throw { status: 400, error: "You are already on the Pro plan" };
  }

  // Ensure Stripe customer exists
  let customerId = user.stripeCustomerId || "";
  if (!customerId) {
    console.log("📝 Creating Stripe customer for user:", user.email);
    const customer = await getStripe().customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    console.log("✅ Stripe customer created:", customerId);
    await prisma.user.update({
      where: { id },
      data: { stripeCustomerId: customerId },
    });
  } else {
    console.log("✅ Using existing Stripe customer:", customerId);
  }

  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
  console.log("🔗 Frontend URL:", FRONTEND_URL);

  // Create Checkout Session
  console.log("\n🚀 Creating Checkout Session...");
  console.log("  Amount (cents):", PRO_AMOUNT_CENTS);
  console.log("  Currency:", PRO_CURRENCY);
  console.log("  Customer ID:", customerId);
  console.log(
    "  Success URL:",
    `${FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  );
  console.log("  Cancel URL:", `${FRONTEND_URL}/billing`);
  console.log("  Metadata:", { userId: user.id, plan: "PRO" });

  try {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: PRO_CURRENCY,
            product_data: {
              name: "Pro Plan",
              description: "100 character posts, Pro badge, Priority support",
            },
            unit_amount: PRO_AMOUNT_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/billing`,
      metadata: { userId: user.id, plan: "PRO" },
    });

    console.log("\n✅ Checkout Session created successfully:");
    console.log("  Session ID:", session.id);
    console.log("  Status:", (session as any).status);
    console.log("  Payment Status:", (session as any).payment_status);
    console.log("  URL:", session.url);
    console.log("\n📨 Next: User will be redirected to Stripe Checkout\n");

    return { url: session.url };
  } catch (error) {
    console.error("\n❌ Failed to create Checkout Session:");
    console.error("  Error:", (error as any).message);
    console.error("  Code:", (error as any).code);
    console.error("  Type:", (error as any).type);
    throw error;
  }
};

// ---------------------------------------------------------------------------
// POST /billing/create-payment-intent (legacy — kept for backwards compat)
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
    console.log("✅ Webhook signature verified successfully");
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    throw { status: 400, error: "Invalid webhook signature" };
  }

  console.log(`📨 Webhook received: ${event.type}`);
  console.log(`   Event ID: ${event.id}`);
  console.log(`   Event data:`, JSON.stringify(event.data.object, null, 2));

  // checkout.session.completed — THE key event for Stripe Checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    console.log(`💳 checkout.session.completed:`, {
      sessionId: session.id,
      userId,
      plan,
      paymentStatus: session.payment_status,
      amount: session.amount_total,
    });

    if (!userId || plan !== "PRO") {
      console.warn(
        `⚠️ Session ${session.id}: skipping (userId=${userId}, plan=${plan})`,
      );
      return { received: true };
    }

    console.log(
      `💰 Session ${session.id} completed — $${((session.amount_total || 0) / 100).toFixed(2)} for user ${userId}`,
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn(`⚠️ User ${userId} not found in database`);
      return { received: true };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        planStatus: "active",
        planStartedAt: new Date(),
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : (session.customer?.id ?? user.stripeCustomerId),
      },
    });

    console.log(`✅ User ${userId} → PRO plan activated`);
    console.log(`   Updated user:`, {
      id: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      planStatus: updatedUser.planStatus,
    });
  }

  // payment_intent.succeeded — THE key event (for legacy PaymentIntent flow)
  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const userId = pi.metadata?.userId;
    const plan = pi.metadata?.plan;

    console.log(`💳 payment_intent.succeeded:`, {
      paymentIntentId: pi.id,
      userId,
      plan,
      status: pi.status,
      amount: pi.amount,
    });

    if (!userId || plan !== "PRO") {
      console.warn(`⚠️ PI ${pi.id}: skipping (userId=${userId}, plan=${plan})`);
      return { received: true };
    }

    console.log(
      `💰 PI ${pi.id} succeeded — $${(pi.amount / 100).toFixed(2)} for user ${userId}`,
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.warn(`⚠️ User ${userId} not found in database`);
      return { received: true };
    }

    const updatedUser = await prisma.user.update({
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

    console.log(`✅ User ${userId} → PRO plan activated`);
    console.log(`   Updated user:`, {
      id: updatedUser.id,
      email: updatedUser.email,
      plan: updatedUser.plan,
      planStatus: updatedUser.planStatus,
    });
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn(
      `❌ PI ${pi.id} failed: ${pi.last_payment_error?.message ?? "unknown"}`,
    );
  }

  console.log(`✅ Webhook ${event.id} processed successfully`);
  return { received: true };
};

// ---------------------------------------------------------------------------
// GET /billing/confirm?session_id=... OR ?payment_intent_id=...

//
// Called from success page — reads payment status from Stripe.
// Supports both Checkout Sessions and PaymentIntents.
// Also grants Pro if payment succeeded (direct confirmation).
// This ensures Pro is granted even without webhooks (local dev).
// ---------------------------------------------------------------------------

export const confirmPayment = async (
  userId: unknown,
  sessionId: unknown,
  paymentIntentId: unknown,
) => {
  console.log("\n" + "=".repeat(60));
  console.log("🔄 confirmPayment CALLED");
  console.log("=".repeat(60));
  console.log("Parameters:", {
    userId,
    sessionId,
    paymentIntentId,
  });
  const id = requireUserId(userId);

  // Handle Checkout Session
  if (sessionId) {
    const sessId = ensureString(sessionId);
    if (!sessId) throw { status: 400, error: "Invalid session_id" };

    console.log("\n📊 RETRIEVING SESSION FROM STRIPE");
    console.log("Session ID:", sessId);
    const session = await getStripe().checkout.sessions.retrieve(sessId);

    console.log("\n📋 SESSION DETAILS RETRIEVED:");
    console.log("  ID:", session.id);
    console.log("  Payment Status:", session.payment_status);
    console.log("  Amount Total:", session.amount_total);
    console.log("  Currency:", session.currency);
    console.log("  Customer:", session.customer);
    console.log("  Metadata:", session.metadata);
    console.log("  Mode:", session.mode);
    console.log("  Status:", (session as any).status);

    // List payment intents for this session for debugging
    try {
      const paymentIntents = await getStripe().paymentIntents.list({
        limit: 5,
      });
      const sessionPaymentIntent = paymentIntents.data.find(
        (pi) => (pi.metadata as any)?.session_id === sessId,
      );
      if (sessionPaymentIntent) {
        console.log("\n💳 Related Payment Intent Found:");
        console.log("  PI ID:", sessionPaymentIntent.id);
        console.log("  PI Status:", sessionPaymentIntent.status);
        console.log("  PI Amount:", sessionPaymentIntent.amount);
      }
    } catch (e) {
      // PI lookup is optional
    }

    if (session.metadata?.userId !== id) {
      console.warn(
        `❌ SECURITY: Session userId ${session.metadata?.userId} != user ${id}`,
      );
      throw { status: 403, error: "Payment does not belong to this user" };
    }

    // Check all possible paid statuses
    const isPaid = session.payment_status === "paid";

    console.log("\n💰 PAYMENT STATUS ANALYSIS:");
    console.log("  Is 'paid':", isPaid);
    console.log("  Full status:", session.payment_status);

    // If the Session succeeded and has the PRO metadata, grant Pro
    if (isPaid && session.metadata?.plan === "PRO") {
      console.log("\n✅ PAYMENT CONFIRMED - UPGRADING USER TO PRO");
      const user = await prisma.user.findUnique({ where: { id } });
      if (user && user.plan !== Plan.PRO) {
        const updated = await prisma.user.update({
          where: { id },
          data: {
            plan: Plan.PRO,
            planStatus: "active",
            planStartedAt: new Date(),
            stripeCustomerId:
              typeof session.customer === "string"
                ? session.customer
                : (session.customer?.id ?? user.stripeCustomerId),
          },
        });
        console.log(`✅ Database Updated - User now PRO:`, {
          id: updated.id,
          email: updated.email,
          plan: updated.plan,
        });
      } else if (user?.plan === Plan.PRO) {
        console.log("ℹ️  User already PRO");
      }
    } else {
      console.log("⏳ PAYMENT NOT CONFIRMED. Reasons:");
      console.log("  - Payment is 'paid'?", isPaid);
      console.log(
        "  - Metadata plan is 'PRO'?",
        session.metadata?.plan === "PRO",
      );
      console.log("  - Current status:", session.payment_status);
    }

    // Return current plan
    const user = await prisma.user.findUnique({
      where: { id },
      select: { plan: true, planStatus: true },
    });

    console.log("\n📋 RETURNING RESPONSE:");
    console.log("  Payment Status:", session.payment_status);
    console.log("  Amount:", session.amount_total);
    console.log("  Currency:", session.currency);
    console.log("  User Plan:", user?.plan);
    console.log("=".repeat(60) + "\n");

    return {
      paymentStatus: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
      plan: user?.plan ?? "FREE",
    };
  }

  // Handle PaymentIntent (legacy)
  const piId = ensureString(paymentIntentId);
  if (!piId)
    throw { status: 400, error: "Missing session_id or payment_intent_id" };

  const pi = await getStripe().paymentIntents.retrieve(piId);

  if (pi.metadata?.userId !== id) {
    throw { status: 403, error: "Payment does not belong to this user" };
  }

  // If the PaymentIntent succeeded and has the PRO metadata, grant Pro
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
