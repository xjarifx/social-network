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

export const unblockUser = async (blockerId: unknown, username: string) => {
  const blockerUserId = ensureString(blockerId);

  if (!blockerUserId) {
    throw { status: 401, error: "Unauthorized" };
  }

  if (!username || typeof username !== "string") {
    throw { status: 400, error: "Username is required" };
  }

  // Find the user to unblock by username
  const userToUnblock = await prisma.user.findUnique({
    where: { username },
  });

  if (!userToUnblock) {
    throw { status: 404, error: "User not found" };
  }

  const block = await prisma.block.findFirst({
    where: {
      blockerId: blockerUserId,
      blockedId: userToUnblock.id,
    },
  });

  if (!block) {
    throw { status: 404, error: "Block not found" };
  }

  await prisma.block.delete({ where: { id: block.id } });
  return { deleted: true };
};
