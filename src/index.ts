import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import postsRouter from "./modules/posts/posts.routes.js";
import commentsRouter from "./modules/posts/comments.routes.js";
import friendshipsRouter from "./modules/friendships/friend.routes.js";
import notificationsRouter from "./modules/notifications/notification.routes.js";

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/friendships", friendshipsRouter);
app.use("/api/notifications", notificationsRouter);

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    // Test a simple query to ensure database is fully operational
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database is operational");

    // Start the server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log("\n🚀 Application is ready to accept requests\n");
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    console.error("⚠️  Server will not start without database connection");
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  console.log("✅ Database disconnected");
  process.exit(0);
});

startServer();
