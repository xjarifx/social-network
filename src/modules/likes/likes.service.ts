import { PrismaClient } from "../../generated/prisma/index.js";
import { likePostParamsSchema } from "./likes.validation.js";

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const likePost = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = likePostParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { postId } = paramValidation.data.params;
  const likerId = ensureString(userId);

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: likerId,
        postId,
      },
    },
  });

  if (existingLike) {
    throw { status: 400, error: "Post already liked" };
  }

  // Create like and increment like count in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const like = await tx.like.create({
      data: {
        userId: likerId,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            likesCount: true,
          },
        },
      },
    });

    // Increment likes count
    await tx.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          increment: 1,
        },
      },
    });

    return like;
  });

  return {
    id: result.id,
    userId: result.userId,
    postId: result.postId,
    user: result.user,
    createdAt: result.createdAt,
    message: "Post liked successfully",
  };
};

export const unlikePost = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = likePostParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { postId } = paramValidation.data.params;
  const likerId = ensureString(userId);

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  // Check if like exists
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: likerId,
        postId,
      },
    },
  });

  if (!existingLike) {
    throw { status: 404, error: "Like not found" };
  }

  // Delete like and decrement like count in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.like.delete({
      where: {
        userId_postId: {
          userId: likerId,
          postId,
        },
      },
    });

    // Decrement likes count
    await tx.post.update({
      where: { id: postId },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });
  });

  return {
    message: "Post unliked successfully",
  };
};
