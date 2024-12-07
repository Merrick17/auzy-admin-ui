import { useAtom } from 'jotai';
import { notificationsAtom, unreadNotificationsCountAtom } from '../atoms/notifications';
import axios from 'axios';

export const useNotifications = () => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const [unreadCount] = useAtom(unreadNotificationsCountAtom);

  const fetchNotifications = async () => {
    const response = await axios.get('/notifications/user/me');
    setNotifications(response.data);
  };

  const markAsRead = async (id: string) => {
    await axios.patch(`/notifications/${id}/read`);
    setNotifications(
      notifications.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
  };
}; 