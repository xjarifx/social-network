import { PrismaClient } from "../../generated/prisma/index.js";

const prisma = new PrismaClient();

export const followUser = async (followerId: string, followingId: string) => {
  if (!followingId) {
    throw new Error("INVALID_INPUT");
  }
  if (followerId === followingId) {
    throw new Error("SELF_FOLLOW");
  }

  const user = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const existing = await prisma.follower.findFirst({
    where: {
      followerId,
      followingId,
    },
  });

  if (existing) {
    throw new Error("ALREADY_FOLLOWING");
  }

  return await prisma.follower.create({
    data: {
      followerId,
      followingId,
    },
  });
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
  followingId: string,
) => {
  const follow = await prisma.follower.findFirst({
    where: {
      followerId,
      followingId,
    },
  });

  if (!follow) {
    throw new Error("NOT_FOUND");
  }

  if (follow.followerId !== followerId) {
    throw new Error("FORBIDDEN");
  }

  await prisma.follower.delete({ where: { id: follow.id } });
  return { deleted: true };
};
