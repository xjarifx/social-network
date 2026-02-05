import { register, login, logout, refresh } from "../auth.controller";
import * as authService from "../auth.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  generateTestToken,
  generateTestRefreshToken,
} from "../../../__tests__/test-helpers";

jest.mock("../auth.service");

describe("Auth Controller", () => {
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const token = generateTestToken(testUser.id);
      const refreshToken = generateTestRefreshToken(testUser.id);

      mockRequest.body = {
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.registerUser as jest.Mock).mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        createdAt: new Date(),
        token,
        refreshToken,
      });

      await register(mockRequest as any, mockResponse$ as any);

      expect(authService.registerUser).toHaveBeenCalledWith({
        username: testUser.username,
        email: testUser.email,
        password: testUser.password,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
      expect(mockResponse$.json).toHaveBeenCalled();
    });

    it("should return 409 if email is already taken", async () => {
      mockRequest.body = {
        username: "newuser",
        email: testUser.email,
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("EMAIL_TAKEN"),
      );

      await register(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Email already in use",
      });
    });

    it("should return 409 if username is already taken", async () => {
      mockRequest.body = {
        username: testUser.username,
        email: "newemail@example.com",
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("USERNAME_TAKEN"),
      );

      await register(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Username already in use",
      });
    });

    it("should return 500 on database error", async () => {
      mockRequest.body = {
        username: "newuser",
        email: "new@example.com",
        password: testUser.password,
        firstName: "New",
        lastName: "User",
      };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.registerUser as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await register(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(500);
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      mockRequest.body = {
        email: testUser.email,
        password: testUser.password,
      };

      const token = generateTestToken(testUser.id);
      const refreshToken = generateTestRefreshToken(testUser.id);

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.loginUser as jest.Mock).mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        token,
        refreshToken,
      });

      await login(mockRequest as any, mockResponse$ as any);

      expect(authService.loginUser).toHaveBeenCalledWith({
        email: testUser.email,
        password: testUser.password,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 401 for invalid credentials", async () => {
      mockRequest.body = {
        email: testUser.email,
        password: "wrongpassword",
      };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.loginUser as jest.Mock).mockRejectedValue(
        new Error("INVALID_CREDENTIALS"),
      );

      await login(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(401);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Invalid email or password",
      });
    });
  });

  describe("logout", () => {
    it("should logout user successfully", async () => {
      const refreshToken = generateTestRefreshToken(testUser.id);
      mockRequest.body = { refreshToken };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.logoutUser as jest.Mock).mockResolvedValue({
        message: "Logged out successfully",
      });

      await logout(mockRequest as any, mockResponse$ as any);

      expect(authService.logoutUser).toHaveBeenCalledWith(refreshToken);
      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if refresh token is missing", async () => {
      mockRequest.body = {};

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await logout(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Refresh token is required",
      });
    });

    it("should return 401 for invalid refresh token", async () => {
      mockRequest.body = { refreshToken: "invalid-token" };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.logoutUser as jest.Mock).mockRejectedValue(
        new Error("INVALID_REFRESH_TOKEN"),
      );

      await logout(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(401);
    });
  });

  describe("refresh", () => {
    it("should refresh access token successfully", async () => {
      const oldRefreshToken = generateTestRefreshToken(testUser.id);
      const newToken = generateTestToken(testUser.id);

      mockRequest.body = { refreshToken: oldRefreshToken };

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (authService.refreshAccessToken as jest.Mock).mockResolvedValue({
        token: newToken,
      });

      await refresh(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 400 if refresh token is missing", async () => {
      mockRequest.body = {};

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await refresh(mockRequest as any, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });
});
