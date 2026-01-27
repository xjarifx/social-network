import z from "zod";

export const createCommentSchema = z.object({
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
  }),
});
