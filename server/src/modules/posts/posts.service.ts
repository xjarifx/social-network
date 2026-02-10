import { prisma } from "../../lib/prisma";
import { uploadMedia } from "../../lib/cloudinary";
import {
  createPostSchema,
  postIdParamSchema,
  updatePostSchema,
} from "./posts.validation";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const parseNonNegativeInt = (val: unknown, fallback: number): number => {
  if (typeof val !== "string") {
    return fallback;
  }
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getPlanPostLimit = (plan: string | null | undefined): number =>
  plan === "PRO" ? 100 : 20;

const getValidationErrorMessage = (error: {
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}): string => {
  if (error.fieldErrors) {
    const firstField = Object.entries(error.fieldErrors)[0];
    if (firstField && Array.isArray(firstField[1]) && firstField[1][0]) {
      return firstField[1][0];
    }
  }
  if (
    error.formErrors &&
    Array.isArray(error.formErrors) &&
    error.formErrors[0]
  ) {
    return error.formErrors[0];
  }
  return "Validation failed";
};

export const getFeed = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const limit = parseNonNegativeInt(query.limit, 20);
  const offset = parseNonNegativeInt(query.offset, 0);

  // Get posts from users that the current user follows, excluding their own posts
  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        not: userId,
      },
      visibility: "PUBLIC",
      author: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
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

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likes: post.likes.map((like) => like.userId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));
};

export const getForYouFeed = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const limit = parseNonNegativeInt(query.limit, 20);
  const offset = parseNonNegativeInt(query.offset, 0);

  const directFollowing = await prisma.follower.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  if (directFollowing.length === 0) {
    return [];
  }

  const directFollowingIds = directFollowing.map(
    (follow) => follow.followingId,
  );
  const directFollowingSet = new Set(directFollowingIds);

  const secondDegree = await prisma.follower.findMany({
    where: {
      followerId: {
        in: directFollowingIds,
      },
    },
    select: { followingId: true },
  });

  const secondDegreeIds = Array.from(
    new Set(secondDegree.map((follow) => follow.followingId)),
  ).filter((id) => id !== userId && !directFollowingSet.has(id));

  if (secondDegreeIds.length === 0) {
    return [];
  }

  const posts = await prisma.post.findMany({
    where: {
      authorId: {
        in: secondDegreeIds,
      },
      visibility: "PUBLIC",
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

  return posts.map((post) => ({
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likes: post.likes.map((like) => like.userId),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));
};

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
  file?: Express.Multer.File,
) => {
  // Validate input
  const validationResult = createPostSchema.safeParse({ body });

  if (!validationResult.success) {
    throw {
      status: 400,
      error: getValidationErrorMessage(validationResult.error.flatten()),
    };
  }

  const { content, visibility } = validationResult.data.body;
  const authorId = ensureString(userId);
  const normalizedContent = (content ?? "").trim();

  if (!normalizedContent && !file) {
    throw {
      status: 400,
      error: "Post must include text or an image",
    };
  }

  if (normalizedContent) {
    await enforcePostLimitForUser(authorId, normalizedContent);
  }

  let imageUrl: string | null = null;
  if (file) {
    try {
      const uploadResult = await uploadMedia(file);
      imageUrl = uploadResult.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw { status: 500, error: "Unable to upload media" };
    }
  }

  // Create post
  const post = await prisma.post.create({
    data: {
      content: normalizedContent,
      authorId,
      imageUrl,
      ...(visibility && { visibility }),
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
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
};

export const getPostById = async (
  params: Record<string, unknown>,
  userId?: unknown,
) => {
  const paramValidation = postIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw {
      status: 400,
      error: getValidationErrorMessage(paramValidation.error.flatten()),
    };
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
          parentId: true,
          likesCount: true,
          _count: {
            select: {
              replies: true,
            },
          },
          createdAt: true,
        },
        where: {
          parentId: null,
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

  if (post.visibility === "PRIVATE") {
    const requesterId = ensureString(userId);
    if (!requesterId || requesterId !== post.authorId) {
      throw { status: 403, error: "Post is private" };
    }
  }

  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    visibility: post.visibility,
    author: post.author,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    likes: post.likes.map((like) => like.userId),
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      postId: post.id,
      parentId: comment.parentId,
      likesCount: comment.likesCount,
      repliesCount: comment._count.replies,
      createdAt: comment.createdAt,
    })),
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
    throw {
      status: 400,
      error: getValidationErrorMessage(paramValidation.error.flatten()),
    };
  }

  const validationResult = updatePostSchema.safeParse({ body });
  if (!validationResult.success) {
    throw {
      status: 400,
      error: getValidationErrorMessage(validationResult.error.flatten()),
    };
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

  const { content, visibility } = validationResult.data.body;

  await enforcePostLimitForUser(authorId, content);

  // Update post
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      content,
      ...(visibility && { visibility }),
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
    imageUrl: updatedPost.imageUrl,
    visibility: updatedPost.visibility,
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
    throw {
      status: 400,
      error: getValidationErrorMessage(paramValidation.error.flatten()),
    };
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
