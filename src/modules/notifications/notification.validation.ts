import z from "zod";

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).default(10),
    offset: z.coerce.number().int().min(0).default(0),
  }),
});
