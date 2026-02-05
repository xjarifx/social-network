import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/index';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from './auth.validation';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const JWT_SECRET: string = process.env.JWT_SECRET || "";
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "";
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET || "";
const REFRESH_TOKEN_EXPIRES_IN: string =
  process.env.REFRESH_TOKEN_EXPIRES_IN || "";

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const registerUser = async (input: any) => {
  // Validate input
  const validationResult = registerSchema.safeParse({ body: input });

  if (!validationResult.success) {
    const errors = validationResult.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`VALIDATION_ERROR: ${errors}`);
  }

  const { email, username, password, firstName, lastName } = input;

  // Check if email already exists
  let existingEmail;
  try {
    existingEmail = await prisma.user.findUnique({
      where: { email },
    });
  } catch (dbError) {
    console.error("Database error checking email:", dbError);
    throw dbError;
  }

  if (existingEmail) {
    throw new Error("EMAIL_TAKEN");
  }

  // Check if username already exists
  let existingUsername;
  try {
    existingUsername = await prisma.user.findUnique({
      where: { username },
    });
  } catch (dbError) {
    console.error("Database error checking username:", dbError);
    throw dbError;
  }

  if (existingUsername) {
    throw new Error("USERNAME_TAKEN");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });
  } catch (dbError) {
    console.error("Database error creating user:", dbError);
    throw dbError;
  }

  // Generate JWT token
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    token,
    refreshToken,
  };
};

export const loginUser = async (input: any) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  // Generate JWT token
  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    createdAt: user.createdAt,
    token,
    refreshToken,
  };
};

export const logoutUser = async (refreshToken: string) => {
  // Find the refresh token in the database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!tokenRecord) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // Check if already revoked
  if (tokenRecord.revokedAt) {
    throw new Error("TOKEN_ALREADY_REVOKED");
  }

  // Revoke the refresh token
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });

  return { message: "Logged out successfully" };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // Find the refresh token in the database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // Check if token is revoked
  if (tokenRecord.revokedAt) {
    throw new Error("TOKEN_REVOKED");
  }

  // Check if token is expired
  if (new Date() > tokenRecord.expiresAt) {
    throw new Error("TOKEN_EXPIRED");
  }

  // Verify the refresh token JWT signature
  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  // Generate new access token
  const newAccessToken = generateToken(tokenRecord.userId);

  // Generate new refresh token and revoke old one
  const newRefreshToken = generateRefreshToken(tokenRecord.userId);

  // Revoke old refresh token
  await prisma.refreshToken.update({
    where: { token: refreshToken },
    data: { revokedAt: new Date() },
  });

  // Store new refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

  await prisma.refreshToken.create({
    data: {
      userId: tokenRecord.userId,
      token: newRefreshToken,
      expiresAt,
    },
  });

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
  };
};
