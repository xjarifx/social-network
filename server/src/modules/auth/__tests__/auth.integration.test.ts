import request from "supertest";
import express, { Express } from "express";
import authRouter from "../auth.routes.js";
import {
  generateTestToken,
  testUser,
} from "../../../__tests__/test-helpers.js";
import * as authService from "../auth.service.js";

jest.mock("../auth.service.js");

describe("Auth API Integration Tests", () => {
  let app: Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/", authRouter);
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("should register a new user", async () => {
      const userData = {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      };

      (authService.registerUser as jest.Mock).mockResolvedValue({
        id: testUser.id,
        ...userData,
        token: "test-token",
        refreshToken: "test-refresh-token",
      });

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("token");
      expect(response.body.username).toBe(testUser.username);
    });

    it("should return 409 on duplicate email", async () => {
      const userData = {
        username: "newuser",
        email: testUser.email,
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("EMAIL_TAKEN"),
      );

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 409 on duplicate username", async () => {
      const userData = {
        username: testUser.username,
        email: "newemail@example.com",
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("USERNAME_TAKEN"),
      );

      const response = await request(app)
        .post("/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /login", () => {
    it("should login successfully", async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password,
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        token: "test-token",
        refreshToken: "test-refresh-token",
      });

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("refreshToken");
    });

    it("should return 401 for invalid credentials", async () => {
      const loginData = {
        email: testUser.email,
        password: "wrongpassword",
      };

      (authService.loginUser as jest.Mock).mockRejectedValue(
        new Error("INVALID_CREDENTIALS"),
      );

      const response = await request(app)
        .post("/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /logout", () => {
    it("should logout successfully", async () => {
      const logoutData = {
        refreshToken: "test-refresh-token",
      };

      (authService.logoutUser as jest.Mock).mockResolvedValue({
        message: "Logged out successfully",
      });

      const response = await request(app)
        .post("/logout")
        .send(logoutData)
        .expect(200);

      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if refresh token is missing", async () => {
      const response = await request(app).post("/logout").send({}).expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 for invalid token", async () => {
      const logoutData = {
        refreshToken: "invalid-token",
      };

      (authService.logoutUser as jest.Mock).mockRejectedValue(
        new Error("INVALID_REFRESH_TOKEN"),
      );

      const response = await request(app)
        .post("/logout")
        .send(logoutData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /refresh", () => {
    it("should refresh token successfully", async () => {
      const refreshData = {
        refreshToken: "test-refresh-token",
      };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        token: "new-token",
        refreshToken: "new-refresh-token",
      });

      const response = await request(app)
        .post("/refresh")
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty("token");
    });

    it("should return 400 if refresh token is missing", async () => {
      const response = await request(app).post("/refresh").send({}).expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 for invalid token", async () => {
      const refreshData = {
        refreshToken: "invalid-token",
      };

      (authService.refreshAccessToken as jest.Mock).mockRejectedValue(
        new Error("INVALID_REFRESH_TOKEN"),
      );

      const response = await request(app)
        .post("/refresh")
        .send(refreshData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 401 for revoked token", async () => {
      const refreshData = {
        refreshToken: "revoked-token",
      };

      (authService.refreshAccessToken as jest.Mock).mockRejectedValue(
        new Error("TOKEN_REVOKED"),
      );

      const response = await request(app)
        .post("/refresh")
        .send(refreshData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
    });
  });
});
