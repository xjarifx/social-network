import { getProfile, updateProfile, getTimeline } from "../user.controller.js";
import * as userService from "../user.service.js";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testUser2,
} from "../../../__tests__/test-helpers.js";

jest.mock("../user.service.js");

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should get user profile successfully", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: testUser.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserProfile as jest.Mock).mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        createdAt: new Date(),
      });

      await getProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
      expect(mockResponse$.json).toHaveBeenCalled();
    });

    it("should return 404 if user not found", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserProfile as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await getProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid user ID", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: "invalid-id-format" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserProfile as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Invalid user ID",
      });

      await getProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { userId: testUser.id },
        body: {
          firstName: "UpdatedName",
          lastName: "UpdatedLast",
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.updateUserProfile as jest.Mock).mockResolvedValue({
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        firstName: "UpdatedName",
        lastName: "UpdatedLast",
      });

      await updateProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if trying to update another user profile", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { userId: testUser2.id },
        body: {
          firstName: "Hacker",
          lastName: "Attack",
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.updateUserProfile as jest.Mock).mockRejectedValue({
        status: 403,
        error: "Forbidden: Cannot update another user profile",
      });

      await updateProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if user not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: "nonexistent-id",
        params: { userId: "nonexistent-id" },
        body: { firstName: "Test" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.updateUserProfile as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await updateProfile(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getTimeline", () => {
    it("should get user timeline successfully", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: testUser.id },
        query: { limit: "20", offset: "0" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserTimeline as jest.Mock).mockResolvedValue({
        posts: [],
        total: 0,
      });

      await getTimeline(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should handle pagination parameters", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: testUser.id },
        query: { limit: "50", offset: "100" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserTimeline as jest.Mock).mockResolvedValue({
        posts: [],
        total: 0,
      });

      await getTimeline(mockRequest, mockResponse$ as any);

      expect(userService.getUserTimeline).toHaveBeenCalledWith(
        { userId: testUser.id },
        { limit: 50, offset: 100 },
      );
    });

    it("should return 404 if user not found", async () => {
      const mockRequest: any = createMockRequest({
        params: { userId: "nonexistent-id" },
        query: {},
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (userService.getUserTimeline as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await getTimeline(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });
});
