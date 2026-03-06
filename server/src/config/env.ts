import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load raw .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

// ============================================================================
// ENVIRONMENT PROCESSOR
// ============================================================================
// This is the ONLY file that knows about _PROD and _DEV suffixes
// The rest of the codebase just uses clean process.env variables

// Helper: Check if switch is enabled (true/1/yes = use PROD)
const shouldUseProd = (switchName: string): boolean => {
  const value = process.env[switchName]?.toLowerCase().trim();
  return value === "true" || value === "1" || value === "yes";
};

// Helper: Get value based on switch
const getEnvValue = (switchName: string, key: string, fallback: string = ""): string => {
  const useProd = shouldUseProd(switchName);
  const prodValue = process.env[`${key}_PROD`];
  const devValue = process.env[`${key}_DEV`];
  
  if (useProd && prodValue) return prodValue;
  if (!useProd && devValue) return devValue;
  return prodValue || devValue || fallback;
};

// ============================================================================
// PROCESS AND SET CLEAN ENVIRONMENT VARIABLES
// ============================================================================
// After this, the entire codebase uses standard process.env.DATABASE_URL etc.

export const bootstrapEnv = (): void => {
  // Process all switches and set clean environment variables
  process.env.PORT = process.env.PORT || "3000";
  process.env.DATABASE_URL = getEnvValue("USE_PROD_DATABASE", "DATABASE_URL");
  process.env.REDIS_URL = getEnvValue("USE_PROD_REDIS", "REDIS_URL");
  process.env.FRONTEND_URL = getEnvValue("USE_PROD_FRONTEND", "FRONTEND_URL");
  process.env.BACKEND_URL = getEnvValue("USE_PROD_BACKEND", "BACKEND_URL");
  
  process.env.IMAGEKIT_PUBLIC_KEY = getEnvValue("USE_PROD_IMAGEKIT", "IMAGEKIT_PUBLIC_KEY");
  process.env.IMAGEKIT_PRIVATE_KEY = getEnvValue("USE_PROD_IMAGEKIT", "IMAGEKIT_PRIVATE_KEY");
  process.env.IMAGEKIT_URL_ENDPOINT = getEnvValue("USE_PROD_IMAGEKIT", "IMAGEKIT_URL_ENDPOINT");
  
  process.env.JWT_SECRET = getEnvValue("USE_PROD_JWT", "JWT_SECRET");
  process.env.REFRESH_TOKEN_SECRET = getEnvValue("USE_PROD_JWT", "REFRESH_TOKEN_SECRET");
  
  process.env.STRIPE_SECRET_KEY = getEnvValue("USE_PROD_STRIPE", "STRIPE_SECRET_KEY");
  process.env.STRIPE_PUBLIC_KEY = getEnvValue("USE_PROD_STRIPE", "STRIPE_PUBLIC_KEY");
  process.env.STRIPE_WEBHOOK_SECRET = getEnvValue("USE_PROD_STRIPE", "STRIPE_WEBHOOK_SECRET");
  
  // Auto-generate Stripe URLs
  const stripeSuccessOverride = getEnvValue("USE_PROD_FRONTEND", "STRIPE_SUCCESS_URL");
  const stripeCancelOverride = getEnvValue("USE_PROD_FRONTEND", "STRIPE_CANCEL_URL");
  process.env.STRIPE_SUCCESS_URL = stripeSuccessOverride || `${process.env.FRONTEND_URL}/billing/success`;
  process.env.STRIPE_CANCEL_URL = stripeCancelOverride || `${process.env.FRONTEND_URL}/billing/cancel`;

  // Log configuration
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🚀 ENVIRONMENT CONFIGURATION`);
  console.log(`${"=".repeat(60)}`);
  console.log(`💾 Database:  ${shouldUseProd("USE_PROD_DATABASE") ? "PROD" : "DEV"} - ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'not configured'}`);
  console.log(`🔴 Redis:     ${shouldUseProd("USE_PROD_REDIS") ? "PROD" : "DEV"} - ${process.env.REDIS_URL?.split('@')[1]?.split('/')[0] || 'not configured'}`);
  console.log(`📡 Frontend:  ${shouldUseProd("USE_PROD_FRONTEND") ? "PROD" : "DEV"} - ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Backend:   ${shouldUseProd("USE_PROD_BACKEND") ? "PROD" : "DEV"} - ${process.env.BACKEND_URL}`);
  console.log(`🖼️  ImageKit:  ${shouldUseProd("USE_PROD_IMAGEKIT") ? "PROD" : "DEV"} - ${process.env.IMAGEKIT_URL_ENDPOINT}`);
  console.log(`🔐 JWT:       ${shouldUseProd("USE_PROD_JWT") ? "PROD" : "DEV"}`);
  console.log(`💳 Stripe:    ${shouldUseProd("USE_PROD_STRIPE") ? "PROD" : "DEV"}`);
  console.log(`${"=".repeat(60)}\n`);
};

// ============================================================================
// EARLY BOOTSTRAP FOR PRISMA CLI
// ============================================================================
// This runs immediately when the module is imported
// Ensures DATABASE_URL is set before Prisma CLI runs

// Only bootstrap if not already done
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('_PROD') || process.env.DATABASE_URL.includes('_DEV')) {
  const useProdDb = shouldUseProd("USE_PROD_DATABASE");
  const dbUrl = useProdDb ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV;
  if (dbUrl) {
    process.env.DATABASE_URL = dbUrl;
  }
}
