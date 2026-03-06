import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

export const bootstrapEnv = (): void => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "../../.env");
  dotenv.config({ path: envPath });

  // Get environment
  const APP_ENV = process.env.APP_ENV || "development";
  // Map environment to suffix: development -> DEV, production -> PROD
  const envSuffix = APP_ENV === "development" ? "DEV" : "PROD";

  // Set environment-specific variables with proper fallback
  process.env.PORT = process.env[`PORT_${envSuffix}`] || process.env.PORT || "3000";
  process.env.DATABASE_URL = process.env[`DATABASE_URL_${envSuffix}`] || process.env.DATABASE_URL || "";
  process.env.REDIS_URL = process.env[`REDIS_URL_${envSuffix}`] || process.env.REDIS_URL || "";
  process.env.FRONTEND_URL = process.env[`FRONTEND_URL_${envSuffix}`] || process.env.FRONTEND_URL || "";
  process.env.BACKEND_URL = process.env[`BACKEND_URL_${envSuffix}`] || process.env.BACKEND_URL || "";
  process.env.STRIPE_SUCCESS_URL = process.env[`STRIPE_SUCCESS_URL_${envSuffix}`] || process.env.STRIPE_SUCCESS_URL || "";
  process.env.STRIPE_CANCEL_URL = process.env[`STRIPE_CANCEL_URL_${envSuffix}`] || process.env.STRIPE_CANCEL_URL || "";

  console.log(`🌍 Environment: ${APP_ENV}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL}`);
  console.log(`💾 Database: ${process.env.DATABASE_URL?.split('@')[1] || 'not configured'}`);
  console.log(`🔴 Redis: ${process.env.REDIS_URL?.split('@')[1] || 'not configured'}`);
};
