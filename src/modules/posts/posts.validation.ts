import z from "zod";

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
