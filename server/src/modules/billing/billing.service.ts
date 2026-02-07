import Stripe from "stripe";
import { PrismaClient, Plan } from "../../generated/prisma/index";

const prisma = new PrismaClient();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const FRONTEND_URL = process.env.FRONTEND_URL || "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

const PRO_CURRENCY = process.env.STRIPE_PRO_CURRENCY || "usd";
const PRO_PRICE_CENTS = Number(process.env.STRIPE_PRO_PRICE_CENTS || 999);
const SUCCESS_URL =
  process.env.STRIPE_SUCCESS_URL ||
  (FRONTEND_URL
    ? `${FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`
    : "");
const CANCEL_URL =
  process.env.STRIPE_CANCEL_URL ||
  (FRONTEND_URL ? `${FRONTEND_URL}/billing/cancel` : "");
const TEST_TRIAL_SECONDS = Number(process.env.STRIPE_TEST_TRIAL_SECONDS || 0);

let cachedPriceId = process.env.STRIPE_PRO_PRICE_ID || "";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const requireEnv = (value: string, name: string) => {
  if (!value) {
    throw { status: 500, error: `${name} is not configured` };
  }
  return value;
};

const getOrCreateProPrice = async (): Promise<string> => {
  if (cachedPriceId) {
    return cachedPriceId;
  }

  const product = await stripe.products.create({
    name: "Pro Plan",
    description: "Monthly Pro subscription",
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: PRO_PRICE_CENTS,
    currency: PRO_CURRENCY,
    recurring: { interval: "month" },
  });

  cachedPriceId = price.id;
  return price.id;
};

const shouldUserBePro = (status: Stripe.Subscription.Status): boolean =>
  ["active", "trialing", "past_due", "unpaid"].includes(status);

const syncSubscriptionToUser = async (subscription: Stripe.Subscription) => {
  const metadataUserId = subscription.metadata?.userId;
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const user = metadataUserId
    ? await prisma.user.findUnique({ where: { id: metadataUserId } })
    : customerId
      ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      : null;

  if (!user) {
    return;
  }

  const status = subscription.status;
  const isPro = shouldUserBePro(status);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: isPro ? Plan.PRO : Plan.FREE,
      planStatus: status,
      planStartedAt: new Date(subscription.start_date * 1000),
      stripeCustomerId: customerId || user.stripeCustomerId,
      stripeSubscriptionId: subscription.id,
    },
  });
};

export const createCheckoutSession = async (userId: unknown) => {
  requireEnv(STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
  requireEnv(SUCCESS_URL, "STRIPE_SUCCESS_URL or FRONTEND_URL");
  requireEnv(CANCEL_URL, "STRIPE_CANCEL_URL or FRONTEND_URL");

  const id = ensureString(userId);
  if (!id) {
    throw { status: 401, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  let customerId = user.stripeCustomerId || "";

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      metadata: { userId: user.id },
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const priceId = await getOrCreateProPrice();
  const subscriptionData: Stripe.Checkout.SessionCreateParams.SubscriptionData =
    {
      metadata: { userId: user.id },
    };

  if (TEST_TRIAL_SECONDS > 0) {
    subscriptionData.trial_end =
      Math.floor(Date.now() / 1000) + TEST_TRIAL_SECONDS;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: SUCCESS_URL,
    cancel_url: CANCEL_URL,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    subscription_data: subscriptionData,
  });

  return { url: session.url };
};

export const getBillingStatus = async (userId: unknown) => {
  const id = ensureString(userId);
  if (!id) {
    throw { status: 401, error: "Unauthorized" };
  }

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

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  return user;
};

export const handleCheckoutSuccess = async (
  userId: unknown,
  sessionId: unknown,
) => {
  requireEnv(STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");

  const id = ensureString(userId);
  const sessionIdValue = ensureString(sessionId);

  if (!id) {
    throw { status: 401, error: "Unauthorized" };
  }

  if (!sessionIdValue) {
    throw { status: 400, error: "Missing session_id" };
  }

  const session = await stripe.checkout.sessions.retrieve(sessionIdValue, {
    expand: ["subscription", "customer"],
  });

  const sessionUserId =
    session.metadata?.userId || session.client_reference_id || "";

  if (sessionUserId && sessionUserId !== id) {
    throw { status: 403, error: "Session does not belong to user" };
  }

  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["customer"],
    });

    await syncSubscriptionToUser(subscription);
  }

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
  };
};

export const handleCheckoutCancel = async (userId: unknown) => {
  const id = ensureString(userId);
  if (!id) {
    throw { status: 401, error: "Unauthorized" };
  }

  return { canceled: true };
};

export const handleStripeWebhook = async (
  payload: Buffer,
  signature: string | string[] | undefined,
) => {
  requireEnv(STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY");
  requireEnv(STRIPE_WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET");

  if (!signature || typeof signature !== "string") {
    throw { status: 400, error: "Missing Stripe signature" };
  }

  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.subscription) {
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["customer"],
      });

      await syncSubscriptionToUser(subscription);
    }
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    await syncSubscriptionToUser(subscription);
  }

  return { received: true };
};
