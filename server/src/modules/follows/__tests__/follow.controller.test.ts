import {
  follow,
  getUserFollowers,
  getUserFollowing,
  unfollow,
} from "../follow.controller";
import * as followService from "../follow.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testUser2,
} from "../../../__tests__/test-helpers";

jest.mock("../follow.service");

describe("Follow Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("follow", () => {
    it("should follow a user successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { targetUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.followUser as jest.Mock).mockResolvedValue({
        follower: testUser.id,
        following: testUser2.id,
        createdAt: new Date(),
      });

      await follow(mockRequest, mockResponse$ as any);

      expect(followService.followUser).toHaveBeenCalledWith(testUser.id, {
        targetUserId: testUser2.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
    });

    it("should return 404 if target user not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { targetUserId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.followUser as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await follow(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if trying to follow self", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { targetUserId: testUser.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.followUser as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Cannot follow yourself",
      });

      await follow(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });

    it("should return 409 if already following", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { targetUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.followUser as jest.Mock).mockRejectedValue({
        status: 409,
        error: "Already following this user",
      });

      await follow(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(409);
    });
  });

  describe("getUserFollowers", () => {
    it("should get user followers successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.getFollowers as jest.Mock).mockResolvedValue({
        followers: [
          {
            id: testUser2.id,
            username: testUser2.username,
          },
        ],
        total: 1,
      });

      await getUserFollowers(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });
  });

  describe("getUserFollowing", () => {
    it("should get user following list successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.getFollowing as jest.Mock).mockResolvedValue({
        following: [
          {
            id: testUser2.id,
            username: testUser2.username,
          },
        ],
        total: 1,
      });

      await getUserFollowing(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });
  });

  describe("unfollow", () => {
    it("should unfollow a user successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { targetUserId: testUser2.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      (followService.unfollowUser as jest.Mock).mockResolvedValue({
        message: "Unfollowed successfully",
      });

      await unfollow(mockRequest, mockResponse$ as any);

      expect(followService.unfollowUser).toHaveBeenCalledWith(testUser.id, {
        targetUserId: testUser2.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(204);
    });

    it("should return 404 if target user not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { targetUserId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (followService.unfollowUser as jest.Mock).mockRejectedValue({
        status: 404,
        error: "User not found",
      });

      await unfollow(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });
});
