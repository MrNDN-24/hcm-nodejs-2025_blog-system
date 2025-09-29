import { useState, useCallback } from "react";
import {
  createComment as createCommentAPI,
  getCommentsByPost as getCommentsByPostAPI,
} from "../services/commentService";
import type {
  CreateCommentDto,
  CommentSerializer,
} from "../types/comment.type";
import { toast } from "react-toastify";

export const useComment = (postId: number) => {
  const [comments, setComments] = useState<CommentSerializer[]>([]);
  const [loading, setLoading] = useState(false);
  

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommentsByPostAPI(postId);
      setComments(data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = async (dto: CreateCommentDto) => {
    try {
      await createCommentAPI(dto);
      loadComments();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return {
    comments,
    loading,
    loadComments,
    createComment,
  };
};
