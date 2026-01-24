import type { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const result = await registerUser({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_TAKEN") {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
      if (error.message === "USERNAME_TAKEN") {
        res.status(409).json({ error: "Username already in use" });
        return;
      }
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Unable to register user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to login" });
  }
};