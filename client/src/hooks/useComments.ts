import { useState, useCallback } from "react";
import { commentsAPI } from "../services/api";
import type { Comment as ApiComment } from "../services/api";

interface CommentMeta {
  total: number;
  limit: number;
  offset: number;
}

interface UseCommentsReturn {
  openCommentsPostId: string | null;
  commentsByPost: Record<string, ApiComment[]>;
  commentMetaByPost: Record<string, CommentMeta>;
  editingCommentByPost: Record<string, string | null>;
  commentEditDrafts: Record<string, string>;
  commentDrafts: Record<string, string>;
  commentsLoading: Record<string, boolean>;
  commentsMoreLoading: Record<string, boolean>;
  toggleComments: (postId: string) => Promise<void>;
  handleAddComment: (postId: string) => Promise<void>;
  handleStartEditComment: (postId: string, comment: ApiComment) => void;
  handleCancelEditComment: (postId: string, commentId: string) => void;
  handleSaveEditComment: (postId: string, commentId: string) => Promise<void>;
  handleDeleteComment: (postId: string, commentId: string) => Promise<void>;
  handleLoadMoreComments: (postId: string) => Promise<void>;
  handleCloseComments: () => void;
  setCommentDraft: (postId: string, value: string) => void;
  setCommentEditDraft: (commentId: string, value: string) => void;
  /** Must be called by the consumer to update its posts state reply count */
  onReplyCountChange: ((postId: string, delta: number) => void) | null;
  setOnReplyCountChange: (cb: (postId: string, delta: number) => void) => void;
}

const PAGE_SIZE = 5;

