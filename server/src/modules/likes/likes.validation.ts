import z from "zod";

export const likePostParamsSchema = z.object({
  params: z.object({
    postId: z.string().uuid({ message: "Invalid post ID format" }),
  }),
});
