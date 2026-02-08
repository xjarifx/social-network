import { PrismaClient } from "../../generated/prisma/index";
import {
  commentIdParamSchema,
  createCommentSchema,
  getCommentsQuerySchema,
  postIdParamSchema,
  updateCommentSchema,
} from "./comments.validation";

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const createComment = async (
  userId: unknown,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const validationResult = createCommentSchema.safeParse({ body });

  if (!validationResult.success) {
    throw { status: 400, error: validationResult.error.flatten() };
  }

  const { postId } = paramValidation.data.params;
  const authorId = ensureString(userId);

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  const { content } = validationResult.data.body;

  // Create comment and increment comment count in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content,
        authorId,
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
  params: Record<string, unknown>,
  query: Record<string, unknown>,
  userId?: unknown,
) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const queryValidation = getCommentsQuerySchema.safeParse({ query });
  if (!queryValidation.success) {
    throw { status: 400, error: queryValidation.error.flatten() };
  }

  const { postId } = paramValidation.data.params;
  const { limit, offset } = queryValidation.data.query;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  const total = await prisma.comment.count({
    where: { postId },
  });

  const authorId = ensureString(userId);
  const includeAuthor = {
    author: {
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    },
  };

  let comments = [] as Array<{
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    } | null;
    postId: string;
    createdAt: Date;
  }>;

  if (!authorId) {
    comments = await prisma.comment.findMany({
      where: { postId },
      include: includeAuthor,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  } else {
    const userWhere = { postId, authorId };
    const otherWhere = { postId, NOT: { authorId } };
    const userCount = await prisma.comment.count({ where: userWhere });

    if (offset < userCount) {
      const userTake = Math.min(limit, userCount - offset);
      const userComments = await prisma.comment.findMany({
        where: userWhere,
        include: includeAuthor,
        orderBy: {
          createdAt: "desc",
        },
        take: userTake,
        skip: offset,
      });

      const remaining = limit - userTake;
      if (remaining > 0) {
        const otherComments = await prisma.comment.findMany({
          where: otherWhere,
          include: includeAuthor,
          orderBy: {
            createdAt: "desc",
          },
          take: remaining,
          skip: 0,
        });
        comments = [...userComments, ...otherComments];
      } else {
        comments = userComments;
      }
    } else {
      const otherOffset = offset - userCount;
      comments = await prisma.comment.findMany({
        where: otherWhere,
        include: includeAuthor,
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: otherOffset,
      });
    }
  }

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
  userId: unknown,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const paramValidation = commentIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const validationResult = updateCommentSchema.safeParse({ body });

  if (!validationResult.success) {
    throw { status: 400, error: validationResult.error.flatten() };
  }

  const { commentId } = paramValidation.data.params;
  const authorId = ensureString(userId);

  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw { status: 404, error: "Comment not found" };
  }

  // Check if user is the comment author
  if (comment.authorId !== authorId) {
    throw { status: 403, error: "Cannot update other user's comment" };
  }

  const { content } = validationResult.data.body;

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

export const deleteComment = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = commentIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { commentId } = paramValidation.data.params;
  const authorId = ensureString(userId);
  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw { status: 404, error: "Comment not found" };
  }

  // Check if user is the comment author
  if (comment.authorId !== authorId) {
    throw { status: 403, error: "Cannot delete other user's comment" };
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
