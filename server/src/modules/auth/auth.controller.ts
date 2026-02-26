import type { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "./auth.service";

import { registerSchema, loginSchema } from "./auth.validation";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = registerSchema.safeParse({
      body: req.body,
    });

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: {},
        error: parsed.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; "),
      });
      return;
    }

    const result = await registerUser(parsed.data.body);
    res.status(201).json({ success: true, data: result, error: null });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_TAKEN") {
        res
          .status(409)
          .json({ success: false, data: {}, error: "Email already in use" });
        return;
      }
      if (error.message === "USERNAME_TAKEN") {
        res
          .status(409)
          .json({ success: false, data: {}, error: "Username already in use" });
        return;
      }
    }
    console.error("Register error:", error);
    res
      .status(500)
      .json({ success: false, data: {}, error: "Unable to register user" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse({ body: req.body });

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        data: {},
        error: parsed.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; "),
      });
      return;
    }

    const result = await loginUser(parsed.data.body);
    res.status(200).json({ success: true, data: result, error: null });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({
          success: false,
          data: {},
          error: "Invalid email or password",
        });
        return;
      }
    }
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, data: {}, error: "Unable to login" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, data: {}, error: "Refresh token is required" });
      return;
    }
    const result = await logoutUser(refreshToken);
    res.status(200).json({ success: true, data: result, error: null });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_REFRESH_TOKEN") {
        res
          .status(401)
          .json({ success: false, data: {}, error: "Invalid refresh token" });
        return;
      }
      if (error.message === "TOKEN_ALREADY_REVOKED") {
        res
          .status(400)
          .json({ success: false, data: {}, error: "Token already revoked" });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res
          .status(400)
          .json({ success: false, data: {}, error: error.message });
        return;
      }
    }
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ success: false, data: {}, error: "Unable to logout" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, data: {}, error: "Refresh token is required" });
      return;
    }
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result, error: null });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_REFRESH_TOKEN") {
        res
          .status(401)
          .json({ success: false, data: {}, error: "Invalid refresh token" });
        return;
      }
      if (error.message === "TOKEN_REVOKED") {
        res.status(401).json({
          success: false,
          data: {},
          error: "Refresh token has been revoked",
        });
        return;
      }
      if (error.message === "TOKEN_EXPIRED") {
        res.status(401).json({
          success: false,
          data: {},
          error: "Refresh token has expired",
        });
        return;
      }
      if (error.message.startsWith("VALIDATION_ERROR")) {
        res
          .status(400)
          .json({ success: false, data: {}, error: error.message });
        return;
      }
    }
    console.error("Refresh token error:", error);
    res
      .status(500)
      .json({ success: false, data: {}, error: "Unable to refresh token" });
  }
};
