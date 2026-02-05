import {
  createCommentHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} from "../comments.controller";
import * as commentsService from "../comments.service";
import {
  createMockRequest,
  createMockResponse,
  testUser,
  testPost,
  testComment,
} from "../../../__tests__/test-helpers";

jest.mock("../comments.service");

describe("Comments Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCommentHandler", () => {
    it("should create a comment successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
        body: {
          content: "Great post!",
        },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.createComment as jest.Mock).mockResolvedValue({
        id: testComment.id,
        postId: testPost.id,
        authorId: testUser.id,
        content: "Great post!",
        createdAt: new Date(),
      });

      await createCommentHandler(mockRequest, mockResponse$ as any);

      expect(commentsService.createComment).toHaveBeenCalledWith(
        testUser.id,
        {
          postId: testPost.id,
        },
        { content: "Great post!" },
      );
      expect(mockResponse$.status).toHaveBeenCalledWith(201);
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: "nonexistent-id" },
        body: { content: "Comment" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.createComment as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await createCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });

    it("should return 400 for invalid comment content", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id },
        body: { content: "" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.createComment as jest.Mock).mockRejectedValue({
        status: 400,
        error: "Comment content is required",
      });

      await createCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getCommentsHandler", () => {
    it("should get comments for a post", async () => {
      const mockRequest: any = createMockRequest({
        params: { postId: testPost.id },
        query: { limit: "20", offset: "0" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.getComments as jest.Mock).mockResolvedValue({
        comments: [
          {
            id: testComment.id,
            postId: testPost.id,
            authorId: testUser.id,
            content: "Great post!",
            createdAt: new Date(),
          },
        ],
        total: 1,
      });

      await getCommentsHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 404 if post not found", async () => {
      const mockRequest: any = createMockRequest({
        params: { postId: "nonexistent-id" },
        query: {},
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.getComments as jest.Mock).mockRejectedValue({
        status: 404,
        error: "Post not found",
      });

      await getCommentsHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(404);
    });
  });

  describe("updateCommentHandler", () => {
    it("should update a comment successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id, commentId: testComment.id },
        body: { content: "Updated comment" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.updateComment as jest.Mock).mockResolvedValue({
        id: testComment.id,
        postId: testPost.id,
        authorId: testUser.id,
        content: "Updated comment",
        updatedAt: new Date(),
      });

      await updateCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if user is not the comment author", async () => {
      const mockRequest: any = createMockRequest({
        userId: "different-user-id",
        params: { postId: testPost.id, commentId: testComment.id },
        body: { content: "Hacked!" },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.updateComment as jest.Mock).mockRejectedValue({
        status: 403,
        error: "Forbidden: Only the comment author can update this comment",
      });

      await updateCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(403);
    });
  });

  describe("deleteCommentHandler", () => {
    it("should delete a comment successfully", async () => {
      const mockRequest: any = createMockRequest({
        userId: testUser.id,
        params: { postId: testPost.id, commentId: testComment.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.deleteComment as jest.Mock).mockResolvedValue({
        message: "Comment deleted successfully",
      });

      await deleteCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(200);
    });

    it("should return 403 if user is not the comment author", async () => {
      const mockRequest: any = createMockRequest({
        userId: "different-user-id",
        params: { postId: testPost.id, commentId: testComment.id },
      });

      const mockResponse$ = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (commentsService.deleteComment as jest.Mock).mockRejectedValue({
        status: 403,
        error: "Forbidden: Only the comment author can delete this comment",
      });

      await deleteCommentHandler(mockRequest, mockResponse$ as any);

      expect(mockResponse$.status).toHaveBeenCalledWith(403);
    });
  });
});
