import z from "zod";

export const followUserSchema = z.object({
  params: z.object({
    userId: z
      .string()
      .uuid({ message: "userId must be a valid UUID" }),
  }),
});

export const unfollowParamSchema = z.object({
  params: z.object({
    followingId: z
      .string()
      .uuid({ message: "followingId must be a valid UUID" }),
  }),
});
