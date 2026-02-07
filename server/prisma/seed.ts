import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import {
  NotificationType,
  Plan,
  PrismaClient,
} from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

const firstNames = [
  "Alice",
  "Bob",
  "Carol",
  "Dave",
  "Erin",
  "Frank",
  "Grace",
  "Hugo",
  "Ivy",
  "James",
  "Kira",
  "Liam",
  "Maya",
  "Noah",
  "Olivia",
  "Pete",
  "Quinn",
  "Rhea",
  "Sara",
  "Tariq",
  "Uma",
  "Victor",
  "Wendy",
  "Xavier",
  "Yara",
  "Zane",
  "Aiden",
  "Bella",
  "Caleb",
  "Diana",
  "Ethan",
  "Fiona",
  "Gabriel",
  "Hannah",
  "Isaac",
  "Julia",
  "Kevin",
  "Luna",
  "Mason",
  "Nina",
  "Oscar",
  "Penny",
  "Ray",
  "Sophie",
  "Tyler",
  "Ursula",
  "Vincent",
  "Willow",
  "Xander",
  "Yasmin",
  "Zara",
  "Adam",
  "Brooke",
  "Chris",
  "Daphne",
  "Eli",
  "Freya",
  "Gavin",
  "Holly",
  "Ian",
  "Jade",
  "Kyle",
  "Lily",
  "Max",
  "Nora",
  "Owen",
  "Piper",
  "Quinn",
  "Ruby",
  "Sam",
  "Tara",
  "Umar",
  "Vera",
  "Wade",
  "Xena",
  "Yuki",
  "Zoe",
  "Alex",
  "Blake",
  "Casey",
  "Drew",
  "Emery",
  "Finn",
  "Grey",
  "Harper",
  "Jordan",
  "Kai",
  "Logan",
  "Morgan",
  "Nico",
  "Parker",
  "Reese",
  "Sage",
  "Taylor",
  "Val",
  "Winter",
  "River",
];

const lastNames = [
  "Nguyen",
  "Hernandez",
  "Singh",
  "Okafor",
  "Patel",
  "Wong",
  "Kim",
  "Silva",
  "Zhang",
  "Baker",
  "Ivanova",
  "Olsen",
  "Rahman",
  "Adams",
  "Garcia",
  "Johnson",
  "Lewis",
  "Chung",
  "Lopez",
  "Hassan",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Walker",
  "Hall",
  "Allen",
  "Young",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Mitchell",
  "Carter",
  "Roberts",
  "Turner",
  "Phillips",
  "Campbell",
  "Parker",
  "Evans",
  "Edwards",
  "Collins",
  "Stewart",
  "Morris",
  "Rogers",
  "Reed",
  "Cook",
  "Morgan",
  "Bell",
  "Murphy",
  "Bailey",
  "Rivera",
  "Cooper",
  "Richardson",
  "Cox",
  "Howard",
  "Ward",
  "Peterson",
  "Gray",
  "Ramirez",
  "James",
  "Watson",
  "Brooks",
  "Kelly",
  "Sanders",
  "Price",
  "Bennett",
  "Wood",
  "Barnes",
  "Ross",
  "Henderson",
  "Coleman",
  "Jenkins",
  "Perry",
  "Powell",
  "Long",
  "Patterson",
  "Hughes",
  "Flores",
  "Washington",
  "Butler",
  "Simmons",
];

const postContents = [
  "Just shipped a new feature! 🚀",
  "Working on something exciting today.",
  "Coffee fuels my code ☕",
  "Who else loves debugging at 2am?",
  "Refactoring old code feels so good.",
  "Learning a new framework this week.",
  "Open source contributions are the best!",
  "Just hit a major milestone on my project.",
  "The satisfaction of fixing a bug that's been haunting me.",
  "Team collaboration makes everything better.",
  "Reading through documentation again...",
  "Pro tip: Always write tests first!",
  "Excited about the new API we're building.",
  "Performance optimization is oddly satisfying.",
  "Just discovered a great new library.",
  "Pair programming session was super productive.",
  "Nothing beats clean, readable code.",
  "Deployment day! Fingers crossed 🤞",
  "That feeling when your code works on the first try.",
  "Reviewing PRs and learning from the team.",
  "Working remotely has its perks.",
  "Setting up CI/CD pipelines today.",
  "Database optimization saved the day.",
  "Exploring microservices architecture.",
  "Just finished a great tech talk.",
  "Code review feedback is always valuable.",
  "Scaling challenges keep things interesting.",
  "The best code is code you don't have to write.",
  "Automated testing is a game changer.",
  "Learned something new about async/await today.",
  "Building user-friendly interfaces is an art.",
  "Security should always be a priority.",
  "Loving the TypeScript experience.",
  "REST vs GraphQL - both have their place.",
  "Docker containers make deployment easier.",
  "Monitoring and logging are crucial.",
  "Code comments are documentation.",
  "Accessibility matters in every project.",
  "Version control saves lives.",
  "Agile methodology works when done right.",
];

