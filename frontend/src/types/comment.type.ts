import type { components } from "../types/api";

export type CommentSerializer = components["schemas"]["CommentSerializer"];

export type CreateCommentDto = {
  content: string;
  postId: number;
  parentId?: number;
};
