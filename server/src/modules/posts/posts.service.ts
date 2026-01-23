import { PrismaClient } from "../../generated/prisma/index.js";
import { createPostSchema, updatePostSchema } from "./posts.validation.js";

const prisma = new PrismaClient();

export const createPost = async (userId: string, input: any) => {
  // Validate input
  const validationResult = createPostSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  const { content } = input;

  // Create post
  const post = await prisma.post.create({
    data: {
      content,
      authorId: userId,
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

export const getPostById = async (postId: string) => {
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
    throw new Error("POST_NOT_FOUND");
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
  postId: string,
  userId: string,
  input: any,
) => {
  // Validate input
  const validationResult = updatePostSchema.safeParse({ body: input });

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

  // Check if user is the post author
  if (post.authorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  const { content } = input;

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

export const deletePost = async (postId: string, userId: string) => {
  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }

  // Check if user is the post author
  if (post.authorId !== userId) {
    throw new Error("UNAUTHORIZED");
  }

  // Delete post (cascade delete will handle comments and likes)
  await prisma.post.delete({
    where: { id: postId },
  });

  return { message: "Post deleted successfully" };
};
