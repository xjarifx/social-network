import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Helper to check if switch is enabled
const shouldUseProd = (switchName) => {
  const value = process.env[switchName]?.toLowerCase().trim();
  return value === "true" || value === "1" || value === "yes";
};

// Determine which DATABASE_URL to use based on switch
const useProdDb = shouldUseProd("USE_PROD_DATABASE");
const dbUrlKey = useProdDb ? "DATABASE_URL_PROD" : "DATABASE_URL_DEV";

// Set DATABASE_URL for Prisma
process.env.DATABASE_URL = process.env[dbUrlKey];

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
