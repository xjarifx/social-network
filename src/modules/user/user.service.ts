import { PrismaClient } from "../../generated/prisma/index.js";
import { updateProfileSchema } from "./user.validation.js";

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string) => {
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
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export const getUserTimeline = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
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

export const updateUserProfile = async (userId: string, input: any) => {
  // Validate input
  const validationResult = updateProfileSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const { firstName, lastName } = input;

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
