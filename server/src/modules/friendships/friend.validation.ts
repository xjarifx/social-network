import z from "zod";

export const sendRequestSchema = z.object({
  body: z
    .object({
      recipientId: z
        .string()
        .uuid({ message: "recipientId must be a valid UUID" }),
    })
    .strict(),
});
