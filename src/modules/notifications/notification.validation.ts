import z from "zod";

export const getNotificationsQuerySchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).default(10),
    offset: z.coerce.number().int().min(0).default(0),
    read: z.coerce.boolean().optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string().uuid(),
  }),
});

export const updateNotificationBodySchema = z.object({
  body: z.object({
    read: z.coerce.boolean().optional(),
  }),
});
