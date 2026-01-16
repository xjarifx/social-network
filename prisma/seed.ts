import { PrismaClient } from '../src/generated/prisma/index.js';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Helper function to create a simple password hash (in production, use bcrypt)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to generate random date in range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Sample data arrays
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Aiden', 'Avery', 'Jackson',
  'Ella', 'Sebastian', 'Scarlett', 'David', 'Grace', 'Joseph', 'Chloe', 'Samuel',
  'Victoria', 'John', 'Riley', 'Owen', 'Aria', 'Jack', 'Lily', 'Luke', 'Aubrey',
  'Jayden', 'Zoey', 'Dylan', 'Hannah', 'Nathan', 'Addison', 'Isaac', 'Nora'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts'
];

const bioTemplates = [
  '🎨 Creative soul | Coffee addict ☕',
  '📚 Book lover | Travel enthusiast ✈️',
  '🎮 Gamer | Tech geek | Code warrior',
  '🏃‍♂️ Fitness freak | Health is wealth 💪',
  '🎵 Music is life | Concert lover 🎸',
  '🍕 Foodie | Always hungry | Restaurant explorer',
  '📸 Photography | Capturing moments 📷',
  '🌍 World traveler | Adventure seeker',
  '🎬 Movie buff | Netflix and chill',
  '🐕 Dog lover | Pawrent to two furbabies',
  '🎭 Theater enthusiast | Drama queen/king',
  '🏊‍♀️ Swimmer | Ocean lover 🌊',
  '🧘‍♀️ Yoga instructor | Finding inner peace',
  '👨‍🍳 Amateur chef | Cooking experiments',
  '🎨 Digital artist | Creating magic',
  '🚴‍♂️ Cyclist | Pedaling through life',
  '📱 Social media guru | Digital native',
  '🌱 Plant parent | Green thumb 🪴',
  '☕ Barista | Coffee connoisseur',
  '🎓 Lifelong learner | Knowledge seeker',
];

const postContents = [
  'Just had the most amazing coffee! ☕️ #MorningVibes',
  'Beautiful sunset today! 🌅 Nature never fails to amaze me.',
  'Starting a new project today! Excited for what\'s to come! 🚀',
  'Weekend vibes! Who else is ready to relax? 😎',
  'Throwback to that amazing vacation! Missing those days... 🏖️',
  'Just finished reading an incredible book! Highly recommend! 📚',
  'Workout complete! Feeling energized! 💪 #FitnessGoals',
  'Trying out a new recipe tonight! Wish me luck! 👨‍🍳',
  'Concert was absolutely incredible! Best night ever! 🎸🎵',
  'Rainy days call for cozy blankets and hot chocolate ☕🌧️',
  'Making progress on my goals! Small steps lead to big changes! 🎯',
  'Anyone else obsessed with this new show? Can\'t stop watching! 📺',
  'Grateful for amazing friends and family! ❤️',
  'New blog post is live! Check it out! Link in bio! ✍️',
  'Monday motivation: You got this! 💼',
  'Just adopted a rescue dog! Meet my new best friend! 🐕',
  'Exploring the city today! So many hidden gems! 🗺️',
  'First day at my new job! Wish me luck! 🎉',
  'Late night coding session! The bugs don\'t stand a chance! 💻',
  'Homemade pizza night! Nothing beats fresh ingredients! 🍕',
  'Morning run complete! Starting the day right! 🏃‍♂️',
  'Art project finished! What do you think? 🎨',
  'Road trip time! Adventure awaits! 🚗',
  'Just hit a new personal record at the gym! 🏋️',
  'Game night with friends! Let the competition begin! 🎮',
  'Meal prep Sunday! Organized for the week! 🥗',
  'Photography walk in the park today! 📷',
  'Learning a new skill! Never too old to grow! 🌱',
  'Friday feeling! Ready for the weekend! 🎉',
  'Sunrise hike was worth the early wake-up! 🌄',
];

