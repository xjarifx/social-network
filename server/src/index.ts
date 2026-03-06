import path from "path";
import fs from "fs";
import { bootstrapEnv } from "./config/env.js";

bootstrapEnv();

// Now dynamically import the rest of the application
async function main() {
  const express = (await import("express")).default;
  const cors = (await import("cors")).default;
  const { prisma } = await import("./lib/prisma.js");
  const { initRedis, setCacheEnabled } = await import("./lib/cache.js");
  const { generalLimiter } =
    await import("./middleware/rateLimit.middleware.js");
  const authRouter = (await import("./modules/auth/auth.routes.js")).default;
  const userRouter = (await import("./modules/user/user.routes.js")).default;
  const postsRouter = (await import("./modules/posts/posts.routes.js")).default;
  const notificationsRouter = (
    await import("./modules/notifications/notification.routes.js")
  ).default;
  const blocksRouter = (await import("./modules/blocks/block.routes.js"))
    .default;
  const billingRouter = (await import("./modules/billing/billing.routes.js"))
    .default;
  const { setupSwagger } = await import("./lib/swagger.js");

  const app = express();
  const PORT = Number(process.env.PORT);

  const configuredFrontendOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Add localhost:5173 as fallback for development
  if (!configuredFrontendOrigins.includes("http://localhost:5173")) {
    configuredFrontendOrigins.push("http://localhost:5173");
  }

  console.log("🔧 CORS Configuration:");
  console.log("  - FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("  - Allowed origins:", configuredFrontendOrigins);

  const isAllowedOrigin = (origin: string): boolean => {
    if (configuredFrontendOrigins.includes(origin)) return true;
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
    return false;
  };

  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      console.log(`📡 CORS request from origin: ${origin || "undefined"}`);
      if (!origin || isAllowedOrigin(origin)) {
        console.log(`✅ CORS allowed for: ${origin || "no-origin"}`);
        callback(null, true);
        return;
      }
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  };

  app.use(cors(corsOptions));

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir));

  // Swagger docs (available at /api-docs)
  setupSwagger(app);

  // Apply rate limiting to all API routes
  app.use("/api", generalLimiter);

  // Cache health check endpoint
  app.get("/api/v1/health/cache", async (req, res) => {
    const { cacheGet, cacheSet, getCacheEnabled } = await import("./lib/cache.js");
    
    try {
      const testKey = "health:cache:test";
      const testValue = { timestamp: Date.now(), test: "cache-working" };
      
      // Determine which Redis is being used
      const redisUrl = process.env.REDIS_URL || "";
      const isProduction = redisUrl.includes("valkey-jarif") || redisUrl.includes("aivencloud");
      const redisHost = redisUrl.split("@")[1]?.split(":")[0] || "unknown";
      
      // Try to set a value
      await cacheSet(testKey, testValue, 10);
      
      // Try to get it back
      const retrieved = await cacheGet(testKey);
      
      const isWorking = retrieved !== null && 
                       typeof retrieved === 'object' && 
                       'test' in retrieved &&
                       retrieved.test === "cache-working";
      
      res.json({
        enabled: getCacheEnabled(),
        working: isWorking,
        environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
        host: redisHost,
        message: isWorking 
          ? `✅ ${isProduction ? "Production" : "Development"} cache is working correctly` 
          : `⚠️ ${isProduction ? "Production" : "Development"} cache is enabled but not working`,
        test: {
          written: testValue,
          retrieved: retrieved,
        }
      });
    } catch (error) {
      const redisUrl = process.env.REDIS_URL || "";
      const isProduction = redisUrl.includes("valkey-jarif") || redisUrl.includes("aivencloud");
      
      res.status(500).json({
        enabled: getCacheEnabled(),
        working: false,
        environment: isProduction ? "PRODUCTION" : "DEVELOPMENT",
        message: `❌ ${isProduction ? "Production" : "Development"} cache test failed`,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Auth
  app.use("/api/v1/auth", authRouter);
  // Users & followers
  app.use("/api/v1/users", userRouter);
  // Posts, likes & Comments
  app.use("/api/v1/posts", postsRouter);
  // Notifications
  app.use("/api/v1/notifications", notificationsRouter);
  // Blocks
  app.use("/api/v1/blocks", blocksRouter);
  // Billing
  app.use("/api/v1/billing", billingRouter);

  const startServer = async () => {
    await prisma.$connect();
    console.log("✅ Database connected");

    const cacheSwitch = true; // Cache switch
    setCacheEnabled(cacheSwitch);
    await initRedis();

    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
    });
  };

  await startServer();
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
