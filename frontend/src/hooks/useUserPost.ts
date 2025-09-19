import { useState, useCallback } from "react";
import { getPostUser } from "../services/postService";
import type { FilterPostDto } from "../types/admin.type";
import type { PostSerializer } from "../types/authorPost.type";
import { toast } from "react-toastify";

export const useUserPost = () => {
  const [posts, setPosts] = useState<PostSerializer[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserPosts = useCallback(async (filter?: FilterPostDto) => {
    setLoading(true);
    try {
      const postsData = await getPostUser(filter);
      setPosts(postsData || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    posts,
    loading,
    loadUserPosts,
  };
};
