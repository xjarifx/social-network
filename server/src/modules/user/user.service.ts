import { prisma } from "../../lib/prisma";
import {
  buildCacheKey,
  cacheGet,
  cacheSet,
  invalidateTags,
} from "../../lib/cache";
import {
  updateProfileSchema,
  userIdParamSchema,
  searchUsersSchema,
} from "./user.validation";

const PROFILE_TTL_SECONDS = 120;
const TIMELINE_TTL_SECONDS = 30;

export const getCurrentUserProfile = async (userId: string) => {
  const cacheKey = buildCacheKey("user", "current", userId);
  const cached = await cacheGet<{
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
    plan: string | null;
  }>(cacheKey);
  if (cached) {
    return cached;
  }

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
      plan: true,
    },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  await cacheSet(cacheKey, user, {
    ttlSeconds: PROFILE_TTL_SECONDS,
    tags: [`user:${userId}`],
  });

  return user;
};

export const getUserProfile = async (params: Record<string, unknown>) => {
  const validation = userIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const userId = validation.data.params.userId;
  const cacheKey = buildCacheKey("user", "public", userId);
  const cached = await cacheGet<{
    id: string;
    username: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    createdAt: Date;
  }>(cacheKey);
  if (cached) {
    return cached;
  }

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
      plan: true,
    },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  await cacheSet(cacheKey, user, {
    ttlSeconds: PROFILE_TTL_SECONDS,
    tags: [`user:${userId}`],
  });

  return user;
};

export const getUserTimeline = async (
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  viewerId?: string,
) => {
  const paramValidation = userIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const userId = paramValidation.data.params.userId;
  const limit = query.limit ? parseInt(query.limit as string) : 10;
  const offset = query.offset ? parseInt(query.offset as string) : 0;
  const cacheKey = buildCacheKey(
    "timeline",
    userId,
    viewerId || "anon",
    limit,
    offset,
  );
  const cached = await cacheGet<{
    posts: Array<{
      id: string;
      content: string | null;
      imageUrl: string | null;
      visibility: string;
      author: {
        id: string;
        username: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
      };
      likesCount: number;
      commentsCount: number;
      likes: string[];
      createdAt: Date;
      updatedAt: Date;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>(cacheKey);
  if (cached) {
    return cached;
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  // Get user's posts with pagination
  const posts = await prisma.post.findMany({
    where: {
      authorId: userId,
      ...(viewerId && viewerId === userId ? {} : { visibility: "PUBLIC" }),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          plan: true,
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
    where: {
      authorId: userId,
      ...(viewerId && viewerId === userId ? {} : { visibility: "PUBLIC" }),
    },
  });

  const response = {
    posts: posts.map((post) => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      visibility: post.visibility,
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

  await cacheSet(cacheKey, response, {
    ttlSeconds: TIMELINE_TTL_SECONDS,
    tags: [`timeline:user:${userId}`],
  });

  return response;
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

  await invalidateTags([`user:${userId}`, `timeline:user:${userId}`]);

  return updatedUser;
};

export const searchUsers = async (query: Record<string, unknown>) => {
  const validation = searchUsersSchema.safeParse({ query });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { q, limit: limitStr, offset: offsetStr } = validation.data.query;
  const limit = parseInt(limitStr as string);
  const offset = parseInt(offsetStr as string);

  // Search for users by full name (firstName and lastName combined)
  // Use case-insensitive partial matching
  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          firstName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
      deletedAt: null,
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      plan: true,
      createdAt: true,
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await prisma.user.count({
    where: {
      OR: [
        {
          firstName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          username: {
            contains: q,
            mode: "insensitive",
          },
        },
      ],
      deletedAt: null,
    },
  });

  return {
    results: users,
    total,
    limit,
    offset,
  };
};
