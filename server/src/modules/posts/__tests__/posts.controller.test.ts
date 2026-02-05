import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
} from "../posts.controller";
import * as postsService from "../posts.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testPost,
} from "../../../__tests__/test-helpers";

jest.mock("../posts.service");

describe("Posts Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNewPost", () => {
    it("should create a new post successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: {
          content: "This is a new test post",
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.createPost as jest.Mock).mockResolvedValue({
        id: testPost.id,
        authorId: testUser.id,
        content: "This is a new test post",
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createNewPost(mockRequest, mockResponse$ as any);

      expect(postsService.createPost).toHaveBeenCalledWith(testUser.id, {
        content: "This is a new test post",
      });
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
      expect(mockResponse$.json).toHaveBeenCalled();
    });

    it("should return 400 for invalid content", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: { content: "" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.createPost as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Content is required",
      });

      await createNewPost(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for content exceeding max length", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        body: {
          content: "a".repeat(5001), // Exceeds max length
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.createPost as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Content exceeds maximum length",
      });

      await createNewPost(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getPost", () => {
    it("should get a post by ID", async () => {
      const mockRequest: any = createMockRequest({
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.getPostById as jest.Mock).mockResolvedValue({
        id: testPost.id,
        authorId: testUser.id,
        content: testPost.content,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
      });

      await getPost(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
      expect(mockResponse$.json).toHaveBeenCalled();
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        params: { postId: "nonexistent-id" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.getPostById as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await getPost(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid post ID format", async () => {
      const mockRequest: any = createMockRequest({
        params: { postId: "invalid-format" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.getPostById as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Invalid post ID",
      });

      await getPost(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updatePostContent", () => {
    it("should update post content successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
        body: {
          content: "Updated post content",
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.updatePost as jest.Mock).mockResolvedValue({
        id: testPost.id,
        authorId: testUser.id,
        content: "Updated post content",
        likesCount: 0,
        commentsCount: 0,
        updatedAt: new Date(),
      });

      await updatePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if user is not the post author", async () => {
      const mockRequest: any = createMockRequest({
        userId: "different-user-id",
        params: { postId: testPost.id },
        body: { content: "Hacked!" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.updatePost as jest.Mock).mockRejectedValue({
        status: 403,
        error: "Forbidden: Only the post author can update this post",
      });

      await updatePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(403);
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: "nonexistent-id" },
        body: { content: "Update" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.updatePost as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await updatePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deletePostContent", () => {
    it("should delete a post successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.deletePost as jest.Mock).mockResolvedValue({
        message: "Post deleted successfully",
      });

      await deletePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if user is not the post author", async () => {
      const mockRequest: any = createMockRequest({
        userId: "different-user-id",
        params: { postId: testPost.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (postsService.deletePost as jest.Mock).mockRejectedValue({
        status: 403,
        error: "Forbidden: Only the post author can delete this post",
      });

      await deletePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(403);
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

      (postsService.deletePost as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await deletePostContent(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });
});
