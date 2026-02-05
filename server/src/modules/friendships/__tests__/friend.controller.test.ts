import {
  sendRequest,
  getUserFriends,
  acceptRequest,
  rejectRequest,
} from "../friend.controller.js";
import * as friendService from "../friend.service.js";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testUser2,
} from "../../../__tests__/test-helpers.js";

jest.mock("../friend.service.js");

describe("Friend Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendRequest", () => {
    it("should send friend request successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { recipientId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.sendFriendRequest as jest.Mock).mockResolvedValue({
        senderId: testUser.id,
        recipientId: testUser2.id,
        status: "PENDING",
        createdAt: new Date(),
      });

      await sendRequest(mockRequest, mockResponse$ as any);

      expect(friendService.sendFriendRequest).toHaveBeenCalledWith(
        testUser.id,
        testUser2.id,
      );
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 for self request", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { recipientId: testUser.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.sendFriendRequest as jest.Mock).mockRejectedValue(
        new Error("SELF_REQUEST"),
      );

      await sendRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Cannot send request to yourself",
      });
    });

    it("should return 404 if recipient not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { recipientId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.sendFriendRequest as jest.Mock).mockRejectedValue(
        new Error("USER_NOT_FOUND"),
      );

      await sendRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Recipient not found",
      });
    });

    it("should return 409 if request already exists", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { recipientId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.sendFriendRequest as jest.Mock).mockRejectedValue(
        new Error("REQUEST_EXISTS"),
      );

      await sendRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Friend request already exists",
      });
    });

    it("should return 409 if already friends", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { recipientId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.sendFriendRequest as jest.Mock).mockRejectedValue(
        new Error("ALREADY_FRIENDS"),
      );

      await sendRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
      expect(mockResponse$.json).toHaveBeenCalledWith({
        error: "Users are already friends",
      });
    });
  });

  describe("getUserFriends", () => {
    it("should get user friends list", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.getFriends as jest.Mock).mockResolvedValue({
        friends: [
          {
            id: testUser2.id,
            username: testUser2.username,
          },
        ],
        total: 1,
      });

      await getUserFriends(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });
  });

  describe("acceptRequest", () => {
    it("should accept friend request successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { requestId: "request-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.acceptFriendRequest as jest.Mock).mockResolvedValue({
        message: "Friend request accepted",
      });

      await acceptRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if request not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { requestId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.acceptFriendRequest as jest.Mock).mockRejectedValue(
        new Error("REQUEST_NOT_FOUND"),
      );

      await acceptRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });

  describe("rejectRequest", () => {
    it("should reject friend request successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { requestId: "request-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.rejectFriendRequest as jest.Mock).mockResolvedValue({
        message: "Friend request rejected",
      });

      await rejectRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if request not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { requestId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (friendService.rejectFriendRequest as jest.Mock).mockRejectedValue(
        new Error("REQUEST_NOT_FOUND"),
      );

      await rejectRequest(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });
});
