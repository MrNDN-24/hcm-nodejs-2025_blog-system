import { useState, useCallback } from "react";
import {
  getListPostsByAuthor,
  getListTags,
  getListCategories,
  createPost,
  softDeletePost,
  updatePost as updatePostAPI,
} from "../services/postService";
import type {
  PostSerializer,
  TagSerializer,
  CategorySerializer,
  CreatePostFormValues,
  CreatePostFormData,
  UpdatePostFormData,
  UpdatePostFormValues,
} from "../types/authorPost.type";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const usePosts = () => {
  const [posts, setPosts] = useState<PostSerializer[]>([]);
  const [tags, setTags] = useState<TagSerializer[]>([]);
  const [categories, setCategories] = useState<CategorySerializer[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation("post");

  // Load posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const postsData = await getListPostsByAuthor();
      setPosts(postsData || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tags & categories (for form)
  const loadTagsAndCategories = useCallback(async () => {
    try {
      const [tagsData, categoriesData] = await Promise.all([
        getListTags(),
        getListCategories(),
      ]);
      setTags(tagsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, []);

  //Create Post
  const createNewPost = async (values: CreatePostFormValues) => {
    try {
      const file = values.image?.[0]?.originFileObj;

      const payload: CreatePostFormData = {
        title: values.title,
        content: values.content,
        category: values.category,
        tags: values.tags,
        file,
      };

      await createPost(payload);
      toast.success(t("create_post_success"));
      await loadPosts();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  const updatePost = async (id: number, values: UpdatePostFormValues) => {
    try {
      const file = values.image?.[0]?.originFileObj;

      const payload: UpdatePostFormData = {
        title: values.title,
        content: values.content,
        category: values.category,
        tags: values.tags,
        file,
        imageUrl: values.imageUrl,
      };

      await updatePostAPI(id, payload);
      toast.success(t("update_post_success"));
      await loadPosts();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  //Soft Delete
  const deletePost = async (postId: number) => {
    try {
      const res = await softDeletePost(postId);
      toast.success(res.data.message);
      await loadPosts();
      return true;
    } catch (err) {
      toast.error((err as Error).message);
      return false;
    }
  };

  return {
    posts,
    tags,
    categories,
    loadPosts,
    loadTagsAndCategories,
    loading,
    createNewPost,
    deletePost,
    updatePost,
  };
};
