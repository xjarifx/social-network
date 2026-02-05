import { PrismaClient } from '../../generated/prisma/index';
import { updateProfileSchema, userIdParamSchema } from './user.validation';

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const getUserProfile = async (params: Record<string, unknown>) => {
  const validation = userIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const userId = validation.data.params.userId;

  // Fetch user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  return user;
};

export const getUserTimeline = async (
  params: Record<string, unknown>,
  query: Record<string, unknown>,
) => {
  const paramValidation = userIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const userId = paramValidation.data.params.userId;
  const limit = query.limit ? parseInt(query.limit as string) : 10;
  const offset = query.offset ? parseInt(query.offset as string) : 0;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  // Get user's posts with pagination
  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.post.count({
    where: { authorId: userId },
  });

  return {
    posts: posts.map((post) => ({
      id: post.id,
      content: post.content,
      author: post.author,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      likes: post.likes.map((like) => like.userId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
    total,
    limit,
    offset,
  };
};

export const updateUserProfile = async (
  userId: string,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const paramValidation = userIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const profileUserId = paramValidation.data.params.userId;

  // Check if user is updating their own profile
  if (profileUserId !== userId) {
    throw { status: 403, error: "Cannot update other user's profile" };
  }

  // Validate input
  const bodyValidation = updateProfileSchema.safeParse({ body });
  if (!bodyValidation.success) {
    throw { status: 400, error: bodyValidation.error.flatten() };
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  const { firstName, lastName } = bodyValidation.data.body;

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  return updatedUser;
};
