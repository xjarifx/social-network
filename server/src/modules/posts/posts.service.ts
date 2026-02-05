import { PrismaClient } from "../../generated/prisma/index.js";
import {
  createPostSchema,
  postIdParamSchema,
  updatePostSchema,
} from "./posts.validation.js";

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const getPlanPostLimit = (plan: string | null | undefined): number =>
  plan === "PRO" ? 100 : 20;

const enforcePostLimitForUser = async (authorId: string, content: string) => {
  const user = await prisma.user.findUnique({
    where: { id: authorId },
    select: { plan: true },
  });

  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  const limit = getPlanPostLimit(user.plan);
  if (content.length > limit) {
    const planName = user.plan === "PRO" ? "Pro" : "Free";
    throw {
      status: 400,
      error: `Post content exceeds ${planName} plan limit of ${limit} characters`,
    };
  }
};

export const createPost = async (
  userId: unknown,
  body: Record<string, unknown>,
) => {
  // Validate input
  const validationResult = createPostSchema.safeParse({ body });

  if (!validationResult.success) {
    throw { status: 400, error: validationResult.error.flatten() };
  }

  const { content } = validationResult.data.body;
  const authorId = ensureString(userId);

  await enforcePostLimitForUser(authorId, content);

  // Create post
  const post = await prisma.post.create({
    data: {
      content,
      authorId,
    },
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
    },
  });

  return {
    id: post.id,
    content: post.content,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export const getPostById = async (params: Record<string, unknown>) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const { postId } = paramValidation.data.params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
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
      comments: {
        select: {
          id: true,
          content: true,
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      likes: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!post) {
    throw { status: 404, error: "Post not found" };
  }

  return {
    id: post.id,
    content: post.content,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likes: post.likes.map((like) => like.userId),
    comments: post.comments,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export const updatePost = async (
  userId: unknown,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const validationResult = updatePostSchema.safeParse({ body });

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

  // Check if user is the post author
  if (post.authorId !== authorId) {
    throw { status: 403, error: "Cannot update other user's post" };
  }

  const { content } = validationResult.data.body;

  await enforcePostLimitForUser(authorId, content);

  // Update post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      content,
    },
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
    },
  });

  return {
    id: updatedPost.id,
    content: updatedPost.content,
    author: updatedPost.author,
    likesCount: updatedPost.likesCount,
    commentsCount: updatedPost.commentsCount,
    createdAt: updatedPost.createdAt,
    updatedAt: updatedPost.updatedAt,
  };
};

export const deletePost = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
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

  // Check if user is the post author
  if (post.authorId !== authorId) {
    throw { status: 403, error: "Cannot delete other user's post" };
  }

  // Delete post (cascade delete will handle comments and likes)
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Post deleted successfully" };
};
