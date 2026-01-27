import { PrismaClient } from "../../generated/prisma/index.js";
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  updateNotificationBodySchema,
} from "./notification.validation.js";

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const getNotifications = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const validation = getNotificationsQuerySchema.safeParse({ query });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { limit, offset, read } = validation.data.query;
  const where = {
    userId,
    ...(read !== undefined ? { read } : {}),
  } as const;

  const notifications = await prisma.notification.findMany({
    where,
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

  const total = await prisma.notification.count({ where });

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

export const getNotificationById = async (
  userId: string,
  params: Record<string, unknown>,
) => {
  const validation = notificationIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { notificationId } = validation.data.params;
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
    include: {
      relatedUser: {
        select: { id: true, username: true, firstName: true, lastName: true },
      },
      relatedPost: {
        select: { id: true, content: true },
      },
    },
  });

  if (!notification) {
    throw { status: 404, error: "Notification not found" };
  }

  return {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
    relatedUser: notification.relatedUser,
    relatedPost: notification.relatedPost,
  };
};

export const updateNotificationRead = async (
  userId: string,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const paramValidation = notificationIdParamSchema.safeParse({ params });
  if (!paramValidation.success) {
    throw { status: 400, error: paramValidation.error.flatten() };
  }

  const bodyValidation = updateNotificationBodySchema.safeParse({ body });
  if (!bodyValidation.success) {
    throw { status: 400, error: bodyValidation.error.flatten() };
  }

  const { notificationId } = paramValidation.data.params;
  const read = bodyValidation.data.body.read ?? true; // default: mark as read

  const { count } = await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read },
  });

  if (count === 0) {
    throw { status: 404, error: "Notification not found" };
  }

  return getNotificationById(userId, params);
};

export const deleteNotification = async (
  userId: string,
  params: Record<string, unknown>,
) => {
  const validation = notificationIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { notificationId } = validation.data.params;
  const { count } = await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });

  if (count === 0) {
    throw { status: 404, error: "Notification not found" };
  }

  return true;
};
