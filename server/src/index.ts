import "dotenv/config";
import express from "express";
import authRouter from "./modules/auth/auth.routes.js";
import userRouter from "./modules/user/user.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
