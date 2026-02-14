import { prisma } from "../../lib/prisma";
import { getBlockedQuerySchema } from "./block.validation";

export const blockUser = async (userId: string, username: string) => {
  // USER who will be blocked, find his username
  const userToBlock = await prisma.user.findUnique({
    where: { username },
  });

  if (!userToBlock) {
    throw new Error("User not found");
  }

  if (userId === userToBlock.id) {
    throw new Error("Cannot block yourself");
  }

  // Check if the block already exists
  const isBlockExist = await prisma.block.findFirst({
    where: {
      blockerId: userId,
      blockedId: userToBlock.id,
    },
  });

  if (isBlockExist) {
    throw new Error("User already blocked");
  }

  const applyBlock = await prisma.block.create({
    data: {
      blockerId: userId,
      blockedId: userToBlock.id,
    },
  });

  return applyBlock;
};

export const unblockUser = async (userId: string, username: string) => {
  const userToUnblock = await prisma.user.findUnique({
    where: { username },
  });

  if (!userToUnblock) {
    throw new Error("User not found");
  }

  if (userId === userToUnblock.id) {
    throw new Error("Cannot unblock yourself");
  }

  // Check if the block already exists
  const isBlockExist = await prisma.block.findFirst({
    where: {
      blockerId: userId,
      blockedId: userToUnblock.id,
    },
  });

  if (!isBlockExist) {
    throw new Error("User is not blocked");
  }

  const applyUnblock = await prisma.block.delete({
    where: {
      blockerId_blockedId: {
        blockerId: userId,
        blockedId: userToUnblock.id,
      },
    },
  });

  return applyUnblock;
};

export const getBlockedUsers = async (
  userId: unknown,
  query: Record<string, unknown>,
) => {
  const blockerUserId = ensureString(userId);

  if (!blockerUserId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const queryValidation = getBlockedQuerySchema.safeParse({ query });
  if (!queryValidation.success) {
    throw { status: 400, error: queryValidation.error.flatten() };
  }

  const { limit, offset } = queryValidation.data.query;

  const blocks = await prisma.block.findMany({
    where: {
      blockerId: blockerUserId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    skip: offset,
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

  const total = await prisma.block.count({
    where: {
      blockerId: blockerUserId,
    },
  });

  return {
    blocked: blocks.map((b) => ({
      id: b.id,
      blockedAt: b.createdAt,
      user: b.blocked,
    })),
    total,
    limit,
    offset,
  };
};
