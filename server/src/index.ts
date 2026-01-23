import "dotenv/config";
import express from "express";
import authRouter from "./modules/auth/auth.routes.js";

const app = express();
const PORT = 3000;
const prefix = "/api/v1";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(`${prefix}/auth`, authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
