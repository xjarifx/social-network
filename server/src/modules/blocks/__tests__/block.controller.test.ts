import { block, getBlocked, unblock } from "../block.controller";
import * as blockService from "../block.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testUser2,
} from "../../../__tests__/test-helpers";

jest.mock("../block.service");

describe("Block Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("block", () => {
    it("should block a user successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { blockedUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.blockUser as jest.Mock).mockResolvedValue({
        blockerId: testUser.id,
        blockedUserId: testUser2.id,
        createdAt: new Date(),
      });

      await block(mockRequest, mockResponse$ as any);

      expect(blockService.blockUser).toHaveBeenCalledWith(testUser.id, {
        blockedUserId: testUser2.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if trying to block self", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { blockedUserId: testUser.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.blockUser as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Cannot block yourself",
      });

      await block(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });

    it("should return 404 if user not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { blockedUserId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.blockUser as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await block(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 409 if user is already blocked", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { blockedUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.blockUser as jest.Mock).mockRejectedValue({
        status: 409,
        error: "User is already blocked",
      });

      await block(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
    });
  });

  describe("getBlocked", () => {
    it("should get list of blocked users", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        query: { limit: "20", offset: "0" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.getBlockedUsers as jest.Mock).mockResolvedValue({
        blocked: [
          {
            id: testUser2.id,
            username: testUser2.username,
          },
        ],
        total: 1,
      });

      await getBlocked(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 401 if unauthorized", async () => {
      const mockRequest: any = createMockRequest({
        userId: undefined,
        query: {},
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.getBlockedUsers as jest.Mock).mockRejectedValue({
        status: 401,
        error: "Unauthorized",
      });

      await getBlocked(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(401);
    });
  });

  describe("unblock", () => {
    it("should unblock a user successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { blockedUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      (blockService.unblockUser as jest.Mock).mockResolvedValue({});

      await unblock(mockRequest, mockResponse$ as any);

      expect(blockService.unblockUser).toHaveBeenCalledWith(testUser.id, {
        blockedUserId: testUser2.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(204);
    });

    it("should return 404 if user not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { blockedUserId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.unblockUser as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await unblock(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if user is not blocked", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { blockedUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (blockService.unblockUser as jest.Mock).mockRejectedValue({
        status: 400,
        error: "User is not blocked",
      });

      await unblock(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });
});
