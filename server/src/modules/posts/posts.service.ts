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

export const createComment = async (
  userId: string,
  postId: string,
  input: any,
) => {
  // Validate input
  const { createCommentSchema } = await import("./posts.validation.js");
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
  const { updateCommentSchema } = await import("./posts.validation.js");
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
