import z from "zod";

// Email regex pattern for validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password regex: at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#$@!%*?&]{8,}$/;

export const registerSchema = z.object({
  body: z
    .object({
      username: z
        .string()
        .min(2, { message: "Username must be at least 2 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" }),
      email: z
        .string()
        .regex(emailRegex, { message: "Invalid email address format" }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .regex(passwordRegex, {
          message:
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (#@$!%*?&)",
        }),
      firstName: z
        .string()
        .min(1, { message: "First name is required" })
        .max(50, { message: "First name must be at most 50 characters long" }),
      lastName: z
        .string()
        .min(1, { message: "Last name is required" })
        .max(50, { message: "Last name must be at most 50 characters long" }),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .regex(emailRegex, { message: "Invalid email address format" }),
      password: z.string().min(1, { message: "Password is required" }),
    })
    .strict(),
});
