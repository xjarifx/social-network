import type { Request, Response } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken } from "./auth.service.js";

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

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const result = await logoutUser(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_REFRESH_TOKEN") {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      if (error.message === "TOKEN_ALREADY_REVOKED") {
        res.status(400).json({ error: "Token already revoked" });
        return;
      }
    }
    console.error("Logout error:", error);
    res.status(500).json({ error: "Unable to logout" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const result = await refreshAccessToken(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_REFRESH_TOKEN") {
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      if (error.message === "TOKEN_REVOKED") {
        res.status(401).json({ error: "Refresh token has been revoked" });
        return;
      }
      if (error.message === "TOKEN_EXPIRED") {
        res.status(401).json({ error: "Refresh token has expired" });
        return;
      }
    }
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Unable to refresh token" });
  }
};