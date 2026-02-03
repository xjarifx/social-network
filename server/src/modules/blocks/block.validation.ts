import z from "zod";

export const blockUserSchema = z.object({
  body: z
    .object({
      blockedId: z.string().uuid({ message: "blockedId must be a valid UUID" }),
    })
    .strict(),
});

export const getBlockedQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).default(10),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});

export const unblockParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid({ message: "userId must be a valid UUID" }),
  }),
});
