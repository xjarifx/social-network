import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configure dotenv before any imports that need environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath, debug: false });

// Now dynamically import the rest of the application
async function main() {
  const express = (await import("express")).default;
  const cors = (await import("cors")).default;
  const { PrismaClient } = await import("./generated/prisma/index.js");
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
  const { swaggerRouter } = await import("./swagger.js");

  const app = express();
  const PORT = Number(process.env.PORT);
  const prisma = new PrismaClient();

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

  // Swagger docs and OpenAPI spec
  app.use("/api", swaggerRouter);

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
