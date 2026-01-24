import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const sendFriendRequest = async (
  senderId: string,
  recipientId: string,
) => {
  if (!recipientId) {
    throw new Error("INVALID_INPUT");
  }
  if (senderId === recipientId) {
    throw new Error("SELF_REQUEST");
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
  });
  if (!recipient) {
    throw new Error("USER_NOT_FOUND");
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new Error("ALREADY_FRIENDS");
    }
    throw new Error("REQUEST_EXISTS");
  }

  return await prisma.friendship.create({
    data: {
      senderId,
      recipientId,
      status: "PENDING",
    },
  });
};

export const getFriends = async (userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { recipientId: userId }],
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      recipient: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return friendships.map((f) => {
    const friend = f.sender.id === userId ? f.recipient : f.sender;
    return {
      id: f.id,
      since: f.createdAt,
      friend,
    };
  });
};

export const acceptFriendRequest = async (
  friendshipId: string,
  userId: string,
) => {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
  if (!friendship) {
    throw new Error("NOT_FOUND");
  }
  if (friendship.status !== "PENDING") {
    throw new Error("INVALID_STATE");
  }
  if (friendship.recipientId !== userId) {
    throw new Error("FORBIDDEN");
  }

  return await prisma.friendship.update({
    where: { id: friendshipId },
    data: { status: "ACCEPTED" },
  });
};

export const rejectFriendRequest = async (
  friendshipId: string,
  userId: string,
) => {
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });
  if (!friendship) {
    throw new Error("NOT_FOUND");
  }

  if (friendship.status === "PENDING") {
    if (friendship.recipientId !== userId) {
      throw new Error("FORBIDDEN");
    }
    await prisma.friendship.delete({ where: { id: friendshipId } });
    return { deleted: true };
  }

  // Unfriend: allow either participant to remove the friendship
  if (friendship.status === "ACCEPTED") {
    if (friendship.senderId !== userId && friendship.recipientId !== userId) {
      throw new Error("FORBIDDEN");
    }
    await prisma.friendship.delete({ where: { id: friendshipId } });
    return { deleted: true };
  }

  throw new Error("INVALID_STATE");
};
