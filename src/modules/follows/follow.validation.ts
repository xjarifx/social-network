import z from "zod";

export const followUserSchema = z.object({
  body: z
    .object({
      followingId: z
        .string()
        .uuid({ message: "followingId must be a valid UUID" }),
    })
    .strict(),
});
