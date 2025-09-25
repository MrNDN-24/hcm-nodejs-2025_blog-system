import api from "../api/apiClient";
import { handleAxiosError } from "../utils/handleError";
import { ENDPOINTS } from "../constants/apiEndpoints";

export const getUserNotifications = async () => {
  try {
    const res = await api.get(ENDPOINTS.NOTIFICATIONS.LIST);
    return res.data.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const markNotificationAsRead = async (notificationId: number) => {
  try {
    const res = await api.post(ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const res = await api.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
    return res.data;
  } catch (error) {
    handleAxiosError(error);
  }
};
