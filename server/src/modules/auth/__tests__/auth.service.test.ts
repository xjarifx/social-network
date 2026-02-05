import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { testUser } from "../../../__tests__/test-helpers";

// Mock Prisma BEFORE importing auth.service
jest.mock("../../../generated/prisma/index");

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

import { PrismaClient } from "../../../generated/prisma/index";
(PrismaClient as any).mockImplementation(() => mockPrisma);

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../auth.service";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should register a new user with valid input", async () => {
      const input = {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      };

      const hashedPassword = "hashed_password_123";

      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // No existing email
      mockPrisma.user.findUnique.mockResolvedValueOnce(null); // No existing username
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.user.create.mockResolvedValue({
        id: testUser.id,
        ...input,
        password: hashedPassword,
        createdAt: new Date(),
        deletedAt: null,
      });
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("test-jwt-token")
        .mockReturnValueOnce("test-refresh-token");
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await registerUser(input);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refreshToken");
      expect(result.username).toBe(testUser.username);
      expect(result.email).toBe(testUser.email);
    });

    it("should throw EMAIL_TAKEN error if email exists", async () => {
      const input = {
        username: "newuser",
        email: testUser.email,
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        email: testUser.email,
      });

      await expect(registerUser(input)).rejects.toThrow("EMAIL_TAKEN");
    });

    it("should throw USERNAME_TAKEN error if username exists", async () => {
      const input = {
        username: testUser.username,
        email: "newemail@example.com",
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // No existing email
        .mockResolvedValueOnce({
          id: testUser.id,
          username: testUser.username,
        }); // Username exists

      await expect(registerUser(input)).rejects.toThrow("USERNAME_TAKEN");
    });

    it("should throw error for invalid email format", async () => {
      const input = {
        username: "newuser",
        email: "invalid-email",
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      await expect(registerUser(input)).rejects.toThrow();
    });

    it("should throw error for weak password", async () => {
      const input = {
        username: "newuser",
        email: "new@example.com",
        password: "weak", // Too weak
        firstName: "New",
        lastName: "User",
      };

      await expect(registerUser(input)).rejects.toThrow();
    });
  });

  describe("loginUser", () => {
    it("should login user with valid credentials", async () => {
      const input = {
        email: testUser.email,
        password: testUser.password,
      };

      const hashedPassword = "hashed_password_123";

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("test-jwt-token")
        .mockReturnValueOnce("test-refresh-token");
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await loginUser(input);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refreshToken");
      expect(result.email).toBe(testUser.email);
    });

    it("should throw INVALID_CREDENTIALS error if user not found", async () => {
      const input = {
        email: "nonexistent@example.com",
        password: testUser.password,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(loginUser(input)).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("should throw INVALID_CREDENTIALS error if password is wrong", async () => {
      const input = {
        email: testUser.email,
        password: "wrongpassword",
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        password: "hashed_correct_password",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(loginUser(input)).rejects.toThrow("INVALID_CREDENTIALS");
    });
  });

  describe("logoutUser", () => {
    it("should logout user successfully", async () => {
      const refreshToken = "valid-refresh-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        revokedAt: null,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const result = await logoutUser(refreshToken);

      expect(result).toHaveProperty("message");
      expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
    });

    it("should throw INVALID_REFRESH_TOKEN error if token not found", async () => {
      const refreshToken = "invalid-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(logoutUser(refreshToken)).rejects.toThrow(
        "INVALID_REFRESH_TOKEN",
      );
    });

    it("should throw TOKEN_ALREADY_REVOKED error if token is revoked", async () => {
      const refreshToken = "revoked-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        revokedAt: new Date(),
      });

      await expect(logoutUser(refreshToken)).rejects.toThrow(
        "TOKEN_ALREADY_REVOKED",
      );
    });
  });

  describe("refreshAccessToken", () => {
    it("should refresh access token successfully", async () => {
      const refreshToken = "valid-refresh-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        userId: testUser.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        user: { id: testUser.id },
      });
      (jwt.verify as jest.Mock).mockReturnValue({});
      (jwt.sign as jest.Mock)
        .mockReturnValueOnce("new-jwt-token")
        .mockReturnValueOnce("new-refresh-token");
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await refreshAccessToken(refreshToken);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("refreshToken");
    });

    it("should throw INVALID_REFRESH_TOKEN error if token not found", async () => {
      const refreshToken = "invalid-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        "INVALID_REFRESH_TOKEN",
      );
    });

    it("should throw TOKEN_REVOKED error if token is revoked", async () => {
      const refreshToken = "revoked-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        revokedAt: new Date(),
      });

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        "TOKEN_REVOKED",
      );
    });

    it("should throw TOKEN_EXPIRED error if token is expired", async () => {
      const refreshToken = "expired-token";

      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: refreshToken,
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      });

      await expect(refreshAccessToken(refreshToken)).rejects.toThrow(
        "TOKEN_EXPIRED",
      );
    });
  });
});
