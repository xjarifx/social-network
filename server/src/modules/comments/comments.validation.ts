import z from "zod";

export const postIdParamSchema = z.object({
  params: z.object({
    postId: z.string().uuid({ message: "Invalid post ID format" }),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    commentId: z.string().uuid({ message: "Invalid comment ID format" }),
  }),
});

export const createCommentSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .min(1, { message: "Comment content is required" })
        .max(2000, {
          message: "Comment content must be at most 2000 characters",
        }),
      parentId: z
        .string()
        .uuid({ message: "Invalid parent ID format" })
        .optional(),
    })
    .strict(),
});

export const updateCommentSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .min(1, { message: "Comment content is required" })
        .max(2000, {
          message: "Comment content must be at most 2000 characters",
        }),
    })
    .strict(),
});

export const getCommentsQuerySchema = z.object({
  query: z.object({
    limit: z.string().default("10").transform(Number),
    offset: z.string().default("0").transform(Number),
    parentId: z
      .string()
      .uuid({ message: "Invalid parent ID format" })
      .optional(),
  }),
});

export const commentLikeParamsSchema = z.object({
  params: z.object({
    postId: z.string().uuid({ message: "Invalid post ID format" }),
    commentId: z.string().uuid({ message: "Invalid comment ID format" }),
  }),
});

export const getCommentLikesQuerySchema = z.object({
  query: z.object({
    limit: z.string().default("20").transform(Number),
    offset: z.string().default("0").transform(Number),
  }),
});
