import z from "zod";

export const blockUserSchema = z.object({
  body: z
    .object({
      blockedId: z.string().uuid({ message: "blockedId must be a valid UUID" }),
    })
    .strict(),
});

export const unblockParamSchema = z.object({
  params: z.object({
    blockedId: z.string().uuid({ message: "blockedId must be a valid UUID" }),
  }),
});
