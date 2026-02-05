import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  NotificationType,
  Plan,
  PrismaClient,
} from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.block.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const usersData = [
    {
      username: "alice",
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Nguyen",
      plan: Plan.PRO,
      planStatus: "active",
      planStartedAt: new Date(),
    },
    {
      username: "bob",
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Hernandez",
    },
    {
      username: "carol",
      email: "carol@example.com",
      firstName: "Carol",
      lastName: "Singh",
    },
    {
      username: "dave",
      email: "dave@example.com",
      firstName: "Dave",
      lastName: "Okafor",
    },
    {
      username: "erin",
      email: "erin@example.com",
      firstName: "Erin",
      lastName: "Patel",
    },
    {
      username: "frank",
      email: "frank@example.com",
      firstName: "Frank",
      lastName: "Wong",
    },
    {
      username: "grace",
      email: "grace@example.com",
      firstName: "Grace",
      lastName: "Kim",
    },
    {
      username: "hugo",
      email: "hugo@example.com",
      firstName: "Hugo",
      lastName: "Silva",
    },
    {
      username: "ivy",
      email: "ivy@example.com",
      firstName: "Ivy",
      lastName: "Zhang",
    },
    {
      username: "james",
      email: "james@example.com",
      firstName: "James",
      lastName: "Baker",
    },
    {
      username: "kira",
      email: "kira@example.com",
      firstName: "Kira",
      lastName: "Ivanova",
    },
    {
      username: "liam",
      email: "liam@example.com",
      firstName: "Liam",
      lastName: "Olsen",
    },
    {
      username: "maya",
      email: "maya@example.com",
      firstName: "Maya",
      lastName: "Rahman",
    },
    {
      username: "noah",
      email: "noah@example.com",
      firstName: "Noah",
      lastName: "Adams",
    },
    {
      username: "olivia",
      email: "olivia@example.com",
      firstName: "Olivia",
      lastName: "Garcia",
    },
    {
      username: "pete",
      email: "pete@example.com",
      firstName: "Pete",
      lastName: "Johnson",
    },
    {
      username: "quinn",
      email: "quinn@example.com",
      firstName: "Quinn",
      lastName: "Lewis",
    },
    {
      username: "rhea",
      email: "rhea@example.com",
      firstName: "Rhea",
      lastName: "Chung",
    },
    {
      username: "sara",
      email: "sara@example.com",
      firstName: "Sara",
      lastName: "Lopez",
    },
    {
      username: "tariq",
      email: "tariq@example.com",
      firstName: "Tariq",
      lastName: "Hassan",
    },
  ].map((user) => ({
    ...user,
    password: passwordHash,
  }));

  await prisma.user.createMany({ data: usersData });

  const users = await prisma.user.findMany({
    where: { username: { in: usersData.map((user) => user.username) } },
  });

  const userByUsername = new Map(users.map((user) => [user.username, user]));

  const postInputs = [
    {
      author: "alice",
      content: "Just shipped the first version of our social feed! 🚀",
    },
    { author: "bob", content: "Anyone up for a weekend hackathon?" },
    {
      author: "carol",
      content: "Today I learned about Prisma transactions. Game changer.",
    },
    { author: "dave", content: "Coffee + focus mode = shipping mode." },
    {
      author: "erin",
      content: "Building a recommendation engine. Lots of graph theory.",
    },
    { author: "frank", content: "New blog post on scaling Postgres indexes." },
    { author: "grace", content: "Trying out a new design system this week." },
    {
      author: "hugo",
      content: "Does anyone use server actions in production yet?",
    },
    { author: "ivy", content: "Just published a CSS micro-animations guide." },
    { author: "james", content: "Shipping an API gateway this sprint." },
    { author: "kira", content: "Monitoring dashboards are finally green." },
    { author: "liam", content: "Spent the day fixing flaky tests." },
    {
      author: "maya",
      content: "Pairing session notes: we cut latency by 35%.",
    },
    {
      author: "noah",
      content: "Refactoring the auth flow. Cleaner and faster.",
    },
    { author: "olivia", content: "Live-coded a feed ranking prototype." },
    { author: "pete", content: "Thinking about moving to event sourcing." },
    { author: "quinn", content: "Launch checklist done. Fingers crossed." },
    { author: "rhea", content: "Setup a new CI pipeline with parallel jobs." },
    { author: "sara", content: "Mentored two interns today. Proud moment." },
    { author: "tariq", content: "Logging is now 3x cheaper. 🎉" },
  ];

  const posts = [] as { id: string; authorId: string }[];

  for (const postInput of postInputs) {
    const author = userByUsername.get(postInput.author);
    if (!author) continue;
    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        content: postInput.content,
      },
    });
    posts.push({ id: post.id, authorId: post.authorId });
  }

  const commentsData = [
    { author: "bob", postIndex: 0, content: "Congrats! The UI looks slick." },
    { author: "carol", postIndex: 0, content: "Nice work! Excited to try it." },
    { author: "alice", postIndex: 1, content: "Count me in! What stack?" },
    {
      author: "dave",
      postIndex: 2,
      content: "Totally agree. Prisma + TS = 🔥",
    },
    { author: "erin", postIndex: 3, content: "Love the energy on this." },
    { author: "frank", postIndex: 4, content: "Graph theory FTW." },
    { author: "grace", postIndex: 5, content: "Drop the link!" },
    {
      author: "hugo",
      postIndex: 6,
      content: "Can’t wait to see the components.",
    },
    { author: "ivy", postIndex: 7, content: "I’m interested in this too." },
    { author: "james", postIndex: 8, content: "Great write-up." },
    {
      author: "kira",
      postIndex: 9,
      content: "We did something similar last quarter.",
    },
    {
      author: "liam",
      postIndex: 10,
      content: "Congrats on the green dashboards.",
    },
    {
      author: "maya",
      postIndex: 11,
      content: "Flaky tests are brutal. Hang in there.",
    },
    { author: "noah", postIndex: 12, content: "35% is a huge win." },
    {
      author: "olivia",
      postIndex: 13,
      content: "Auth refactors are always worth it.",
    },
    {
      author: "pete",
      postIndex: 14,
      content: "Feed ranking is a fun challenge.",
    },
    {
      author: "quinn",
      postIndex: 15,
      content: "Event sourcing is a rabbit hole.",
    },
    { author: "rhea", postIndex: 16, content: "Rooting for the launch." },
    { author: "sara", postIndex: 17, content: "Parallel jobs are the best." },
    {
      author: "tariq",
      postIndex: 18,
      content: "Congrats to you and the interns.",
    },
    { author: "alice", postIndex: 19, content: "Saving costs feels great." },
  ].filter((comment) => posts[comment.postIndex]);

  await prisma.comment.createMany({
    data: commentsData.map((comment) => ({
      authorId: userByUsername.get(comment.author)?.id ?? "",
      postId: posts[comment.postIndex].id,
      content: comment.content,
    })),
  });

  const likesData = posts.flatMap((post, index) => {
    const likerUsernames = users
      .filter((_, userIndex) => (userIndex + index) % 3 === 0)
      .map((user) => user.id);
    return likerUsernames.map((userId) => ({ userId, postId: post.id }));
  });

  await prisma.like.createMany({ data: likesData });

  const followerPairs = users.flatMap((user, index) => {
    const follows = users
      .filter(
        (_, otherIndex) =>
          otherIndex !== index && (otherIndex + index) % 4 === 1,
      )
      .map((other) => ({ followerId: user.id, followingId: other.id }));
    return follows;
  });

  await prisma.follower.createMany({ data: followerPairs });

  const blockPairs = [
    { blocker: "dave", blocked: "bob" },
    { blocker: "ivy", blocked: "pete" },
    { blocker: "tariq", blocked: "frank" },
  ];

  await prisma.block.createMany({
    data: blockPairs
      .map((pair) => ({
        blockerId: userByUsername.get(pair.blocker)?.id ?? "",
        blockedId: userByUsername.get(pair.blocked)?.id ?? "",
      }))
      .filter((pair) => pair.blockerId && pair.blockedId),
  });

  await prisma.refreshToken.createMany({
    data: users.slice(0, 6).map((user) => ({
      userId: user.id,
      token: crypto.randomBytes(32).toString("hex"),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    })),
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: userByUsername.get("alice")?.id ?? "",
        type: NotificationType.NEW_FOLLOWER,
        relatedUserId: userByUsername.get("bob")?.id ?? "",
        message: "Bob started following you.",
      },
      {
        userId: userByUsername.get("alice")?.id ?? "",
        type: NotificationType.COMMENT,
        relatedUserId: userByUsername.get("carol")?.id ?? "",
        relatedPostId: posts[0]?.id,
        message: "Carol commented on your post.",
      },
      {
        userId: userByUsername.get("bob")?.id ?? "",
        type: NotificationType.LIKE,
        relatedUserId: userByUsername.get("alice")?.id ?? "",
        relatedPostId: posts[1]?.id,
        message: "Alice liked your post.",
      },
    ].filter(
      (notification) => notification.userId && notification.relatedUserId,
    ),
  });

  for (const post of posts) {
    const [likesCount, commentsCount] = await Promise.all([
      prisma.like.count({ where: { postId: post.id } }),
      prisma.comment.count({ where: { postId: post.id } }),
    ]);

    await prisma.post.update({
      where: { id: post.id },
      data: { likesCount, commentsCount },
    });
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
