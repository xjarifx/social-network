import dotenv from "dotenv";
import path from "path";

// Load .env from root directory
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index";
import authRouter from "./modules/auth/auth.routes";
import userRouter from "./modules/user/user.routes";
import postsRouter from "./modules/posts/posts.routes";
import notificationsRouter from "./modules/notifications/notification.routes";
import blocksRouter from "./modules/blocks/block.routes";
import billingRouter from "./modules/billing/billing.routes";
import { swaggerRouter } from "./swagger";

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

startServer();
