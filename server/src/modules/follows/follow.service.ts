import { NotificationType } from "../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma";
import { followUserSchema, unfollowParamSchema } from "./follow.validation";

const formatUserLabel = (
  user?: {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null,
): string => {
  if (!user) {
    return "Someone";
  }
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return fullName || user.username || "Someone";
};

export const followUser = async (
  followerId: string,
  params: Record<string, unknown>,
) => {
  const validation = followUserSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.format() };
  }

  const { userId: followingId } = validation.data.params;

  if (followerId === followingId) {
    throw { status: 400, error: "Cannot follow yourself" };
  }

  const user = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!user) {
    throw { status: 404, error: "User not found" };
  }

  // Check if there's a block relationship
  const blockExists = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: followerId, blockedId: followingId }, // I blocked them
        { blockerId: followingId, blockedId: followerId }, // They blocked me
      ],
    },
  });

  if (blockExists) {
    throw { status: 403, error: "Cannot follow this user due to block relationship" };
  }

  const existing = await prisma.follower.findFirst({
    where: {
      followerId,
      followingId,
    },
  });

  if (existing) {
    throw { status: 409, error: "Already following this user" };
  }

  const follow = await prisma.follower.create({
    data: {
      followerId,
      followingId,
    },
  });

  const follower = await prisma.user.findUnique({
    where: { id: followerId },
    select: { username: true, firstName: true, lastName: true },
  });

  await prisma.notification.create({
    data: {
      userId: followingId,
      type: NotificationType.NEW_FOLLOWER,
      relatedUserId: followerId,
      message: `${formatUserLabel(follower)} started following you`,
    },
  });

  return follow;
};

export const getFollowers = async (userId: string) => {
  const followers = await prisma.follower.findMany({
    where: {
      followingId: userId,
    },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return followers.map((f) => ({
    id: f.id,
    followedAt: f.createdAt,
    follower: f.follower,
  }));
};

export const getFollowing = async (userId: string) => {
  const following = await prisma.follower.findMany({
    where: {
      followerId: userId,
    },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return following.map((f) => ({
    id: f.id,
    followedAt: f.createdAt,
    user: f.following,
  }));
};

export const unfollowUser = async (
  followerId: string,
  params: Record<string, unknown>,
) => {
  const validation = unfollowParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.format() };
  }

  const { followingId } = validation.data.params;

  const follow = await prisma.follower.findFirst({
    where: {
      followerId,
      followingId,
    },
  });

  if (!follow) {
    throw { status: 404, error: "Follow relationship not found" };
  }

  if (follow.followerId !== followerId) {
    throw {
      status: 403,
      error: "Not allowed to modify this follow relationship",
    };
  }

  await prisma.follower.delete({ where: { id: follow.id } });
  return { deleted: true };
};
