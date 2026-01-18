import { PrismaClient } from "../../generated/prisma/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import type { RegisterInput, PublicUser } from "./auth.types.js";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

export const registerUser = async (
  input: RegisterInput,
): Promise<PublicUser> => {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existingEmail) {
    throw new Error("EMAIL_TAKEN");
  }

  const existingUsername = await prisma.user.findUnique({
    where: { username: input.username },
    select: { id: true },
  });

  if (existingUsername) {
    throw new Error("USERNAME_TAKEN");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      showBirthYear: input.showBirthYear,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpiresAt,
      preferences: {
        create: {},
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    dateOfBirth: user.dateOfBirth,
    showBirthYear: user.showBirthYear,
    status: user.status,
    privacySetting: user.privacySetting,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
