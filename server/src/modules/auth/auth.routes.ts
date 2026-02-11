import { Router } from "express";
import { register, login, logout, refresh } from "./auth.controller";

const router = Router();

// AUTH


router.post("/register", register);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh", refresh);

export default router;
