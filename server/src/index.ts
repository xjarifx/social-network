import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Configure dotenv before any imports that need environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath, debug: false });

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

  // CORS Configuration
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

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
