import { Router } from "express";
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


router.post("/", authenticate, upload.single("image"), createNewPost);

router.get("/feed", authenticate, getPostsFeed);

router.get("/for-you", authenticate, getForYouPostsFeed);

router.get("/", authenticate, getPostsFeed);

router.get("/:postId", authenticateOptional, getPost);

router.patch("/:postId", authenticate, updatePostContent);

router.delete("/:postId", authenticate, deletePostContent);

router.use((err: unknown, _req, res, _next) => {
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
