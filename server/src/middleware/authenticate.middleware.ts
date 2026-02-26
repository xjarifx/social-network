import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string | undefined = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice(7);
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({ error: "Authorization header missing or invalid" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token has expired" });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const authenticateOptional = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = extractToken(req);

    if (!token) {
      next();
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    req.userId = decoded.userId;
    next();
  } catch (error) {
    // For optional auth, we intentionally ignore invalid tokens
    console.warn("Optional authentication token ignored:", error);
    next();
  }
};
