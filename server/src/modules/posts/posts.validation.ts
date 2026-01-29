import z from "zod";

export const postIdParamSchema = z.object({
  params: z.object({
    postId: z.string().uuid({ message: "Invalid post ID format" }),
  }),
});

export const createPostSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .min(1, { message: "Post content is required" })
        .max(5000, { message: "Post content must be at most 5000 characters" }),
    })
    .strict(),
});

export const updatePostSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .min(1, { message: "Post content is required" })
        .max(5000, { message: "Post content must be at most 5000 characters" }),
    })
    .strict(),
});
