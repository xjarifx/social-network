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
        .max(100, { message: "Post content must be at most 100 characters" })
        .optional(),
      visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    })
    .strict(),
});

export const updatePostSchema = z.object({
  body: z
    .object({
      content: z
        .string()
        .min(1, { message: "Post content is required" })
        .max(100, { message: "Post content must be at most 100 characters" }),
      visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
    })
    .strict(),
});
