import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const getNotifications = async (
  userId: string,
  limit: number = 10,
  offset: number = 0,
) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      relatedUser: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      relatedPost: {
        select: {
          id: true,
          content: true,
        },
      },
    },
  });

  const total = await prisma.notification.count({ where: { userId } });

  return {
    notifications: notifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      message: notification.message,
      read: notification.read,
      createdAt: notification.createdAt,
      relatedUser: notification.relatedUser,
      relatedPost: notification.relatedPost,
    })),
    total,
    limit,
    offset,
  };
};
