import { likePostHandler, unlikePostHandler } from "../likes.controller";
import * as likesService from "../likes.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testPost,
  testLike,
} from "../../../__tests__/test-helpers";

jest.mock("../likes.service");

describe("Likes Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("likePostHandler", () => {
    it("should like a post successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.likePost as jest.Mock).mockResolvedValue({
        id: testLike.id,
        userId: testUser.id,
        postId: testPost.id,
        createdAt: new Date(),
      });

      await likePostHandler(mockRequest, mockResponse$ as any);

      expect(likesService.likePost).toHaveBeenCalledWith(testUser.id, {
        postId: testPost.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.likePost as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await likePostHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if user already liked the post", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.likePost as jest.Mock).mockRejectedValue({
        status: 400,
        error: "User has already liked this post",
      });

      await likePostHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });

  describe("unlikePostHandler", () => {
    it("should unlike a post successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.unlikePost as jest.Mock).mockResolvedValue({
        message: "Post unliked successfully",
      });

      await unlikePostHandler(mockRequest, mockResponse$ as any);

      expect(likesService.unlikePost).toHaveBeenCalledWith(testUser.id, {
        postId: testPost.id,
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.unlikePost as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await unlikePostHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 if user has not liked the post", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (likesService.unlikePost as jest.Mock).mockRejectedValue({
        status: 400,
        error: "User has not liked this post",
      });

      await unlikePostHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });
});
