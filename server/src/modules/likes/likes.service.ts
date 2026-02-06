import { PrismaClient } from "../../generated/prisma/index";
import { likePostParamsSchema } from "./likes.validation";

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

export const getPostLikes = async (
  params: Record<string, unknown>,
  query: Record<string, unknown>,
) => {
  const paramValidation = likePostParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
  const offset = query.offset ? parseInt(query.offset as string, 10) : 0;

  const { postId } = paramValidation.data.params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  const total = await prisma.like.count({ where: { postId } });

  return {
    likes: likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      user: like.user,
      createdAt: like.createdAt,
    })),
    total,
    limit,
    offset,
  };
};
