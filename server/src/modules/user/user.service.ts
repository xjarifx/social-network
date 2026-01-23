import { PrismaClient } from "../../generated/prisma/index.js";
import { updateProfileSchema } from "./user.validation.js";

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string) => {
  // Fetch user by ID
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return user;
};

export const updateUserProfile = async (userId: string, input: any) => {
  // Validate input
  const validationResult = updateProfileSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const { firstName, lastName } = input;

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
    },
  });

  return updatedUser;
};
