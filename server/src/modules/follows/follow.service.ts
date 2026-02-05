import { PrismaClient } from '../../generated/prisma/index';
import { followUserSchema, unfollowParamSchema } from './follow.validation';

const prisma = new PrismaClient();

export const ensureString = (val: unknown): string =>
  typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";

export const followUser = async (
  followerId: string,
  body: Record<string, unknown>,
) => {
  const validation = followUserSchema.safeParse({ body });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
  }

  const { followingId } = validation.data.body;

  if (followerId === followingId) {
    throw { status: 400, error: "Cannot follow yourself" };
  }

  const user = await prisma.user.findUnique({
    where: { id: followingId },
  });
  if (!user) {
    throw { status: 404, error: "User not found" };
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
  params: Record<string, unknown>,
) => {
  const validation = unfollowParamSchema.safeParse({ params });
  if (!validation.success) {
    throw { status: 400, error: validation.error.flatten() };
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
