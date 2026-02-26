import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import {
  createNewPost,
  getPost,
  updatePostContent,
  deletePostContent,
  getPostsFeed,
  getForYouPostsFeed,
} from "./posts.controller";
import {
  authenticate,
  authenticateOptional,
} from "../../middleware/authenticate.middleware";
import {
  createPostLimiter,
  generalLimiter,
} from "../../middleware/rateLimit.middleware";
import likeRouter from "../likes/likes.routes";
import commentsRouter from "../comments/comments.routes";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      !file.mimetype.startsWith("image/") &&
      !file.mimetype.startsWith("video/")
    ) {
      cb(new Error("Only image or video uploads are allowed"));
      return;
    }
    cb(null, true);
  },
});

// POSTS

/**
 * @openapi
 * /posts:
 *   post:
 *     tags: [Posts]
 *     summary: Create a new post
 *     description: Create a post with optional image/video upload (max 50 MB).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Post text content
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image or video file
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests
 */
router.post(
  "/",
  createPostLimiter,
  authenticate,
  upload.single("image"),
  createNewPost,
);

/**
 * @openapi
 * /posts/feed:
 *   get:
 *     tags: [Posts]
 *     summary: Get following feed
 *     description: Returns paginated posts from users the authenticated user follows.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated feed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/feed", generalLimiter, authenticate, getPostsFeed);

/**
 * @openapi
 * /posts/for-you:
 *   get:
 *     tags: [Posts]
 *     summary: Get "For You" feed
 *     description: Returns a recommended/discovery feed for the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated "for you" feed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/for-you", generalLimiter, authenticate, getForYouPostsFeed);

/**
 * @openapi
 * /posts:
 *   get:
 *     tags: [Posts]
 *     summary: Get all posts (feed alias)
 *     description: Alias for the main feed endpoint.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", generalLimiter, authenticate, getPostsFeed);

/**
 * @openapi
 * /posts/{postId}:
 *   get:
 *     tags: [Posts]
 *     summary: Get a single post
 *     description: Returns a specific post by ID. Authentication is optional.
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid post ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Blocked from viewing this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:postId", generalLimiter, authenticateOptional, getPost);

/**
 * @openapi
 * /posts/{postId}:
 *   patch:
 *     tags: [Posts]
 *     summary: Update a post
 *     description: Update the content of an existing post owned by the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePostBody'
 *     responses:
 *       200:
 *         description: Updated post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:postId", authenticate, updatePostContent);

/**
 * @openapi
 * /posts/{postId}:
 *   delete:
 *     tags: [Posts]
 *     summary: Delete a post
 *     description: Delete a post owned by the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Post deleted
 *       403:
 *         description: Not the post owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:postId", authenticate, deletePostContent);

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (
    err instanceof Error &&
    err.message === "Only image or video uploads are allowed"
  ) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Unable to process upload" });
});

// ----------------------------------------------------------------

// LIKES
router.use("/:postId/likes", likeRouter);

// ----------------------------------------------------------------

// COMMENTS
router.use("/:postId/comments", commentsRouter);

export default router;