const commentTemplates = [
  "Great post!",
  "I totally agree with this.",
  "Thanks for sharing!",
  "This is really helpful.",
  "Interesting perspective!",
  "Love this! 🎉",
  "Well said!",
  "Can't wait to try this.",
  "Same here!",
  "Awesome work!",
  "This made my day.",
  "Super insightful.",
  "Thanks for the tip!",
  "Really appreciate this.",
  "Solid advice.",
  "This is gold.",
  "Couldn't agree more.",
  "Great idea!",
  "Nice work!",
  "Keep it up!",
];

function generateUsername(
  firstName: string,
  lastName: string,
  index: number,
): string {
  const variations = [
    `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${index}`,
    `${firstName.toLowerCase()}_${index}`,
    `${lastName.toLowerCase()}${index}`,
  ];
  return variations[index % variations.length];
}

async function main() {
  console.log("🗑️  Cleaning up existing data...");
  await prisma.notification.deleteMany();
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follower.deleteMany();
  await prisma.block.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);
  const TARGET_USERS = 2000;

  console.log(`👥 Creating ${TARGET_USERS} users...`);
  const usersData = [];

  for (let i = 0; i < TARGET_USERS; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const username = generateUsername(firstName, lastName, i);

    const userData: any = {
      username,
      email: `${username}@example.com`,
      firstName,
      lastName,
      password: passwordHash,
    };

    // Make about 5% of users PRO members
    if (i % 20 === 0) {
      userData.plan = Plan.PRO;
      userData.planStatus = "active";
      userData.planStartedAt = new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      );
    }

    usersData.push(userData);
  }

  // Insert users in batches for better performance
  const BATCH_SIZE = 100;
  for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
    await prisma.user.createMany({
      data: usersData.slice(i, i + BATCH_SIZE),
    });
  }

  const users = await prisma.user.findMany();
  console.log(`✅ Created ${users.length} users`);

  // Create posts - about 70% of users create posts with more posts each
  console.log("📝 Creating posts...");
  const postsData = [];
  for (let i = 0; i < users.length; i++) {
    if (i % 10 < 7) {
      // 70% of users
      const numPosts = Math.floor(Math.random() * 12) + 3; // 3-15 posts per active user
      for (let j = 0; j < numPosts; j++) {
        postsData.push({
          authorId: users[i].id,
          content:
            postContents[Math.floor(Math.random() * postContents.length)],
          createdAt: new Date(
            Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000,
          ), // Random date within last 120 days
        });
      }
    }
  }

  for (let i = 0; i < postsData.length; i += BATCH_SIZE) {
    await prisma.post.createMany({
      data: postsData.slice(i, i + BATCH_SIZE),
    });
  }

  const posts = await prisma.post.findMany();
  console.log(`✅ Created ${posts.length} posts`);

  // Create likes - higher engagement with more likes per post
  console.log("❤️  Creating likes...");
  const likesData = [];
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 150) + 20; // 20-170 likes per post
    const likerIndices = new Set<number>();

    while (likerIndices.size < Math.min(numLikes, users.length - 1)) {
      likerIndices.add(Math.floor(Math.random() * users.length));
    }

    for (const index of likerIndices) {
      if (users[index].id !== post.authorId) {
        likesData.push({
          userId: users[index].id,
          postId: post.id,
        });
      }
    }
  }

  for (let i = 0; i < likesData.length; i += BATCH_SIZE) {
    await prisma.like.createMany({
      data: likesData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✅ Created ${likesData.length} likes`);

  // Create comments - significantly more comments per post
  console.log("💬 Creating comments...");
  const commentsData = [];
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 50) + 5; // 5-55 comments per post

    for (let i = 0; i < numComments; i++) {
      const commenterIndex = Math.floor(Math.random() * users.length);
      if (users[commenterIndex].id !== post.authorId) {
        commentsData.push({
          authorId: users[commenterIndex].id,
          postId: post.id,
          content:
            commentTemplates[
              Math.floor(Math.random() * commentTemplates.length)
            ],
          createdAt: new Date(
            post.createdAt.getTime() + Math.random() * 96 * 60 * 60 * 1000,
          ),
        });
      }
    }
  }

  for (let i = 0; i < commentsData.length; i += BATCH_SIZE) {
    await prisma.comment.createMany({
      data: commentsData.slice(i, i + BATCH_SIZE),
    });
  }
  console.log(`✅ Created ${commentsData.length} comments`);

  // Create follower relationships - each user follows more people
  console.log("🤝 Creating follower relationships...");
  const followerPairs = [];
  for (let i = 0; i < users.length; i++) {
    const numFollowing = Math.floor(Math.random() * 150) + 30; // 30-180 follows per user
    const followingIndices = new Set<number>();

    while (followingIndices.size < Math.min(numFollowing, users.length - 1)) {
      const randomIndex = Math.floor(Math.random() * users.length);
      if (randomIndex !== i) {
        followingIndices.add(randomIndex);
      }
    }

    for (const index of followingIndices) {
      followerPairs.push({
        followerId: users[i].id,
        followingId: users[index].id,
      });
    }
  }

  for (let i = 0; i < followerPairs.length; i += BATCH_SIZE) {
    await prisma.follower.createMany({
      data: followerPairs.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }
  console.log(`✅ Created ${followerPairs.length} follower relationships`);

  // Create blocks - more blocks per user
  console.log("🚫 Creating blocks...");
  const blockPairs = [];
  for (let i = 0; i < users.length; i++) {
    const numBlocks = Math.floor(Math.random() * 40) + 10; // 10-50 blocks per user
    const blockedIndices = new Set<number>();

    while (blockedIndices.size < Math.min(numBlocks, users.length - 1)) {
      const randomIndex = Math.floor(Math.random() * users.length);
      if (randomIndex !== i) {
        blockedIndices.add(randomIndex);
      }
    }

    for (const index of blockedIndices) {
      blockPairs.push({
        blockerId: users[i].id,
        blockedId: users[index].id,
      });
    }
  }

  if (blockPairs.length > 0) {
    await prisma.block.createMany({
      data: blockPairs,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Created ${blockPairs.length} blocks`);

  // Create refresh tokens for about 30% of users (active sessions)
  console.log("🔑 Creating refresh tokens...");
  const refreshTokensData = [];
  for (let i = 0; i < users.length; i++) {
    if (i % 3 === 0) {
      // 33% of users
      refreshTokensData.push({
        userId: users[i].id,
        token: crypto.randomBytes(32).toString("hex"),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
    }
  }

  for (let i = 0; i < refreshTokensData.length; i += BATCH_SIZE) {
    await prisma.refreshToken.createMany({
      data: refreshTokensData.slice(i, i + BATCH_SIZE),
    });
  }
  console.log(`✅ Created ${refreshTokensData.length} refresh tokens`);

  // Create notifications - recent activity notifications
  console.log("🔔 Creating notifications...");
  const notificationsData = [];

  // Sample recent likes for notifications
  const recentLikes = await prisma.like.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: { post: true },
  });

  for (const like of recentLikes) {
    if (like.post.authorId !== like.userId) {
      notificationsData.push({
        userId: like.post.authorId,
        type: NotificationType.LIKE,
        relatedUserId: like.userId,
        relatedPostId: like.postId,
        message: "liked your post.",
        createdAt: like.createdAt,
      });
    }
  }

  // Sample recent comments for notifications
  const recentComments = await prisma.comment.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: { post: true },
  });

  for (const comment of recentComments) {
    if (comment.post.authorId !== comment.authorId) {
      notificationsData.push({
        userId: comment.post.authorId,
        type: NotificationType.COMMENT,
        relatedUserId: comment.authorId,
        relatedPostId: comment.postId,
        message: "commented on your post.",
        createdAt: comment.createdAt,
      });
    }
  }

  // Sample recent follows for notifications
  const recentFollows = await prisma.follower.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  for (const follow of recentFollows) {
    notificationsData.push({
      userId: follow.followingId,
      type: NotificationType.NEW_FOLLOWER,
      relatedUserId: follow.followerId,
      message: "started following you.",
      createdAt: follow.createdAt,
    });
  }

  for (let i = 0; i < notificationsData.length; i += BATCH_SIZE) {
    await prisma.notification.createMany({
      data: notificationsData.slice(i, i + BATCH_SIZE),
    });
  }
  console.log(`✅ Created ${notificationsData.length} notifications`);

  // Update post counts
  console.log("📊 Updating post counts...");
  const postIds = posts.map((p) => p.id);
  for (let i = 0; i < postIds.length; i += BATCH_SIZE) {
    const batchIds = postIds.slice(i, i + BATCH_SIZE);

    for (const postId of batchIds) {
      const [likesCount, commentsCount] = await Promise.all([
        prisma.like.count({ where: { postId } }),
        prisma.comment.count({ where: { postId } }),
      ]);

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount, commentsCount },
      });
    }
  }

  console.log("✅ All counts updated");
  console.log("\n🎉 Database seeded successfully!");
  console.log(`📊 Summary:
  - Users: ${users.length}
  - Posts: ${posts.length}
  - Comments: ${commentsData.length}
  - Likes: ${likesData.length}
  - Follows: ${followerPairs.length}
  - Blocks: ${blockPairs.length}
  - Notifications: ${notificationsData.length}
  `);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
