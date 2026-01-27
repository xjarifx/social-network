import { PrismaClient } from "../../generated/prisma/index.js";
import { createCommentSchema, updateCommentSchema } from "./comments.validation.js";

const prisma = new PrismaClient();

export const createComment = async (
  userId: string,
  postId: string,
  input: any,
) => {
  // Validate input
  const validationResult = createCommentSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  const { content } = input;

  // Create comment and increment comment count in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Increment comments count
    await tx.post.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    return comment;
  });

  return {
    id: result.id,
    content: result.content,
    author: result.author,
    postId: result.postId,
    createdAt: result.createdAt,
  };
};

export const getComments = async (
  postId: string,
  limit: number = 10,
  offset: number = 0,
) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
  });

  const total = await prisma.comment.count({
    where: { postId },
  });

  return {
    comments: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      postId: comment.postId,
      createdAt: comment.createdAt,
    })),
    total,
    limit,
    offset,
  };
};

export const updateComment = async (
  commentId: string,
  userId: string,
  input: any,
) => {
  // Validate input
  const validationResult = updateCommentSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  // Check if user is the comment author
  if (comment.authorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  const { content } = input;

  // Update comment
  const updatedComment = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    author: updatedComment.author,
    postId: updatedComment.postId,
    createdAt: updatedComment.createdAt,
  };
};

export const deleteComment = async (commentId: string, userId: string) => {
  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  // Check if user is the comment author
  if (comment.authorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  // Delete comment and decrement comment count in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.comment.delete({
      where: { id: commentId },
    });

    // Decrement comments count
    await tx.post.update({
      where: { id: comment.postId },
      data: {
        commentsCount: {
          decrement: 1,
        },
      },
    });
  });

  return { message: "Comment deleted successfully" };
};
