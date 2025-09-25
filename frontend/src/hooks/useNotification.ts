import { useState, useCallback } from "react";
import {
  getUserNotifications as getUserNotificationsAPI,
  markNotificationAsRead as markNotificationAsReadAPI,
  markAllNotificationsAsRead as markAllNotificationsAsReadAPI,
} from "../services/notifyService";
import type { NotificationSerializer } from "../types/notify.type";
import { toast } from "react-toastify";

export const useNotification = () => {
  const [notifications, setNotifications] = useState<NotificationSerializer[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUserNotificationsAPI();
      setNotifications(data || []);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsReadAPI(notificationId);
      await loadNotifications();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsReadAPI();
      await loadNotifications();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return {
    notifications,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};
