import "dotenv/config";
import express from "express";
import cors from "cors";
import { PrismaClient } from "./generated/prisma/index.js";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import postsRouter from "./modules/posts/posts.routes.js";
import notificationsRouter from "./modules/notifications/notification.routes.js";

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth
app.use("api/v1/auth", authRouter);
// Users & followers
app.use("api/v1/users", userRouter);
// Posts, likes & Comments
app.use("api/v1/posts", postsRouter);
// Notifications
app.use("api/v1/notifications", notificationsRouter);

const startServer = async () => {
  await prisma.$connect();
  console.log("✅ Database connected");

  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
};

startServer();
