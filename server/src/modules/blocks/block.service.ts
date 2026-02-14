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

export const getBlockedUsers = async (userId: string, query: object) => {
  const { limit: number, offset: number } = getBlockedQuerySchema.parse({
    query,
  });
};
