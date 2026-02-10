import { prisma } from "../../lib/prisma";
import {
  buildCacheKey,
  cacheGet,
  cacheSet,
  invalidateTags,
} from "../../lib/cache";
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
  updateNotificationBodySchema,
} from "./notification.validation";

const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

const NOTIFICATIONS_TTL_SECONDS = 20;

export const getNotifications = async (
  userId: unknown,
  query: Record<string, unknown>,
) => {
  const ownerId = ensureString(userId);
  if (!ownerId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const validation = getNotificationsQuerySchema.safeParse({ query });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { limit, offset, read } = validation.data.query;
  const cacheKey = buildCacheKey(
    "notifications",
    ownerId,
    read === undefined ? "all" : read,
    limit,
    offset,
  );
  const cached = await cacheGet<{
    notifications: Array<{
      id: string;
      type: string;
      message: string;
      read: boolean;
      createdAt: Date;
      relatedUser: {
        id: string;
        username: string;
        firstName: string | null;
        lastName: string | null;
      } | null;
      relatedPost: {
        id: string;
        content: string | null;
      } | null;
    }>;
    total: number;
    limit: number;
    offset: number;
  }>(cacheKey);
  if (cached) {
    return cached;
  }
  const where = {
    userId: ownerId,
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

  const response = {
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

  await cacheSet(cacheKey, response, {
    ttlSeconds: NOTIFICATIONS_TTL_SECONDS,
    tags: [`notifications:user:${ownerId}`],
  });

  return response;
};

export const getNotificationById = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const ownerId = ensureString(userId);
  if (!ownerId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const validation = notificationIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { notificationId } = validation.data.params;
  const cacheKey = buildCacheKey(
    "notification",
    notificationId,
    "user",
    ownerId,
  );
  const cached = await cacheGet<{
    id: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date;
    relatedUser: {
      id: string;
      username: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    relatedPost: {
      id: string;
      content: string | null;
    } | null;
  }>(cacheKey);
  if (cached) {
    return cached;
  }
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, userId: ownerId },
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

  const response = {
    id: notification.id,
    type: notification.type,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
    relatedUser: notification.relatedUser,
    relatedPost: notification.relatedPost,
  };

  await cacheSet(cacheKey, response, {
    ttlSeconds: NOTIFICATIONS_TTL_SECONDS,
    tags: [`notification:${notificationId}`, `notifications:user:${ownerId}`],
  });

  return response;
};

export const updateNotificationRead = async (
  userId: unknown,
  params: Record<string, unknown>,
  body: Record<string, unknown>,
) => {
  const ownerId = ensureString(userId);
  if (!ownerId) {
    throw { status: 401, error: "Unauthorized" };
  }

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
    where: { id: notificationId, userId: ownerId },
    data: { read },
  });

  if (count === 0) {
    throw { status: 404, error: "Notification not found" };
  }

  await invalidateTags([
    `notification:${notificationId}`,
    `notifications:user:${ownerId}`,
  ]);

  return getNotificationById(ownerId, params);
};

export const deleteNotification = async (
  userId: unknown,
  params: Record<string, unknown>,
) => {
  const ownerId = ensureString(userId);
  if (!ownerId) {
    throw { status: 401, error: "Unauthorized" };
  }

  const validation = notificationIdParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { notificationId } = validation.data.params;
  const { count } = await prisma.notification.deleteMany({
    where: { id: notificationId, userId: ownerId },
  });

  if (count === 0) {
    throw { status: 404, error: "Notification not found" };
  }

  await invalidateTags([
    `notification:${notificationId}`,
    `notifications:user:${ownerId}`,
  ]);

  return true;
};
