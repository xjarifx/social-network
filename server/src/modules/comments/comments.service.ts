import { prisma } from "../../lib/prisma";
import {
  commentLikeParamsSchema,
  commentIdParamSchema,
  createCommentSchema,
  getCommentLikesQuerySchema,
  getCommentsQuerySchema,
  postIdParamSchema,
  updateCommentSchema,
} from "./comments.validation";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const countCommentSubtree = async (commentId: string): Promise<number> => {
  const visited = new Set<string>();
  let queue = [commentId];

  while (queue.length > 0) {
    const batch = queue;
    queue = [];

    const children = await prisma.comment.findMany({
      where: { parentId: { in: batch } },
      select: { id: true },
    });

    for (const child of children) {
      if (!visited.has(child.id)) {
        visited.add(child.id);
        queue.push(child.id);
      }
    }
  }

  return 1 + visited.size;
};

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

  const { content, parentId } = validationResult.data.body;

  if (parentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId },
    });
    if (!parent) {
      throw { status: 404, error: "Parent comment not found" };
    }
  }

  // Create comment and increment comment count in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const comment = await tx.comment.create({
      data: {
        content,
        authorId,
        postId,
        ...(parentId && { parentId }),
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
        _count: {
          select: {
            replies: true,
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
    parentId: result.parentId,
    likesCount: result.likesCount,
    repliesCount: result._count.replies,
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
  const { limit, offset, parentId } = queryValidation.data.query;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  const total = await prisma.comment.count({
    where: { postId, parentId: parentId ?? null },
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
    _count: {
      select: {
        replies: true,
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
    parentId: string | null;
    likesCount: number;
    _count: { replies: number };
    createdAt: Date;
  }>;

  if (!authorId) {
    comments = await prisma.comment.findMany({
      where: { postId, parentId: parentId ?? null },
      include: includeAuthor,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  } else {
    const userWhere = { postId, authorId, parentId: parentId ?? null };
    const otherWhere = {
      postId,
      parentId: parentId ?? null,
      NOT: { authorId },
    };
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
      parentId: comment.parentId,
      likesCount: comment.likesCount,
      repliesCount: comment._count.replies,
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
      _count: {
        select: {
          replies: true,
        },
      },
    },
  });

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    author: updatedComment.author,
    postId: updatedComment.postId,
    parentId: updatedComment.parentId,
    likesCount: updatedComment.likesCount,
    repliesCount: updatedComment._count.replies,
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

  const subtreeCount = await countCommentSubtree(commentId);

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
          decrement: subtreeCount,
        },
      },
    });
  });

  return {
    message: "Comment deleted successfully",
    deletedCount: subtreeCount,
  };
};

export const likeComment = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = commentLikeParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { postId, commentId } = paramValidation.data.params;
  const likerId = ensureString(userId);

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
  });

  if (!comment) {
    throw { status: 404, error: "Comment not found" };
  }

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: likerId,
        commentId,
      },
    },
  });

  if (existingLike) {
    throw { status: 400, error: "Comment already liked" };
  }

  const result = await prisma.$transaction(async (tx) => {
    const like = await tx.commentLike.create({
      data: {
        userId: likerId,
        commentId,
      },
    });

    await tx.comment.update({
      where: { id: commentId },
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
    commentId: result.commentId,
    createdAt: result.createdAt,
    message: "Comment liked successfully",
  };
};

export const unlikeComment = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = commentLikeParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { postId, commentId } = paramValidation.data.params;
  const likerId = ensureString(userId);

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
  });

  if (!comment) {
    throw { status: 404, error: "Comment not found" };
  }

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      userId_commentId: {
        userId: likerId,
        commentId,
      },
    },
  });

  if (!existingLike) {
    throw { status: 404, error: "Like not found" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.commentLike.delete({
      where: {
        userId_commentId: {
          userId: likerId,
          commentId,
        },
      },
    });

    await tx.comment.update({
      where: { id: commentId },
      data: {
        likesCount: {
          decrement: 1,
        },
      },
    });
  });

  return { message: "Comment unliked successfully" };
};

export const getCommentLikes = async (
  params: Record<string, unknown>,
  query: Record<string, unknown>,
) => {
  const paramValidation = commentLikeParamsSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const queryValidation = getCommentLikesQuerySchema.safeParse({ query });
  if (!queryValidation.success) {
    throw { status: 400, error: queryValidation.error.flatten() };
  }

  const { postId, commentId } = paramValidation.data.params;
  const { limit, offset } = queryValidation.data.query;

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId },
  });

  if (!comment) {
    throw { status: 404, error: "Comment not found" };
  }

  const likes = await prisma.commentLike.findMany({
    where: { commentId },
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

  const total = await prisma.commentLike.count({ where: { commentId } });

  return {
    likes: likes.map((like) => ({
      id: like.id,
      userId: like.userId,
      commentId: like.commentId,
      user: like.user,
      createdAt: like.createdAt,
    })),
    total,
    limit,
    offset,
  };
};
