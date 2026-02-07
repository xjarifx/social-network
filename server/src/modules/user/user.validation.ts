import z from "zod";

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .min(1, { message: "First name is required" })
        .max(50, { message: "First name must be at most 50 characters long" })
        .optional(),
      lastName: z
        .string()
        .min(1, { message: "Last name is required" })
        .max(50, { message: "Last name must be at most 50 characters long" })
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, { message: "Search query is required" })
      .max(100, {
        message: "Search query must be at most 100 characters long",
      }),
    limit: z.string().optional().default("10"),
    offset: z.string().optional().default("0"),
  }),
});
