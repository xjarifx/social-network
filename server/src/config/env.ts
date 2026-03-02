import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

export type AppEnv = "development" | "production";

const SWITCHABLE_KEYS = [
  "PORT",
  "DATABASE_URL",
  "REDIS_URL",
  "FRONTEND_URL",
  "BACKEND_URL",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "REFRESH_TOKEN_SECRET",
  "REFRESH_TOKEN_EXPIRES_IN",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLIC_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_PRICE_ID",
  "STRIPE_PRO_PRICE_CENTS",
  "STRIPE_PRO_CURRENCY",
  "STRIPE_TEST_TRIAL_SECONDS",
  "STRIPE_SUCCESS_URL",
  "STRIPE_CANCEL_URL",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_URL",
  "CACHE_ENABLED",
] as const;

const normalizeAppEnv = (value: string | undefined): AppEnv => {
  const normalized = (value || "development").toLowerCase();
  return normalized === "production" ? "production" : "development";
};

const applyModeOverrides = (appEnv: AppEnv): void => {
  const suffix = appEnv === "production" ? "PROD" : "DEV";

  for (const key of SWITCHABLE_KEYS) {
    const modeSpecificKey = `${key}_${suffix}`;
    const modeSpecificValue = process.env[modeSpecificKey];

    if (typeof modeSpecificValue === "string" && modeSpecificValue !== "") {
      process.env[key] = modeSpecificValue;
    }
  }
};

export const bootstrapEnv = (): AppEnv => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "../../.env");

  dotenv.config({ path: envPath, debug: false });

  const appEnv = normalizeAppEnv(process.env.APP_ENV || process.env.NODE_ENV);
  process.env.APP_ENV = appEnv;
  process.env.NODE_ENV = appEnv;

  applyModeOverrides(appEnv);

  return appEnv;
};
