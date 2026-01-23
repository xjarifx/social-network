import "dotenv/config";
import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";
import postsRouter from "./modules/posts/posts.routes.js";
import likesRouter from "./modules/likes/likes.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1/auth", authRouter);
app.use("/v1/users", userRouter);
app.use("/v1/posts", postsRouter);
app.use("/v1/posts", likesRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
