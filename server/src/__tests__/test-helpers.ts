import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

/**
 * Generates a valid JWT token for testing
 */
export const generateTestToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing";
  const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Generates a valid refresh token for testing
 */
export const generateTestRefreshToken = (userId: string): string => {
  const secret =
    process.env.REFRESH_TOKEN_SECRET || "test-refresh-token-secret-for-testing";
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

  return jwt.sign({ userId }, secret, { expiresIn });
};

/**
 * Mock Express request object
 */
export const createMockRequest = (
  overrides?: Partial<Request>,
): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  };
};

/**
 * Mock Express response object
 */
export const createMockResponse = (): Partial<Response> & {
  _getStatusCode: () => number;
  _getJSONData: () => any;
} => {
  let statusCode = 200;
  let jsonData: any = null;

  return {
    status: jest.fn(function (code: number) {
      statusCode = code;
      return this;
    }),
    json: jest.fn(function (data: any) {
      jsonData = data;
      return this;
    }),
    send: jest.fn(function (data: any) {
      return this;
    }),
    setHeader: jest.fn(function () {
      return this;
    }),
    _getStatusCode: () => statusCode,
    _getJSONData: () => jsonData,
  };
};

/**
 * Mock Next function
 */
export const createMockNext = (): NextFunction => {
  return jest.fn();
};

/**
 * Test user data
 */
export const testUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  username: "testuser",
  email: "test@example.com",
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "User",
};

/**
 * Test user data for another user
 */
export const testUser2 = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  username: "testuser2",
  email: "test2@example.com",
  password: "TestPassword456!",
  firstName: "Test",
  lastName: "User2",
};

/**
 * Test post data
 */
export const testPost = {
  id: "650e8400-e29b-41d4-a716-446655440000",
  authorId: testUser.id,
  content: "This is a test post",
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

/**
 * Test comment data
 */
export const testComment = {
  id: "750e8400-e29b-41d4-a716-446655440000",
  postId: testPost.id,
  authorId: testUser.id,
  content: "This is a test comment",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

/**
 * Test like data
 */
export const testLike = {
  id: "850e8400-e29b-41d4-a716-446655440000",
  userId: testUser.id,
  postId: testPost.id,
  createdAt: new Date(),
  deletedAt: null,
};

/**
 * Extract JWT payload safely
 */
export const decodeToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing";
  return jwt.verify(token, secret);
};