const commentContents = [
  'Love this! 😍',
  'So cool! 🔥',
  'Amazing! Keep it up!',
  'This is awesome!',
  'Great post!',
  'I totally agree!',
  'So true! 💯',
  'This made my day!',
  'Thanks for sharing!',
  'Wow! 😮',
  'Beautiful! ✨',
  'Inspiring! 🙌',
  'Can relate! 😂',
  'Absolutely! 👏',
  'Nice one!',
  'Love it! ❤️',
  'You\'re the best!',
  'So good!',
  'Incredible! 🎉',
  'This! 💪',
  'Exactly what I needed to see!',
  'Perfect timing!',
  'Couldn\'t have said it better!',
  'Goals! 🎯',
  'Impressive!',
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  console.log('🧹 Cleaning database...');
  await prisma.activityLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.feedCache.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.postMedia.deleteMany();
  await prisma.post.deleteMany();
  await prisma.media.deleteMany();
  await prisma.block.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const users = [];
  const numUsers = 50;

  for (let i = 0; i < numUsers; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
    const email = `${username}@example.com`;
    
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashPassword('password123'),
        firstName,
        lastName,
        bio: bioTemplates[Math.floor(Math.random() * bioTemplates.length)],
        dateOfBirth: randomDate(new Date('1980-01-01'), new Date('2005-12-31')),
        showBirthYear: Math.random() > 0.3,
        status: Math.random() > 0.95 ? 'inactive' : 'active',
        privacySetting: Math.random() > 0.5 ? 'public' : 'friends_only',
        emailVerified: Math.random() > 0.1,
        lastLoginAt: randomDate(new Date('2025-12-01'), new Date()),
        createdAt: randomDate(new Date('2024-01-01'), new Date('2025-06-01')),
      },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // Create user preferences
  console.log('⚙️ Creating user preferences...');
  for (const user of users) {
    await prisma.userPreference.create({
      data: {
        userId: user.id,
        notificationFriendRequest: Math.random() > 0.2,
        notificationPostLike: Math.random() > 0.3,
        notificationPostComment: Math.random() > 0.2,
        notificationCommentReply: Math.random() > 0.3,
        emailNotifications: Math.random() > 0.4,
        theme: ['light', 'dark', 'system'][Math.floor(Math.random() * 3)] as any,
      },
    });
  }
  console.log(`✅ Created ${users.length} user preferences`);

  // Create sessions
  console.log('🔐 Creating sessions...');
  let sessionCount = 0;
  for (const user of users) {
    if (Math.random() > 0.3) { // 70% of users have active sessions
      const numSessions = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numSessions; i++) {
        await prisma.session.create({
          data: {
            userId: user.id,
            tokenHash: crypto.randomBytes(32).toString('hex'),
            ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            lastUsedAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
          },
        });
        sessionCount++;
      }
    }
  }
  console.log(`✅ Created ${sessionCount} sessions`);

  // Create friendships
  console.log('🤝 Creating friendships...');
  const friendships = [];
  for (let i = 0; i < users.length; i++) {
    const numFriends = Math.floor(Math.random() * 15) + 5; // 5-20 friends
    const friendIndices = new Set<number>();
    
    while (friendIndices.size < Math.min(numFriends, users.length - 1)) {
      const friendIdx = Math.floor(Math.random() * users.length);
      if (friendIdx !== i) {
        friendIndices.add(friendIdx);
      }
    }

    for (const friendIdx of friendIndices) {
      // Check if friendship already exists
      const exists = friendships.some(
        f => (f.userId === users[i].id && f.friendId === users[friendIdx].id) ||
             (f.userId === users[friendIdx].id && f.friendId === users[i].id)
      );

      if (!exists) {
        const status = Math.random() > 0.2 ? 'accepted' : 'pending';
        const createdAt = randomDate(new Date('2024-01-01'), new Date());
        
        const friendship = await prisma.friendship.create({
          data: {
            userId: users[i].id,
            friendId: users[friendIdx].id,
            status,
            actionUserId: status === 'accepted' ? users[friendIdx].id : null,
            acceptedAt: status === 'accepted' ? createdAt : null,
            createdAt,
          },
        });
        friendships.push(friendship);
      }
    }
  }
  console.log(`✅ Created ${friendships.length} friendships`);

  // Create some blocks
  console.log('🚫 Creating blocks...');
  const blockCount = 15;
  for (let i = 0; i < blockCount; i++) {
    const blocker = users[Math.floor(Math.random() * users.length)];
    const blocked = users[Math.floor(Math.random() * users.length)];
    
    if (blocker.id !== blocked.id) {
      try {
        await prisma.block.create({
          data: {
            blockerId: blocker.id,
            blockedId: blocked.id,
            reason: ['Spam', 'Harassment', 'Inappropriate content'][Math.floor(Math.random() * 3)],
            createdAt: randomDate(new Date('2024-06-01'), new Date()),
          },
        });
      } catch (e) {
        // Skip if block already exists
      }
    }
  }
  console.log(`✅ Created blocks`);

  // Create media
  console.log('🖼️ Creating media...');
  const mediaItems = [];
  for (const user of users) {
    // Profile picture
    const profilePic = await prisma.media.create({
      data: {
        userId: user.id,
        type: 'profile_picture',
        url: `https://i.pravatar.cc/300?u=${user.id}`,
        storagePath: `/storage/profile/${user.id}/avatar.jpg`,
        fileSize: Math.floor(Math.random() * 500000) + 50000,
        mimeType: 'image/jpeg',
        width: 300,
        height: 300,
        isActive: true,
        createdAt: user.createdAt,
      },
    });
    mediaItems.push(profilePic);

    // Cover photo
    if (Math.random() > 0.3) {
      const coverPhoto = await prisma.media.create({
        data: {
          userId: user.id,
          type: 'cover_photo',
          url: `https://picsum.photos/seed/${user.id}/1200/400`,
          storagePath: `/storage/cover/${user.id}/cover.jpg`,
          fileSize: Math.floor(Math.random() * 1000000) + 200000,
          mimeType: 'image/jpeg',
          width: 1200,
          height: 400,
          isActive: true,
          createdAt: user.createdAt,
        },
      });
      mediaItems.push(coverPhoto);
    }

    // Post images
    const numPostImages = Math.floor(Math.random() * 10) + 5;
    for (let i = 0; i < numPostImages; i++) {
      const postImage = await prisma.media.create({
        data: {
          userId: user.id,
          type: 'post_image',
          url: `https://picsum.photos/seed/${user.id}-${i}/800/600`,
          storagePath: `/storage/posts/${user.id}/image-${i}.jpg`,
          fileSize: Math.floor(Math.random() * 800000) + 100000,
          mimeType: 'image/jpeg',
          width: 800,
          height: 600,
          isActive: true,
          createdAt: randomDate(user.createdAt, new Date()),
        },
      });
      mediaItems.push(postImage);
    }
  }
  console.log(`✅ Created ${mediaItems.length} media items`);

  // Create posts
  console.log('📝 Creating posts...');
  const posts = [];
  const postImagesOnly = mediaItems.filter(m => m.type === 'post_image');
  
  for (const user of users) {
    const numPosts = Math.floor(Math.random() * 20) + 5; // 5-25 posts per user
    const userPostImages = postImagesOnly.filter(m => m.userId === user.id);
    
    for (let i = 0; i < numPosts; i++) {
      const createdAt = randomDate(user.createdAt, new Date());
      const post = await prisma.post.create({
        data: {
          userId: user.id,
          content: postContents[Math.floor(Math.random() * postContents.length)],
          privacy: Math.random() > 0.3 ? 'friends_only' : 'public',
          likesCount: 0, // Will update after creating likes
          commentsCount: 0, // Will update after creating comments
          sharesCount: Math.floor(Math.random() * 10),
          isEdited: Math.random() > 0.8,
          isDeleted: Math.random() > 0.95,
          isFlagged: Math.random() > 0.98,
          flagCount: Math.random() > 0.98 ? Math.floor(Math.random() * 5) : 0,
          createdAt,
          updatedAt: Math.random() > 0.7 ? randomDate(createdAt, new Date()) : createdAt,
        },
      });
      posts.push(post);

      // Add media to some posts
      if (Math.random() > 0.4 && userPostImages.length > 0) {
        const numImages = Math.min(
          Math.floor(Math.random() * 3) + 1,
          userPostImages.length
        );
        const selectedImages = [...userPostImages]
          .sort(() => Math.random() - 0.5)
          .slice(0, numImages);

        for (let j = 0; j < selectedImages.length; j++) {
          await prisma.postMedia.create({
            data: {
              postId: post.id,
              mediaId: selectedImages[j].id,
              displayOrder: j,
            },
          });
        }
      }
    }
  }
  console.log(`✅ Created ${posts.length} posts`);

  // Create likes
  console.log('❤️ Creating likes...');
  let likeCount = 0;
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 25);
    const likedUserIds = new Set<string>();
    
    for (let i = 0; i < numLikes && likedUserIds.size < users.length; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (!likedUserIds.has(randomUser.id)) {
        await prisma.like.create({
          data: {
            userId: randomUser.id,
            postId: post.id,
            createdAt: randomDate(post.createdAt, new Date()),
          },
        });
        likedUserIds.add(randomUser.id);
        likeCount++;
      }
    }

    // Update post likes count
    await prisma.post.update({
      where: { id: post.id },
      data: { likesCount: likedUserIds.size },
    });
  }
  console.log(`✅ Created ${likeCount} likes`);

  // Create comments
  console.log('💬 Creating comments...');
  let commentCount = 0;
  const allComments = [];
  
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 15);
    
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const comment = await prisma.comment.create({
        data: {
          userId: randomUser.id,
          postId: post.id,
          content: commentContents[Math.floor(Math.random() * commentContents.length)],
          isEdited: Math.random() > 0.9,
          isDeleted: Math.random() > 0.97,
          isFlagged: Math.random() > 0.99,
          createdAt: randomDate(post.createdAt, new Date()),
        },
      });
      allComments.push(comment);
      commentCount++;
    }
  }
  console.log(`✅ Created ${commentCount} comments`);

  // Create comment replies
  console.log('💬 Creating comment replies...');
  let replyCount = 0;
  for (const comment of allComments) {
    if (Math.random() > 0.7) { // 30% of comments get replies
      const numReplies = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < numReplies; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await prisma.comment.create({
          data: {
            userId: randomUser.id,
            postId: comment.postId,
            parentCommentId: comment.id,
            content: commentContents[Math.floor(Math.random() * commentContents.length)],
            createdAt: randomDate(comment.createdAt, new Date()),
          },
        });
        replyCount++;
      }
    }
  }
  console.log(`✅ Created ${replyCount} comment replies`);

  // Update posts comment count
  console.log('🔄 Updating post comment counts...');
  for (const post of posts) {
    const count = await prisma.comment.count({
      where: { postId: post.id, isDeleted: false },
    });
    await prisma.post.update({
      where: { id: post.id },
      data: { commentsCount: count },
    });
  }

  // Create notifications
  console.log('🔔 Creating notifications...');
  let notificationCount = 0;
  
  // Friend request notifications
  for (const friendship of friendships) {
    await prisma.notification.create({
      data: {
        userId: friendship.friendId,
        actorId: friendship.userId,
        type: friendship.status === 'accepted' ? 'friend_accept' : 'friend_request',
        referenceType: 'friendship',
        referenceId: friendship.id,
        isRead: Math.random() > 0.4,
        createdAt: friendship.createdAt,
        readAt: Math.random() > 0.4 ? randomDate(friendship.createdAt, new Date()) : null,
      },
    });
    notificationCount++;
  }

  // Like notifications (sample)
  const likesForNotifications = await prisma.like.findMany({
    take: 200,
    include: { post: true },
  });
  
  for (const like of likesForNotifications) {
    if (like.userId !== like.post.userId) {
      await prisma.notification.create({
        data: {
          userId: like.post.userId,
          actorId: like.userId,
          type: 'post_like',
          referenceType: 'post',
          referenceId: like.postId,
          isRead: Math.random() > 0.5,
          createdAt: like.createdAt,
          readAt: Math.random() > 0.5 ? randomDate(like.createdAt, new Date()) : null,
        },
      });
      notificationCount++;
    }
  }

  // Comment notifications (sample)
  const commentsForNotifications = await prisma.comment.findMany({
    take: 200,
    include: { post: true },
  });
  
  for (const comment of commentsForNotifications) {
    if (comment.userId !== comment.post.userId) {
      await prisma.notification.create({
        data: {
          userId: comment.post.userId,
          actorId: comment.userId,
          type: 'post_comment',
          referenceType: 'comment',
          referenceId: comment.id,
          isRead: Math.random() > 0.5,
          createdAt: comment.createdAt,
          readAt: Math.random() > 0.5 ? randomDate(comment.createdAt, new Date()) : null,
        },
      });
      notificationCount++;
    }
  }
  
  console.log(`✅ Created ${notificationCount} notifications`);

  // Create feed cache
  console.log('📰 Creating feed cache...');
  let feedCacheCount = 0;
  for (const user of users) {
    // Get user's friends
    const userFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { userId: user.id, status: 'accepted' },
          { friendId: user.id, status: 'accepted' },
        ],
      },
    });

    const friendIds = userFriendships.map(f =>
      f.userId === user.id ? f.friendId : f.userId
    );

    // Get recent posts from friends and self
    const relevantPosts = await prisma.post.findMany({
      where: {
        userId: { in: [...friendIds, user.id] },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const post of relevantPosts) {
      await prisma.feedCache.create({
        data: {
          userId: user.id,
          postId: post.id,
          postCreatedAt: post.createdAt,
        },
      });
      feedCacheCount++;
    }
  }
  console.log(`✅ Created ${feedCacheCount} feed cache entries`);

  // Create reports
  console.log('🚩 Creating reports...');
  const reportCount = 25;
  const reportablePostIds = posts.filter(p => Math.random() > 0.9).map(p => p.id);
  const reportableCommentIds = allComments.filter(c => Math.random() > 0.95).map(c => c.id);
  
  for (let i = 0; i < reportCount; i++) {
    const reporter = users[Math.floor(Math.random() * users.length)];
    const reportType = ['post', 'comment', 'user'][Math.floor(Math.random() * 3)];
    let reportedId: string;
    
    if (reportType === 'post' && reportablePostIds.length > 0) {
      reportedId = reportablePostIds[Math.floor(Math.random() * reportablePostIds.length)];
    } else if (reportType === 'comment' && reportableCommentIds.length > 0) {
      reportedId = reportableCommentIds[Math.floor(Math.random() * reportableCommentIds.length)];
    } else {
      reportedId = users[Math.floor(Math.random() * users.length)].id;
    }

    const status = ['pending', 'reviewed', 'action_taken', 'dismissed'][Math.floor(Math.random() * 4)];
    const createdAt = randomDate(new Date('2025-01-01'), new Date());
    
    await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedType: reportType as any,
        reportedId,
        reason: ['spam', 'harassment', 'inappropriate', 'hate_speech', 'other'][Math.floor(Math.random() * 5)] as any,
        description: 'This content violates community guidelines.',
        status: status as any,
        reviewedBy: status !== 'pending' ? users[Math.floor(Math.random() * users.length)].id : null,
        createdAt,
        reviewedAt: status !== 'pending' ? randomDate(createdAt, new Date()) : null,
      },
    });
  }
  console.log(`✅ Created ${reportCount} reports`);

  // Create activity logs
  console.log('📊 Creating activity logs...');
  let activityLogCount = 0;
  const actions: any[] = [
    'login', 'logout', 'post_create', 'post_update', 'post_delete',
    'profile_update', 'friend_request_sent', 'friend_request_accepted',
    'comment_create', 'comment_delete'
  ];
  
  for (const user of users) {
    const numActivities = Math.floor(Math.random() * 30) + 10;
    
    for (let i = 0; i < numActivities; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action,
          ipAddress: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          metadata: {
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
            device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          },
          createdAt: randomDate(user.createdAt, new Date()),
        },
      });
      activityLogCount++;
    }
  }
  console.log(`✅ Created ${activityLogCount} activity logs`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   👥 Users: ${users.length}`);
  console.log(`   🤝 Friendships: ${friendships.length}`);
  console.log(`   📝 Posts: ${posts.length}`);
  console.log(`   🖼️  Media: ${mediaItems.length}`);
  console.log(`   ❤️  Likes: ${likeCount}`);
  console.log(`   💬 Comments: ${commentCount + replyCount}`);
  console.log(`   🔔 Notifications: ${notificationCount}`);
  console.log(`   📰 Feed Cache: ${feedCacheCount}`);
  console.log(`   🚩 Reports: ${reportCount}`);
  console.log(`   📊 Activity Logs: ${activityLogCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
