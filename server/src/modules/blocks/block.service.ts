import { PrismaClient } from "../../generated/prisma/index.js";
import { blockUserSchema, unblockParamSchema } from "./block.validation.js";

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const blockUser = async (
  blockerId: unknown,
  body: Record<string, unknown>,
) => {
  const validation = blockUserSchema.safeParse({ body });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { blockedId } = validation.data.body;
  const blockerUserId = ensureString(blockerId);

  if (!blockerUserId) {
    throw { status: 401, error: "Unauthorized" };
  }

  if (blockerUserId === blockedId) {
    throw { status: 400, error: "Cannot block yourself" };
  }

  const user = await prisma.user.findUnique({
    where: { id: blockedId },
  });
  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  const existing = await prisma.block.findFirst({
    where: {
      blockerId: blockerUserId,
      blockedId,
    },
  });

  if (existing) {
    throw { status: 409, error: "User already blocked" };
  }

  return await prisma.block.create({
    data: {
      blockerId: blockerUserId,
      blockedId,
    },
  });
};

export const getBlockedUsers = async (userId: unknown) => {
  const blockerUserId = ensureString(userId);

  if (!blockerUserId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const blocks = await prisma.block.findMany({
    where: {
      blockerId: blockerUserId,
    },
    include: {
      blocked: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return blocks.map((b) => ({
    id: b.id,
    blockedAt: b.createdAt,
    user: b.blocked,
  }));
};

export const unblockUser = async (
  blockerId: unknown,
  params: Record<string, unknown>,
) => {
  const validation = unblockParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { blockedId } = validation.data.params;
  const blockerUserId = ensureString(blockerId);

  if (!blockerUserId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const block = await prisma.block.findFirst({
    where: {
      blockerId: blockerUserId,
      blockedId,
    },
  });

  if (!block) {
    throw { status: 404, error: "Block not found" };
  }

  await prisma.block.delete({ where: { id: block.id } });
  return { deleted: true };
};
