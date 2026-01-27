import { Router } from "express";
import { register, login, logout, refresh } from "./auth.controller.js";

const router = Router();

// AUTH

// register a new user
router.post("/register", register);
// login an existing user
router.post("/login", login);
// logout user
router.post("/logout", logout);
// refresh access token
router.post("/refresh", refresh);

export default router;
