import api from "../api/apiClient";
import { handleAxiosError } from "../utils/handleError";
import { ENDPOINTS } from "../constants/apiEndpoints";
import type {
  CreateCommentDto,
  CommentSerializer,
} from "../types/comment.type";

export const createComment = async (
  dto: CreateCommentDto
): Promise<CommentSerializer> => {
  try {
    const res = await api.post(ENDPOINTS.COMMENTS.CREATE, dto);
    return res.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};

export const getCommentsByPost = async (
  postId: number
): Promise<CommentSerializer[]> => {
  try {
    const res = await api.get(ENDPOINTS.COMMENTS.BY_POST(postId));
    return res.data.data;
  } catch (error) {
    throw handleAxiosError(error);
  }
};
