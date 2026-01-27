import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const likePost = async (userId: string, postId: string) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  // Check if already liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (existingLike) {
    throw new Error("ALREADY_LIKED");
  }

  // Create like and increment like count in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const like = await tx.like.create({
      data: {
        userId,
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

export const unlikePost = async (userId: string, postId: string) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  // Check if like exists
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });

  if (!existingLike) {
    throw new Error("LIKE_NOT_FOUND");
  }

  // Delete like and decrement like count in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.like.delete({
      where: {
        userId_postId: {
          userId,
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
