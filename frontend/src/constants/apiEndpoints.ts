// src/constants/apiEndpoints.ts
export const ENDPOINTS = {
  AUTH: {
    REGISTER: "/v1/auth/register",
    LOGIN: "/v1/auth/login",
    FORGOT_PASSWORD: "/v1/reset/forgot-password",
    RESET_PASSWORD: "/v1/reset/reset-password",
  },
  USERS: {
    PROFILE: "/v1/users/profile",
    CHANGE_PASSWORD: "/v1/users/profile/password",
  },
  POSTS: {
    CREATE: "/v1/posts/create",
    UPDATE: (postId: number) => `/v1/posts/update/${postId}`,
    SOFT_DELETE: (postId: number) => `/v1/posts/softDelete/${postId}`,
    AUTHOR_LIST: "/v1/posts/authorPost",
    USER_LIST: "/v1/posts/postUser"
  },
  TAGS: {
    LIST: "/v1/tags/list",
  },
  CATEGORIES: {
    LIST: "/v1/categories/list",
  },
  ADMIN: {
    LIST_PENDING_AUTHORS: "/v1/admin/listAuthor",
    APPROVAL_AUTHOR: (id: number) => `/v1/admin/${id}/approvalAuthor`,
    LIST_POSTS: "/v1/admin/listPost",
    APPROVE_POST: (postId: number) => `/v1/admin/approvalPost/${postId}`,
    LIST_AUTHORS: "/v1/admin/allAuthor",
    POST_DETAIL: (postId: number) => `v1/admin/postDetail/${postId}`,
  },
};
