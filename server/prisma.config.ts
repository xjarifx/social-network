import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Try loading .env from server/ first, then fallback to project root
const envLoaded = dotenv.config({ path: path.resolve(__dirname, ".env") });
if (envLoaded.error) {
  // Try loading from project root
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