export function useComments(): UseCommentsReturn {
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(
    null,
  );
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, ApiComment[]>
  >({});
  const [commentMetaByPost, setCommentMetaByPost] = useState<
    Record<string, CommentMeta>
  >({});
  const [editingCommentByPost, setEditingCommentByPost] = useState<
    Record<string, string | null>
  >({});
  const [commentEditDrafts, setCommentEditDrafts] = useState<
    Record<string, string>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [commentsLoading, setCommentsLoading] = useState<
    Record<string, boolean>
  >({});
  const [commentsMoreLoading, setCommentsMoreLoading] = useState<
    Record<string, boolean>
  >({});
  const [replyCountCb, setReplyCountCb] = useState<
    ((postId: string, delta: number) => void) | null
  >(null);

  const toggleComments = useCallback(
    async (postId: string) => {
      const nextOpen = openCommentsPostId === postId ? null : postId;
      setOpenCommentsPostId(nextOpen);

      if (nextOpen && !commentsByPost[postId]) {
        try {
          setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
          const response = await commentsAPI.getPostComments(postId, {
            limit: PAGE_SIZE,
            offset: 0,
          });
          setCommentsByPost((prev) => ({
            ...prev,
            [postId]: response.comments,
          }));
          setCommentMetaByPost((prev) => ({
            ...prev,
            [postId]: {
              total: response.total,
              limit: response.limit,
              offset: response.comments.length,
            },
          }));
        } catch (err) {
          console.error("Failed to load comments:", err);
        } finally {
          setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
        }
      }
    },
    [openCommentsPostId, commentsByPost],
  );

  const handleAddComment = useCallback(
    async (postId: string) => {
      const content = (commentDrafts[postId] || "").trim();
      if (!content) return;

      try {
        const newComment = await commentsAPI.createComment(postId, content);
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [newComment, ...(prev[postId] || [])],
        }));
        setCommentMetaByPost((prev) => {
          const current = prev[postId];
          if (!current) {
            return {
              ...prev,
              [postId]: { total: 1, limit: PAGE_SIZE, offset: 1 },
            };
          }
          return {
            ...prev,
            [postId]: {
              ...current,
              total: current.total + 1,
              offset: current.offset + 1,
            },
          };
        });
        setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        replyCountCb?.(postId, 1);
      } catch (err) {
        console.error("Failed to create comment:", err);
      }
    },
    [commentDrafts, replyCountCb],
  );

  const handleStartEditComment = useCallback(
    (postId: string, comment: ApiComment) => {
      setEditingCommentByPost((prev) => ({ ...prev, [postId]: comment.id }));
      setCommentEditDrafts((prev) => ({
        ...prev,
        [comment.id]: comment.content,
      }));
    },
    [],
  );

  const handleCancelEditComment = useCallback(
    (postId: string, commentId: string) => {
      setEditingCommentByPost((prev) => ({ ...prev, [postId]: null }));
      setCommentEditDrafts((prev) => {
        const next = { ...prev };
        delete next[commentId];
        return next;
      });
    },
    [],
  );

  const handleSaveEditComment = useCallback(
    async (postId: string, commentId: string) => {
      const content = (commentEditDrafts[commentId] || "").trim();
      if (!content) return;

      try {
        const updated = await commentsAPI.updateComment(
          postId,
          commentId,
          content,
        );
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).map((c) =>
            c.id === commentId ? { ...c, content: updated.content } : c,
          ),
        }));
        handleCancelEditComment(postId, commentId);
      } catch (err) {
        console.error("Failed to update comment:", err);
      }
    },
    [commentEditDrafts, handleCancelEditComment],
  );

  const handleDeleteComment = useCallback(
    async (postId: string, commentId: string) => {
      try {
        await commentsAPI.deleteComment(postId, commentId);
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
        }));
        setCommentMetaByPost((prev) => {
          const current = prev[postId];
          if (!current) return prev;
          return {
            ...prev,
            [postId]: {
              ...current,
              total: Math.max(0, current.total - 1),
              offset: Math.max(0, current.offset - 1),
            },
          };
        });
        replyCountCb?.(postId, -1);
      } catch (err) {
        console.error("Failed to delete comment:", err);
      }
    },
    [replyCountCb],
  );

  const handleLoadMoreComments = useCallback(
    async (postId: string) => {
      const currentComments = commentsByPost[postId] || [];
      const meta = commentMetaByPost[postId];
      const nextOffset = currentComments.length;
      const limit = meta?.limit ?? PAGE_SIZE;

      if (meta && currentComments.length >= meta.total) return;

      try {
        setCommentsMoreLoading((prev) => ({ ...prev, [postId]: true }));
        const response = await commentsAPI.getPostComments(postId, {
          limit,
          offset: nextOffset,
        });
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), ...response.comments],
        }));
        setCommentMetaByPost((prev) => ({
          ...prev,
          [postId]: {
            total: response.total,
            limit: response.limit,
            offset: nextOffset + response.comments.length,
          },
        }));
      } catch (err) {
        console.error("Failed to load more comments:", err);
      } finally {
        setCommentsMoreLoading((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [commentsByPost, commentMetaByPost],
  );

  const handleCloseComments = useCallback(
    () => setOpenCommentsPostId(null),
    [],
  );

  const setCommentDraft = useCallback((postId: string, value: string) => {
    setCommentDrafts((prev) => ({ ...prev, [postId]: value }));
  }, []);

  const setCommentEditDraft = useCallback(
    (commentId: string, value: string) => {
      setCommentEditDrafts((prev) => ({ ...prev, [commentId]: value }));
    },
    [],
  );

  const setOnReplyCountChange = useCallback(
    (cb: (postId: string, delta: number) => void) => {
      setReplyCountCb(() => cb);
    },
    [],
  );

  return {
    openCommentsPostId,
    commentsByPost,
    commentMetaByPost,
    editingCommentByPost,
    commentEditDrafts,
    commentDrafts,
    commentsLoading,
    commentsMoreLoading,
    toggleComments,
    handleAddComment,
    handleStartEditComment,
    handleCancelEditComment,
    handleSaveEditComment,
    handleDeleteComment,
    handleLoadMoreComments,
    handleCloseComments,
    setCommentDraft,
    setCommentEditDraft,
    setOnReplyCountChange,
  };
}
