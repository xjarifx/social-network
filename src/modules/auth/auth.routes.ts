import { Router } from "express";
import { register, login } from "./auth.controller.js";

const router = Router();

// AUTH

// register a new user
router.post("/register", register);
// login an existing user
router.post("/login", login);

export default router;
